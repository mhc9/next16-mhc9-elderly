import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { role: string; hcode: string };

    try {
        const screening = await prisma.screening.findUnique({
            where: { id: parseInt(id) },
            include: {
                person: {
                    include: {
                        hospital: {
                            select: { name: true }
                        },
                        province: { select: { name: true } },
                        district: { select: { name: true } },
                        subdistrict: { select: { name: true } },
                    }
                }
            }
        });

        if (!screening) {
            return NextResponse.json({ error: "Screening not found" }, { status: 404 });
        }

        // Role-based access control
        if (user.role === "USER" && screening.person.hcode !== user.hcode) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ data: screening });
    } catch (error) {
        console.error("Failed to fetch screening:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
