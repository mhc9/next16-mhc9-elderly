import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim() ?? "";

        if (q.length < 1) {
            return NextResponse.json({ data: [] });
        }

        const hospitals = await prisma.hospital.findMany({
            where: {
                OR: [
                    { hcode: { contains: q } },
                    { name: { contains: q } },
                ],
            },
            select: {
                hcode: true,
                name: true,
                province: {
                    select: {
                        name: true,
                    },
                },
                district: {
                    select: {
                        name: true,
                    },
                },
            },
            take: 100, // Fetch more to allow for filtering
            orderBy: { name: "asc" },
        });

        // Filter hospitals that have hcode value length more than 5 digits out
        const filteredHospitals = hospitals
            .filter(h => h.hcode.length <= 5)
            .slice(0, 20);

        return NextResponse.json({ data: filteredHospitals });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to search health centers" },
            { status: 500 }
        );
    }
}
