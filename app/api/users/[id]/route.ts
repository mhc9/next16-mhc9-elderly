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
    const currentUser = session.user as { id: string, role: string };

    // Allow user to see their own profile OR ADMIN/SUPERADMIN to see anyone's
    if (currentUser.id !== id && currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                hcode: true,
                image: true,
                hospital: {
                    select: {
                        name: true,
                        address: true,
                        province: { select: { name: true } },
                        district: { select: { name: true } },
                        subdistrict: { select: { name: true } },
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: user });
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
