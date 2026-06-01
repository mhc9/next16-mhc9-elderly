import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
    const csvPath = path.join(process.cwd(), "data", "screening69_nakhonratchasina.csv");
    
    if (!fs.existsSync(csvPath)) {
        return NextResponse.json({ error: "CSV file not found" }, { status: 404 });
    }

    try {
        const fileContent = fs.readFileSync(csvPath, "utf-8");
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() && !line.startsWith(",,,,"));
        
        if (lines.length < 2) {
            return NextResponse.json({ error: "Empty CSV file" }, { status: 400 });
        }

        const headers = lines[0].split(",");
        const dataRows = lines.slice(1);
        
        // Helper to get index by column name
        const getIdx = (name: string) => headers.indexOf(name);
        
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

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        // Pre-fetch all valid hcodes to avoid foreign key violations
        const validHospitals = await prisma.hospital.findMany({
            select: { hcode: true }
        });
        const validHcodes = new Set(validHospitals.map(h => h.hcode));

        for (const line of dataRows) {
            const parts = line.split(",");
            const hcode = parts[hcodeIdx]?.trim();
            const year = parseInt(parts[yearIdx]?.trim() || "0");

            if (!hcode || !year || hcode.length !== 5 || !validHcodes.has(hcode)) {
                skipCount++;
                if (hcode && !validHcodes.has(hcode)) {
                    errors.push(`Hcode ${hcode} not found in Hospital table`);
                }
                continue;
            }

            const parseVal = (val: string) => parseInt(val?.trim() || "0") || 0;

            try {
                await prisma.summaryReport.upsert({
                    where: {
                        year_hcode: {
                            year,
                            hcode
                        }
                    },
                    update: {
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
                    },
                    create: {
                        year,
                        hcode,
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
                    }
                });
                successCount++;
            } catch (err) {
                errorCount++;
                console.error(`Failed to upsert record for hcode ${hcode}:`, err);
            }
        }

        return NextResponse.json({
            message: "Import completed",
            summary: {
                total: dataRows.length,
                success: successCount,
                skipped: skipCount,
                errors: errorCount
            },
            details: errors.slice(0, 10) // Show first 10 missing hcodes
        });
    } catch (error) {
        console.error("Data import failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
