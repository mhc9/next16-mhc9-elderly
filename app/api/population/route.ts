import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const hcode = searchParams.get("hcode") || "";

    const user = session.user as { role: string; hcode: string };
    const skip = (page - 1) * limit;

    try {
        const where: any = {};

        // Role-based filtering
        if (user.role === "USER") {
            where.hcode = user.hcode;
        } else if (hcode) {
            where.hcode = hcode;
        }

        // Search filtering
        if (search) {
            where.OR = [
                { firstname: { contains: search } },
                { lastname: { contains: search } },
                { cid: { contains: search } },
            ];
        }

        const [persons, total] = await Promise.all([
            prisma.person.findMany({
                where,
                include: {
                    hospital: {
                        select: { name: true }
                    },
                    province: { select: { name: true } },
                    district: { select: { name: true } },
                    subdistrict: { select: { name: true } }
                },
                skip,
                take: limit,
                orderBy: { created_at: "desc" }
            }),
            prisma.person.count({ where })
        ]);

        return NextResponse.json({
            data: persons,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Failed to fetch persons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
