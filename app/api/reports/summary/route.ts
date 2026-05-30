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
