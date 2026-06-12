import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reportId = parseInt(id);

    if (isNaN(reportId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        const report = await prisma.summaryReport.findUnique({
            where: { id: reportId },
            include: {
                hospital: {
                    select: {
                        hcode: true,
                        name: true,
                        province: { select: { name: true } },
                        district: { select: { name: true } },
                    }
                }
            }
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json({ data: report });
    } catch (error) {
        console.error("Failed to fetch summary report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reportId = parseInt(id);
    const user = session.user as { role: string; hcode: string };

    if (isNaN(reportId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { 
            hcode, year, target_population, screened_total, screened_normal, screened_risk,
            care_total, assess_9q_normal, assess_9q_risk, assess_8q_normal, assess_8q_risk,
            care_counseling, care_referral, followup_normal, followup_risk_q12, followup_risk_q3
        } = body;

        // Check permission
        if (user.role === "USER" && user.hcode !== hcode) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedReport = await prisma.summaryReport.update({
            where: { id: reportId },
            data: {
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

        return NextResponse.json({ success: true, data: updatedReport });
    } catch (error) {
        console.error("Failed to update summary report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reportId = parseInt(id);
    const user = session.user as { role: string; hcode: string };

    if (isNaN(reportId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        const report = await prisma.summaryReport.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        // Check permission
        if (user.role === "USER" && user.hcode !== report.hcode) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.summaryReport.delete({
            where: { id: reportId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete summary report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
