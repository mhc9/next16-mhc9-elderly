import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    ...authConfig,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.employee_id = (user as any).employee_id;
                token.healthCenterHcode = (user as any).healthCenterHcode;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).employee_id = token.employee_id;
                (session.user as any).healthCenterHcode = token.healthCenterHcode;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
});