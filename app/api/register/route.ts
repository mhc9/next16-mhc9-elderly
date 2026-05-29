import { NextResponse } from "next/server";
import { authService } from "@/lib/services/AuthService";
import { registerSchema } from "@/lib/types/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedFields = registerSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json(
                { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const user = await authService.register(validatedFields.data);

        return NextResponse.json(
            { message: "User registered successfully", user: { id: user.id, email: user.email, name: user.name } },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
