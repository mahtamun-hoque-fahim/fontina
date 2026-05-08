# fontina

Font to WOFF2 converter. Drop any font → get web-ready WOFF2 instantly.

## Stack

- Next.js 16 App Router (TypeScript)
- Tailwind CSS v4
- fonttools (Python) — server-side conversion
- Vercel (primary) · Cloudflare Pages (secondary)

## Prerequisites

- Node.js 18+
- Python 3 + fonttools (`pip install fonttools`)

## Setup

```bash
git clone https://github.com/mahtamun-hoque-fahim/fontina.git
cd fontina
npm install
cp .env.example .env.local
npm run dev
```

## Env vars

See `.env.example`. No required vars for local dev.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Deploy

**Vercel:** Connect repo → auto-deploy. Ensure Python + fonttools available.  
Add `requirements.txt` to repo root so Vercel installs fonttools at build time.

**Cloudflare Pages:** Conversion API uses Node.js `child_process` — not Edge compatible. API must be served from Vercel.

## Folder structure

```
src/
  app/           ← Pages + API routes
  components/    ← UI sections
  types/         ← Shared TypeScript types
```

See `PLANNER.md` for full technical details.
