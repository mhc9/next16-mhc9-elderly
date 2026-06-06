import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ districtId: string }> }
) {
    const { districtId } = await params;
    try {
        const subdistricts = await prisma.subdistrict.findMany({
            where: { district_id: parseInt(districtId) },
            orderBy: { name: "asc" }
        });
        return NextResponse.json({ data: subdistricts });
    } catch (error) {
        console.error("Failed to fetch subdistricts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
