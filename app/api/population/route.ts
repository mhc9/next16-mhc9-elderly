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

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { 
            cid, firstname, lastname, birth_date, 
            address, moo, subdistrict_id, district_id, province_id,
            telephone, mobile, email, hcode
        } = body;

        const user = session.user as { role: string; hcode: string };
        
        // Final hcode to use: priority given to user's assigned hcode if not admin
        const finalHcode = user.role === "USER" ? user.hcode : hcode;

        if (!finalHcode) {
            return NextResponse.json({ error: "Hospital code is required" }, { status: 400 });
        }

        // Check if person already exists by CID
        if (cid) {
            const existing = await prisma.person.findUnique({
                where: { cid }
            });
            if (existing) {
                return NextResponse.json({ error: "เลขบัตรประชาชนนี้มีการลงทะเบียนแล้ว" }, { status: 400 });
            }
        }

        const person = await prisma.person.create({
            data: {
                cid,
                firstname,
                lastname,
                birth_date: birth_date ? new Date(birth_date) : null,
                address,
                moo: moo ? parseInt(moo) : null,
                subdistrict_id: subdistrict_id ? parseInt(subdistrict_id) : null,
                district_id: district_id ? parseInt(district_id) : null,
                province_id: province_id ? parseInt(province_id) : null,
                telephone,
                mobile,
                email,
                hcode: finalHcode
            }
        });

        return NextResponse.json({ success: true, data: person });
    } catch (error) {
        console.error("Failed to create person:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

