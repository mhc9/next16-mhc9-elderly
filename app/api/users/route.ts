import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { role: string; hcode: string };
    
    // Only ADMIN and SUPERADMIN can view all users
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                hcode: true,
                hospital: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json({ data: users });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { role: string };
    
    // Only ADMIN and SUPERADMIN can create users
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { email, password, name, hcode, role } = body;

        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                hcode,
                role,
            },
        });

        return NextResponse.json({ 
            message: "User created successfully", 
            data: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } 
        }, { status: 201 });

    } catch (error) {
        console.error("Failed to create user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
