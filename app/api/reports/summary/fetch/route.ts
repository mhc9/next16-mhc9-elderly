import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const hcode = searchParams.get("hcode");
    const year = searchParams.get("year");

    if (!hcode || !year) {
        return NextResponse.json({ error: "Missing hcode or year" }, { status: 400 });
    }

    const yearInt = parseInt(year);

    try {
        // 1. Get Target Population (Count of persons in this hcode)
        const targetPopulation = await prisma.person.count({
            where: { hcode }
        });

        // 2. Aggregate Screening Data
        const screenings = await prisma.screening.findMany({
            where: {
                year: yearInt,
                person: {
                    hcode: hcode
                }
            }
        });

        // Calculate metrics
        const metrics = {
            target_population: targetPopulation,
            screened_total: screenings.length,
            screened_normal: screenings.filter(s => s.q2_result === false).length,
            screened_risk: screenings.filter(s => s.q2_result === true).length,
            
            assess_9q_normal: screenings.filter(s => s.q9_result === false).length,
            assess_9q_risk: screenings.filter(s => s.q9_result === true).length,
            
            assess_8q_normal: screenings.filter(s => s.q8_result === false).length,
            assess_8q_risk: screenings.filter(s => s.q8_result === true).length,
            
            care_total: screenings.filter(s => s.care_type && s.care_type !== "").length,
            care_counseling: screenings.filter(s => s.care_type === "Counseling").length,
            care_referral: screenings.filter(s => s.care_type === "Referral").length,
            
            // For now, these are 0 as we don't have a way to distinguish follow-up in individual screenings yet
            // or we might need a separate field in Screening model.
            followup_normal: 0,
            followup_risk_q12: 0,
            followup_risk_q3: 0,
        };

        return NextResponse.json({ data: metrics });
    } catch (error) {
        console.error("Failed to fetch aggregated screening data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
