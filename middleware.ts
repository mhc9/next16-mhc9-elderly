import { NextRequest } from "next/server"
import { auth } from "@/auth"

export default auth((req: NextRequest) => {
    const isLoggedIn = !!(req as any).auth
    const { nextUrl } = req
    console.log((req as any).auth)

    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")
    const isApiAiRoute = nextUrl.pathname.startsWith("/api/ai")
    const isSettingsRoute = nextUrl.pathname.startsWith("/settings")

    if (isDashboardRoute || isApiAiRoute || isSettingsRoute) {
        if (!isLoggedIn) {
            return Response.redirect(new URL("/login", nextUrl))
        }
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}