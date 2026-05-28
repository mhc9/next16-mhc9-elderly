import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        id: number; // match your database type
        role: string;
        employee_id?: number;
        access_token?: string;
    }

    interface Session {
        userId: string;
        user: User & DefaultSession["user"];
    }
}