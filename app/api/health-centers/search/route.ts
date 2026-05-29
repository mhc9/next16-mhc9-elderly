import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim() ?? "";

        if (q.length < 1) {
            return NextResponse.json({ data: [] });
        }

        const healthCenters = await prisma.healthCenter.findMany({
            where: {
                OR: [
                    { hcode: { contains: q } },
                    { name: { contains: q } },
                ],
            },
            select: {
                hcode: true,
                name: true,
            },
            take: 20,
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ data: healthCenters });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to search health centers" },
            { status: 500 }
        );
    }
}
