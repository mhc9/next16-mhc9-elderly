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
                        district: { select: { name: true } },
                        province: { select: { name: true } }
                    }
                }
            }
        });

        // ... (Summary Cards, Funnel, Assessments, Care Distribution remain the same)
        const totalTarget = reports.reduce((acc, curr) => acc + curr.target_population, 0);
        const totalScreened = reports.reduce((acc, curr) => acc + curr.screened_total, 0);
        const totalRisk = reports.reduce((acc, curr) => acc + curr.screened_risk, 0);
        const totalCare = reports.reduce((acc, curr) => acc + curr.care_total, 0);

        const screeningCoverage = totalTarget > 0 ? (totalScreened / totalTarget) * 100 : 0;
        const riskDetectionRate = totalScreened > 0 ? (totalRisk / totalScreened) * 100 : 0;
        const careDeliveryRate = totalRisk > 0 ? (totalCare / totalRisk) * 100 : 0;

        const funnel = [
            { name: "เป้าหมาย", value: totalTarget },
            { name: "คัดกรองแล้ว", value: totalScreened },
            { name: "พบความเสี่ยง", value: totalRisk },
            { name: "ได้รับดูแล", value: totalCare },
        ];

        const total9QNormal = reports.reduce((acc, curr) => acc + curr.assess_9q_normal, 0);
        const total9QRisk = reports.reduce((acc, curr) => acc + curr.assess_9q_risk, 0);
        const total8QNormal = reports.reduce((acc, curr) => acc + curr.assess_8q_normal, 0);
        const total8QRisk = reports.reduce((acc, curr) => acc + curr.assess_8q_risk, 0);

        const assessments = [
            { name: "9Q (ภาวะซึมเศร้า)", normal: total9QNormal, risk: total9QRisk },
            { name: "8Q (ความเสี่ยงฆ่าตัวตาย)", normal: total8QNormal, risk: total8QRisk },
        ];

        const totalCounseling = reports.reduce((acc, curr) => acc + curr.care_counseling, 0);
        const totalReferral = reports.reduce((acc, curr) => acc + curr.care_referral, 0);
        
        const careTypes = [
            { name: "การให้คำปรึกษา", value: totalCounseling },
            { name: "การส่งต่อ", value: totalReferral },
        ];

        // 5. Regional (District) Performance
        // Group by district AND include province
        const districtMap = new Map();
        const provinceSet = new Set<string>();

        reports.forEach(report => {
            const districtName = report.hospital?.district?.name || "ไม่ระบุ";
            const provinceName = report.hospital?.province?.name || "ไม่ระบุ";
            
            if (report.hospital?.province?.name) {
                provinceSet.add(report.hospital.province.name);
            }

            const key = `${provinceName}-${districtName}`;
            if (!districtMap.has(key)) {
                districtMap.set(key, {
                    name: districtName,
                    province: provinceName,
                    target: 0,
                    screened: 0,
                    risk: 0,
                    care: 0
                });
            }
            const d = districtMap.get(key);
            d.target += report.target_population;
            d.screened += report.screened_total;
            d.risk += report.screened_risk;
            d.care += report.care_total;
        });

        const districts = Array.from(districtMap.values());
        const provinces = Array.from(provinceSet).sort();

        // 6. Top 5 Hospitals by Coverage
        const topScreenings = reports
            .map(report => ({
                hcode: report.hcode,
                name: report.hospital?.name || "ไม่ระบุ",
                district: report.hospital?.district?.name || "ไม่ระบุ",
                province: report.hospital?.province?.name || "ไม่ระบุ",
                target: report.target_population,
                screened: report.screened_total,
                coverage: report.target_population > 0 ? (report.screened_total / report.target_population * 100) : 0
            }))
            .sort((a, b) => b.coverage - a.coverage)
            .slice(0, 5);

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
                districts,
                provinces,
                topScreenings
            }
        });

    } catch (error) {
        console.error("Dashboard data fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
