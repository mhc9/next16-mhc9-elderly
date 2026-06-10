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
                        screenings: {
                            select: { id: true }
                        }
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

export async function PATCH(
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
        const body = await request.json();
        const { 
            q2_result, q9_score, q9_result, 
            q8_score, q8_result, care_type, care_detail, 
            year, screen_date, care_date, remark,
            screen_date_2, q2_result_2 
        } = body;

        // Check if screening exists and user has permission
        const existing = await prisma.screening.findUnique({
            where: { id: parseInt(id) },
            include: { person: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Screening not found" }, { status: 404 });
        }

        if (user.role === "USER" && existing.person.hcode !== user.hcode) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.screening.update({
            where: { id: parseInt(id) },
            data: {
                ...(q2_result !== undefined && { q2_result }),
                ...(screen_date !== undefined && { screen_date: new Date(screen_date) }),
                ...(q2_result_2 !== undefined && { q2_result_2 }),
                ...(screen_date_2 !== undefined && { screen_date_2: screen_date_2 ? new Date(screen_date_2) : null }),
                ...(q9_score !== undefined && { q9_score }),
                ...(q9_result !== undefined && { q9_result }),
                ...(q8_score !== undefined && { q8_score }),
                ...(q8_result !== undefined && { q8_result }),
                ...(care_type !== undefined && { care_type }),
                ...(care_detail !== undefined && { care_detail }),
                ...(care_date !== undefined && { care_date: care_date ? new Date(care_date) : null }),
                ...(remark !== undefined && { remark }),
                ...(year !== undefined && { year: parseInt(year) }),
            }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Failed to update screening:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
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
        const existing = await prisma.screening.findUnique({
            where: { id: parseInt(id) },
            include: { person: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Screening not found" }, { status: 404 });
        }

        if (user.role === "USER" && existing.person.hcode !== user.hcode) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.screening.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true, message: "Screening deleted successfully" });
    } catch (error) {
        console.error("Failed to delete screening:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
