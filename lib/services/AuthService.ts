import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { LoginInput, RegisterInput } from "@/lib/types/auth";

export class AuthService {
    async login(data: LoginInput) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        return user;
    }

    async register(data: RegisterInput) {
        const { email, password, name, hcode } = data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                hcode,
                role: "USER",
            },
        });

        return user;
    }
}

export const authService = new AuthService();
