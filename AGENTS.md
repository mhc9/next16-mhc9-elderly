<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Coding Standards
- **Indentation**: Use exactly 4 spaces for indentation in all files (TSX, TS, CSS, JSON, MD).

# Auth & AI Provider Configuration
- This project uses NextAuth.js for authentication.
- Auth route (app router): `app/api/auth/[...nextauth]/route.ts`.
- OAuth providers configured: Google, GitHub, Discord (via env vars).
- Middleware at `proxy.ts` protects `/dashboard/*`, `/api/ai/*`, `/settings/*`.
- Use `useSession()` / `signIn()` / `signOut()` from `next-auth/react` client-side.
- AI provider API keys (OpenAI, Anthropic, Google AI, etc.) stored server-side in `.env.local`.
<!-- END:nextjs-agent-rules -->
