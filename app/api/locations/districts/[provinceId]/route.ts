import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ provinceId: string }> }
) {
    const { provinceId } = await params;
    try {
        const districts = await prisma.district.findMany({
            where: { province_id: parseInt(provinceId) },
            orderBy: { name: "asc" }
        });
        return NextResponse.json({ data: districts });
    } catch (error) {
        console.error("Failed to fetch districts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
