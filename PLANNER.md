# PLANNER.md — fontina

## Project Overview

**fontina** is a font format converter SaaS. Users drop TTF, OTF, EOT, or WOFF fonts and instantly receive optimized WOFF2 files — the universal web font format. No signup, no storage, no tracking.

**Target user:** Frontend developers, designers, and anyone who needs to serve self-hosted fonts on the web.

**Key value:** Zero-friction conversion. Upload → convert → download in under 5 seconds.

---

## Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (TypeScript) |
| Styling | Tailwind CSS v4 |
| Conversion | fonttools (Python, server-side subprocess) |
| Deployment | Vercel (primary), Cloudflare Pages (secondary) |
| Database | None at launch — stateless |
| Auth | None at launch |

**Folder structure:**
```
src/
  app/
    page.tsx              ← Homepage (client component, file state)
    layout.tsx            ← Root layout + fonts + metadata
    globals.css           ← Design tokens + global styles
    api/
      convert/
        route.ts          ← POST /api/convert — core conversion endpoint
  components/
    sections/
      Header.tsx
      DropZone.tsx
      ConversionQueue.tsx
      Footer.tsx
  types/
    index.ts              ← FontFile, ConversionStatus types
```

---

## User Flow

1. User lands on `/`
2. User drops font files into `<DropZone>` (or clicks to browse)
3. Files appear in `<ConversionQueue>` with status `queued`
4. User clicks **Convert all** → each file POSTs to `/api/convert`
5. API writes file to tmp, runs `fonttools` Python script, returns WOFF2 blob
6. User sees per-file download button + **Download all**
7. Temp files cleaned from server immediately after response

---

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/convert` | None | Accepts `multipart/form-data` with `font` field. Returns WOFF2 blob. |

**Request:**
- `Content-Type: multipart/form-data`
- Field: `font` — the font file (max 10MB)
- Accepted formats: `.ttf`, `.otf`, `.eot`, `.woff`, `.woff2`

**Response:**
- `200`: `font/woff2` binary stream with `Content-Disposition: attachment`
- `400`: `{ error: string }` — invalid file / format / size
- `500`: `{ error: string }` — conversion failure

---

## Conversion Logic

`/api/convert/route.ts`:
1. Validate file (size ≤ 10MB, extension in allowlist)
2. Write to `os.tmpdir()/fontina/{uuid}{ext}`
3. Write Python conversion script to `os.tmpdir()/fontina/{uuid}_convert.py`
4. Run: `python3 script.py input output.woff2` via `child_process.exec`
5. Read output WOFF2 buffer
6. Return as `NextResponse` binary stream
7. `finally`: unlink input, output, and script

**Python script (inline):**
```python
from fontTools.ttLib import TTFont
font = TTFont(input_path)
font.flavor = "woff2"
font.save(output_path)
```

---

## Env Vars

| Name | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Optional | App URL for OG/metadata |

No database env vars needed at launch.

---

## Phases

| Phase | Status | Tasks |
|---|---|---|
| Phase 1: Core converter | ✅ | Drop zone, conversion queue, API route, fonttools integration |
| Phase 2: Analytics | ⏳ | Add Neon DB, track conversion counts, formats stats |
| Phase 3: Auth + dashboard | ⏳ | Clerk auth, user history, batch zip download |
| Phase 4: API access | ⏳ | REST API with API key, rate limiting (Upstash Redis) |

---

## Next Steps

1. Push to GitHub and deploy to Vercel
2. Add Python to Vercel build (`vercel.json` → runtime or `requirements.txt`)
3. Test TTF → WOFF2 conversion end-to-end on Vercel
4. Add Cloudflare Pages deployment (note: subprocess may need edge workaround)
5. Add zip download for batch conversions
6. Add drag-to-reorder in queue

---

## Notes

- **Cloudflare Pages caveat:** `child_process` and `fs` are Node.js APIs and will not run on Cloudflare Edge Runtime. For Cloudflare, the conversion route must be deployed as a Vercel Serverless Function or proxied. Long-term: use a Cloudflare Worker with WASM-compiled fonttools or a dedicated conversion microservice.
- fonttools must be available in the server environment. On Vercel, this requires Python runtime support or a custom Docker image.
