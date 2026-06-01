import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        id: string;
        role: string;
        hcode?: string | null;
    }

    interface Session {
        user: User & DefaultSession["user"];
    }

    interface JWT {
        id: string;
        role: string;
        hcode?: string | null;
    }
    }