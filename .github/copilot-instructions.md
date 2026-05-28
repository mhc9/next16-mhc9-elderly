# Copilot instructions for this repository

Purpose

Short guidance for Copilot sessions: build, lint, architecture and repo-specific conventions.

Build / Run / Lint

- Development server: npm run dev
- Build production: npm run build
- Start production server: npm start
- Lint: npm run lint -- .
  - Lint a single file: npm run lint -- app/page.tsx
- Tests: No test script is configured in package.json.

High-level architecture

- Next.js 16 (app router) TypeScript project using the app/ directory.
- Root layout: app/layout.tsx (fonts, html/body wrappers, globals.css).
- app/page.tsx is a client component ("use client") rendering the dashboard UI.
- Charts use recharts; icons from lucide-react; mock data from '@/lib/data-mock'.
- TailwindCSS for styling (postcss.config.mjs, tailwind plugin).
- TypeScript is strict; path alias @/* -> project root (see tsconfig.json).

Key conventions

- Use a default indentation of 4 spaces for the entire project.
- Files requiring client-side behavior have "use client" at the top.
- Import alias: '@/...' resolves to project root; prefer it for app-local modules.
- Lint: `npm run lint -- <path>` forwards args to eslint; use it to lint single files.
- AI/agent docs: consult CLAUDE.md and AGENTS.md for project-specific guidance.
- Next16 note: see CLAUDE.md header about Next16 differences and `node_modules/next/dist/docs/` for breaking changes.

Files to consult

- README.md (basic run instructions)
- CLAUDE.md, AGENTS.md (assistant/agent guidance)
- eslint.config.mjs, tsconfig.json, postcss.config.mjs (rules/configs)

If you want, I can also add lint/test scripts (e.g., `npm run test`) or configure an MCP server for browser tests.
