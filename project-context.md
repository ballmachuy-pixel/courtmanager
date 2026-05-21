# Project Context: CourtManager (Sunset Basketball Academy)
# Last Updated: 2026-05-12

## 🎯 Project Overview
- **Goal**: A premium SaaS platform for managing a Basketball Academy (Sunset Academy).
- **Core Features**: Student registration, attendance tracking, coach management, and reporting.
- **Tone & Style**: Premium Dark Aesthetics (Tailwind 4), Banking-style Dashboard.

## 💎 Diamond Standard v6 (Critical Rules)
1. **Service Layer**: ALL business logic must be in `src/lib/services/`. Actions only call services.
2. **Multi-Tenancy**: Every DB query MUST filter by `academy_id`. NO EXCEPTIONS.
3. **Timezone**: Use `@/lib/utils` for all date logic (ICT Timezone).
4. **Idempotency**: Prevent duplicate check-ins/registrations using upserts or validation logic.

## 🛠 Tech Stack
- **Framework**: Next.js 16.2.2 (App Router, Turbopack).
- **Backend**: Supabase (PostgreSQL, Auth).
- **BMad Method**: Version 6.0 (Integrated Skills in `.agents/skills`).
- **Styling**: Tailwind CSS 4.0+.

## 📍 Current Status (May 12, 2026)
- **Migration**: Project successfully moved from C: to D: drive.
- **Upgrade**: Fully upgraded to BMad v6 framework.
- **Deployment**: Latest code is committed and pushed to `origin main` (GitHub/Vercel).
- **Testing**: Playwright E2E tests are set up in `e2e/03-student-registration.spec.ts`.

## 🤖 Instructions for AI Agents
When starting a new session:
1. Read `.cursorrules` immediately.
2. Refer to this `project-context.md` for background.
3. Check `_bmad-output/planning-artifacts` for detailed roadmaps.
4. Always act as an elite BMad v6 Agent.
