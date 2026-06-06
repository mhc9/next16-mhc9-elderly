import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const provinces = await prisma.province.findMany({
            orderBy: { name: "asc" }
        });
        return NextResponse.json({ data: provinces });
    } catch (error) {
        console.error("Failed to fetch provinces:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
