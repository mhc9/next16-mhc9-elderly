import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim() ?? "";
        const provinceId = searchParams.get("provinceId") || searchParams.get("province_id");
        const districtId = searchParams.get("districtId") || searchParams.get("district_id");

        // If no query and no location filters, return empty
        if (q.length < 1 && !provinceId && !districtId) {
            return NextResponse.json({ data: [] });
        }

        const where: any = {};

        if (q.length > 0) {
            where.OR = [
                { hcode: { contains: q } },
                { name: { contains: q } },
            ];
        }

        if (provinceId) {
            where.province_id = parseInt(provinceId);
        }

        if (districtId) {
            where.district_id = parseInt(districtId);
        }

        const hospitals = await prisma.hospital.findMany({
            where,
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
            .filter((h: any) => h.hcode.length <= 5)
            .slice(0, 20);

        return NextResponse.json({ data: filteredHospitals });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to search health centers" },
            { status: 500 }
        );
    }
}
