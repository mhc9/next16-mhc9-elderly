import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearStr = searchParams.get("year") || "2569";
    const year = parseInt(yearStr);

    try {
        // Fetch all summary reports for the given year
        const reports = await prisma.summaryReport.findMany({
            where: { year },
            include: {
                hospital: {
                    select: {
                        name: true,
                        district: { select: { name: true } }
                    }
                }
            }
        });

        // 1. Calculate Summary Cards Data
        const totalTarget = reports.reduce((acc, curr) => acc + curr.target_population, 0);
        const totalScreened = reports.reduce((acc, curr) => acc + curr.screened_total, 0);
        const totalRisk = reports.reduce((acc, curr) => acc + curr.screened_risk, 0);
        const totalCare = reports.reduce((acc, curr) => acc + curr.care_total, 0);

        const screeningCoverage = totalTarget > 0 ? (totalScreened / totalTarget) * 100 : 0;
        const riskDetectionRate = totalScreened > 0 ? (totalRisk / totalScreened) * 100 : 0;
        const careDeliveryRate = totalRisk > 0 ? (totalCare / totalRisk) * 100 : 0;

        // 2. Screening Funnel
        const funnel = [
            { name: "เป้าหมาย", value: totalTarget },
            { name: "คัดกรองแล้ว", value: totalScreened },
            { name: "พบความเสี่ยง", value: totalRisk },
            { name: "ได้รับดูแล", value: totalCare },
        ];

        // 3. Assessment Risks
        const total9QNormal = reports.reduce((acc, curr) => acc + curr.assess_9q_normal, 0);
        const total9QRisk = reports.reduce((acc, curr) => acc + curr.assess_9q_risk, 0);
        const total8QNormal = reports.reduce((acc, curr) => acc + curr.assess_8q_normal, 0);
        const total8QRisk = reports.reduce((acc, curr) => acc + curr.assess_8q_risk, 0);

        const assessments = [
            { name: "9Q (ภาวะซึมเศร้า)", normal: total9QNormal, risk: total9QRisk },
            { name: "8Q (ความเสี่ยงฆ่าตัวตาย)", normal: total8QNormal, risk: total8QRisk },
        ];

        // 4. Care Distribution
        const totalCounseling = reports.reduce((acc, curr) => acc + curr.care_counseling, 0);
        const totalReferral = reports.reduce((acc, curr) => acc + curr.care_referral, 0);
        
        const careTypes = [
            { name: "การให้คำปรึกษา", value: totalCounseling },
            { name: "การส่งต่อ", value: totalReferral },
        ];

        // 5. Regional (District) Performance
        // Group by district
        const districtMap = new Map();
        reports.forEach(report => {
            const districtName = report.hospital?.district?.name || "ไม่ระบุ";
            if (!districtMap.has(districtName)) {
                districtMap.set(districtName, {
                    name: districtName,
                    target: 0,
                    screened: 0,
                    risk: 0,
                    care: 0
                });
            }
            const d = districtMap.get(districtName);
            d.target += report.target_population;
            d.screened += report.screened_total;
            d.risk += report.screened_risk;
            d.care += report.care_total;
        });

        const districts = Array.from(districtMap.values());

        return NextResponse.json({
            data: {
                summary: [
                    { label: "ประชากรเป้าหมาย", value: totalTarget, suffix: "คน", icon: "Users" },
                    { label: "ความครอบคลุมการคัดกรอง", value: parseFloat(screeningCoverage.toFixed(2)), suffix: "%", icon: "ClipboardCheck" },
                    { label: "อัตราการพบความเสี่ยง", value: parseFloat(riskDetectionRate.toFixed(2)), suffix: "%", icon: "AlertTriangle" },
                    { label: "อัตราการได้รับการดูแล", value: parseFloat(careDeliveryRate.toFixed(2)), suffix: "%", icon: "HeartPulse" },
                ],
                funnel,
                assessments,
                careTypes,
                districts
            }
        });

    } catch (error) {
        console.error("Dashboard data fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
