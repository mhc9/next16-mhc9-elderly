import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req: NextRequest) => {
    const isLoggedIn = !!(req as any).auth
    const { nextUrl } = req

    const isDashboardRoute = nextUrl.pathname.startsWith("/")
    const isApiAiRoute = nextUrl.pathname.startsWith("/api/ai")
    const isSettingsRoute = nextUrl.pathname.startsWith("/settings")
    const isAdminRoute = nextUrl.pathname.startsWith("/admin/users")
    const publicPaths = ['/login', '/register'] // Define public paths

    if (!isLoggedIn && !publicPaths.includes(nextUrl.pathname)) {
        return Response.redirect(new URL("/login", nextUrl))
    }

    if (isLoggedIn && publicPaths.includes(nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/', req.url)); // Redirect logged-in users from public pages
    }

    // Role-based access control for /admin/users
    if (isLoggedIn && isAdminRoute) {
        const user = (req as any).auth?.user
        const isSelf = nextUrl.pathname === `/admin/users/${user?.id}`
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN"

        if (!isAdmin && !isSelf) {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    if (isDashboardRoute || isApiAiRoute || isSettingsRoute) {
        return NextResponse.next()
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}