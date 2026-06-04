import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { role: string; hcode: string };
    const role = user.role;
    const userHcode = user.hcode;

    try {
        let reports;
        if (role === "ADMIN" || role === "SUPERADMIN") {
            reports = await prisma.summaryReport.findMany({
                include: {
                    hospital: {
                        select: {
                            name: true,
                            province: { select: { name: true } },
                            district: { select: { name: true } },
                        }
                    }
                },
                orderBy: [
                    { year: "desc" },
                    { hcode: "asc" }
                ]
            });
        } else {
            // Regular user sees only their hospital
            if (!userHcode) {
                return NextResponse.json({ data: [] });
            }
            reports = await prisma.summaryReport.findMany({
                where: { hcode: userHcode },
                include: {
                    hospital: {
                        select: {
                            name: true,
                            province: { select: { name: true } },
                            district: { select: { name: true } },
                        }
                    }
                },
                orderBy: { year: "desc" }
            });
        }

        return NextResponse.json({ data: reports });
    } catch (error) {
        console.error("Failed to fetch summary reports:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { role: string; hcode: string };
    const { 
        hcode, year, target_population, screened_total, screened_normal, screened_risk,
        care_total, assess_9q_normal, assess_9q_risk, assess_8q_normal, assess_8q_risk,
        care_counseling, care_referral, followup_normal, followup_risk_q12, followup_risk_q3
    } = await req.json();

    // Permission check
    // ADMIN/SUPERADMIN can add for any hospital. USER can only add for their own hcode.
    if (user.role === "USER" && user.hcode !== hcode) {
        return NextResponse.json({ error: "Forbidden: You can only manage reports for your assigned hospital" }, { status: 403 });
    }

    if (!hcode || !year) {
        return NextResponse.json({ error: "Missing required fields: hcode and year" }, { status: 400 });
    }

    try {
        const report = await prisma.summaryReport.upsert({
            where: {
                year_hcode: {
                    year: parseInt(year.toString()),
                    hcode: hcode
                }
            },
            update: {
                target_population: parseInt(target_population || 0),
                screened_total: parseInt(screened_total || 0),
                screened_normal: parseInt(screened_normal || 0),
                screened_risk: parseInt(screened_risk || 0),
                care_total: parseInt(care_total || 0),
                assess_9q_normal: parseInt(assess_9q_normal || 0),
                assess_9q_risk: parseInt(assess_9q_risk || 0),
                assess_8q_normal: parseInt(assess_8q_normal || 0),
                assess_8q_risk: parseInt(assess_8q_risk || 0),
                care_counseling: parseInt(care_counseling || 0),
                care_referral: parseInt(care_referral || 0),
                followup_normal: parseInt(followup_normal || 0),
                followup_risk_q12: parseInt(followup_risk_q12 || 0),
                followup_risk_q3: parseInt(followup_risk_q3 || 0),
            },
            create: {
                year: parseInt(year.toString()),
                hcode: hcode,
                target_population: parseInt(target_population || 0),
                screened_total: parseInt(screened_total || 0),
                screened_normal: parseInt(screened_normal || 0),
                screened_risk: parseInt(screened_risk || 0),
                care_total: parseInt(care_total || 0),
                assess_9q_normal: parseInt(assess_9q_normal || 0),
                assess_9q_risk: parseInt(assess_9q_risk || 0),
                assess_8q_normal: parseInt(assess_8q_normal || 0),
                assess_8q_risk: parseInt(assess_8q_risk || 0),
                care_counseling: parseInt(care_counseling || 0),
                care_referral: parseInt(care_referral || 0),
                followup_normal: parseInt(followup_normal || 0),
                followup_risk_q12: parseInt(followup_risk_q12 || 0),
                followup_risk_q3: parseInt(followup_risk_q3 || 0),
            }
        });

        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        console.error("Failed to save summary report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
