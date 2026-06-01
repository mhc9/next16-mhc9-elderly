import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req: NextRequest) => {
    const isLoggedIn = !!(req as any).auth
    const { nextUrl } = req

    const isDashboardRoute = nextUrl.pathname.startsWith("/")
    const isApiAiRoute = nextUrl.pathname.startsWith("/api/ai")
    const isSettingsRoute = nextUrl.pathname.startsWith("/settings")
    const publicPaths = ['/login', '/register'] // Define public paths

    if (!isLoggedIn && !publicPaths.includes(nextUrl.pathname)) {
        return Response.redirect(new URL("/login", nextUrl))
    }

    if (isLoggedIn && publicPaths.includes(nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/', req.url)); // Redirect logged-in users from public pages
    }

    if (isDashboardRoute || isApiAiRoute || isSettingsRoute) {
        return NextResponse.next()
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}