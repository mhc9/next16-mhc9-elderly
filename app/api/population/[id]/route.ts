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
    const pid = parseInt(id);

    if (isNaN(pid)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        const person = await prisma.person.findUnique({
            where: { pid },
            include: {
                hospital: true,
                province: true,
                district: true,
                subdistrict: true,
                screenings: {
                    orderBy: { screen_date: "desc" }
                }
            }
        });

        if (!person) {
            return NextResponse.json({ error: "Person not found" }, { status: 404 });
        }

        return NextResponse.json(person);
    } catch (error) {
        console.error("Failed to fetch person detail:", error);
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
    const pid = parseInt(id);

    if (isNaN(pid)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { 
            cid, firstname, lastname, birth_date, 
            address, moo, road, zipcode, subdistrict_id, district_id, province_id,
            telephone, mobile, email, hcode
        } = body;

        const updatedPerson = await prisma.person.update({
            where: { pid },
            data: {
                cid,
                firstname,
                lastname,
                birth_date: birth_date ? new Date(birth_date) : null,
                address,
                moo: moo ? parseInt(moo) : null,
                road,
                zipcode,
                subdistrict_id: subdistrict_id ? parseInt(subdistrict_id) : null,
                district_id: district_id ? parseInt(district_id) : null,
                province_id: province_id ? parseInt(province_id) : null,
                telephone,
                mobile,
                email,
                hcode
            }
        });

        return NextResponse.json({ success: true, data: updatedPerson });
    } catch (error) {
        console.error("Failed to update person:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
