import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();
    
    // Check permission
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
            return NextResponse.json({ error: "ไฟล์ว่างหรือไม่มีข้อมูล" }, { status: 400 });
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        const dataRows = lines.slice(1);
        
        // Helper to get index by column name
        const getIdx = (name: string) => headers.indexOf(name.toLowerCase());
        
        const hcodeIdx = getIdx("hcode");
        const yearIdx = getIdx("year");
        const targetIdx = getIdx("target_population");
        const screenedTotalIdx = getIdx("screened_total");
        const screenedNormalIdx = getIdx("screened_normal");
        const screenedRiskIdx = getIdx("screened_risk");
        const careTotalIdx = getIdx("care_total");
        const assess9qNormalIdx = getIdx("assess_9q_normal");
        const assess9qRiskIdx = getIdx("assess_9q_risk");
        const assess8qNormalIdx = getIdx("assess_8q_normal");
        const assess8qRiskIdx = getIdx("assess_8q_risk");
        const careCounselingIdx = getIdx("care_counseling");
        const careReferralIdx = getIdx("care_referral");
        const followupNormalIdx = getIdx("followup_normal");
        const followupRiskQ12Idx = getIdx("followup_risk_q12");
        const followupRiskQ3Idx = getIdx("followup_risk_q3");

        // Validate headers
        if (hcodeIdx === -1 || yearIdx === -1) {
            return NextResponse.json({ error: "รูปแบบหัวตารางไม่ถูกต้อง ต้องมี hcode และ year" }, { status: 400 });
        }

        let createdCount = 0;
        let updatedCount = 0;
        const errors: string[] = [];

        // Pre-fetch all valid hcodes
        const validHospitals = await prisma.hospital.findMany({
            select: { hcode: true }
        });
        const validHcodes = new Set(validHospitals.map(h => h.hcode));

        for (let i = 0; i < dataRows.length; i++) {
            const line = dataRows[i];
            const parts = line.split(",").map(p => p.trim());
            const hcode = parts[hcodeIdx];
            const yearStr = parts[yearIdx];
            const year = parseInt(yearStr || "0");

            if (!hcode || !year) {
                errors.push(`แถวที่ ${i + 2}: ข้อมูล hcode หรือ year ว่าง`);
                continue;
            }

            if (!validHcodes.has(hcode)) {
                errors.push(`แถวที่ ${i + 2}: รหัสหน่วยบริการ ${hcode} ไม่พบในระบบ`);
                continue;
            }

            const parseVal = (val: string) => parseInt(val) || 0;

            try {
                const existing = await prisma.summaryReport.findUnique({
                    where: {
                        year_hcode: { year, hcode }
                    }
                });

                const data = {
                    target_population: parseVal(parts[targetIdx]),
                    screened_total: parseVal(parts[screenedTotalIdx]),
                    screened_normal: parseVal(parts[screenedNormalIdx]),
                    screened_risk: parseVal(parts[screenedRiskIdx]),
                    care_total: parseVal(parts[careTotalIdx]),
                    assess_9q_normal: parseVal(parts[assess9qNormalIdx]),
                    assess_9q_risk: parseVal(parts[assess9qRiskIdx]),
                    assess_8q_normal: parseVal(parts[assess8qNormalIdx]),
                    assess_8q_risk: parseVal(parts[assess8qRiskIdx]),
                    care_counseling: parseVal(parts[careCounselingIdx]),
                    care_referral: parseVal(parts[careReferralIdx]),
                    followup_normal: parseVal(parts[followupNormalIdx]),
                    followup_risk_q12: parseVal(parts[followupRiskQ12Idx]),
                    followup_risk_q3: parseVal(parts[followupRiskQ3Idx]),
                };

                if (existing) {
                    await prisma.summaryReport.update({
                        where: { id: existing.id },
                        data
                    });
                    updatedCount++;
                } else {
                    await prisma.summaryReport.create({
                        data: {
                            year,
                            hcode,
                            ...data
                        }
                    });
                    createdCount++;
                }
            } catch (err) {
                errors.push(`แถวที่ ${i + 2}: เกิดข้อผิดพลาดทางเทคนิค (${hcode})`);
                console.error(`Error processing row ${i + 2}:`, err);
            }
        }

        return NextResponse.json({
            message: errors.length > 0 ? "อัปโหลดเสร็จสิ้น แต่พบข้อผิดพลาดบางส่วน" : "อัปโหลดข้อมูลสำเร็จ",
            details: {
                total: dataRows.length,
                created: createdCount,
                updated: updatedCount,
                errors: errors
            }
        });

    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดในการประมวลผลไฟล์" }, { status: 500 });
    }
}
