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
    const pid = searchParams.get("pid"); // Filter by person id if provided

    const user = session.user as { role: string; hcode: string };
    const skip = (page - 1) * limit;

    try {
        const where: any = {};

        // Role-based filtering via person's hcode
        if (user.role === "USER") {
            where.person = {
                hcode: user.hcode
            };
        }

        // Filter by person if pid is provided
        if (pid) {
            where.person_id = parseInt(pid);
        }

        // Search filtering (searching by person name or cid)
        if (search) {
            where.person = {
                ...(where.person || {}),
                OR: [
                    { firstname: { contains: search } },
                    { lastname: { contains: search } },
                    { cid: { contains: search } },
                ]
            };
        }

        const [screenings, total] = await Promise.all([
            prisma.screening.findMany({
                where,
                include: {
                    person: {
                        include: {
                            hospital: {
                                select: { name: true }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { screen_date: "desc" }
            }),
            prisma.screening.count({ where })
        ]);

        return NextResponse.json({
            data: screenings,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Failed to fetch screenings:", error);
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
            person_id, q2_result, q9_score, q9_result, 
            q8_score, q8_result, care_type, care_detail, 
            year, screen_date, care_date, remark,
            screen_date_2, q2_result_2 
        } = body;

        if (!person_id || year === undefined) {
            return NextResponse.json({ error: "Person ID and Year are required" }, { status: 400 });
        }

        const screening = await prisma.screening.create({
            data: {
                person_id: parseInt(person_id),
                year: parseInt(year),
                screen_date: screen_date ? new Date(screen_date) : undefined,
                q2_result: q2_result,
                screen_date_2: screen_date_2 ? new Date(screen_date_2) : null,
                q2_result_2: q2_result_2,
                q9_score: q9_score !== null ? parseInt(q9_score) : null,
                q9_result: q9_result,
                q8_score: q8_score !== null ? parseInt(q8_score) : null,
                q8_result: q8_result,
                care_date: care_date ? new Date(care_date) : null,
                care_type: care_type,
                care_detail: care_detail,
                remark: remark,
            },
        });

        return NextResponse.json({ success: true, data: screening });
    } catch (error) {
        console.error("Failed to create screening:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
