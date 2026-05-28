import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

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
