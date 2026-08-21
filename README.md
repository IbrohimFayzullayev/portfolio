# Portfolio & Blog

A bilingual (EN/UZ), content-driven portfolio and engineering blog built as a
**scalable foundation** — not a throwaway template. Custom design system, full SEO
and i18n out of the box, with content served from a dedicated backend API.

> Bu loyiha katta masshtabga moslab qurilgan. Quyidagi `Tez boshlash` bo‘limidan
> foydalanib ishga tushiring.

## Architecture

This is the **public website** — one of three independent apps that share a single
PostgreSQL database as the source of truth:

```
portfolio-dashboard (admin CMS) --JWT--> portfolio-api (Go) --pgx--> PostgreSQL
portfolio (this app, public)    --fetch-> portfolio-api (/public/*) --> PostgreSQL
```

The site fetches **published** posts and projects from the Go API's public
endpoints at request time and renders the MDX `body` with `next-mdx-remote`.
The old Velite/local-MDX content layer has been removed — content now lives in
PostgreSQL and is authored through the dashboard.

## Tech stack

| Layer            | Choice                                               |
| ---------------- | ---------------------------------------------------- |
| Framework        | Next.js 15 (App Router, RSC)                         |
| Language         | TypeScript (strict)                                  |
| Styling          | Tailwind CSS v4 + shadcn/ui-style primitives         |
| Content source   | Go API (`portfolio-api`) backed by PostgreSQL        |
| MDX rendering    | next-mdx-remote/rsc (rehype slug, pretty-code, autolink) |
| i18n             | next-intl (locale-prefixed routing, en/uz)           |
| Theming          | next-themes (dark / light / system)                  |
| SEO              | Dynamic OG images (`next/og`), RSS, sitemap, JSON-LD |
| Package manager  | pnpm                                                 |

## Tez boshlash / Quick start

The public site reads content from the API, so **the API must be running first**.

```bash
# 1. Start the backend (separate repo) — see portfolio-api/README.md
#    It serves PUBLISHED content on http://localhost:8080/api/v1

# 2. Install dependencies
pnpm install

# 3. Copy env and configure URLs
cp .env.example .env.local
#    set NEXT_PUBLIC_API_URL to the API base, e.g. http://localhost:8080/api/v1

# 4. Run the dev server
pnpm dev
```

Open http://localhost:3000 — you'll be redirected to `/en`.

> In `next dev` pages render on demand, so an empty/unreachable API just renders
> empty pages. For `pnpm build`, the API **must** be up because
> `generateStaticParams` fetches it at build time.

## Environment

| Variable               | Description                                              |
| ---------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Public base URL (no trailing slash). SEO, OG, sitemap, RSS. |
| `NEXT_PUBLIC_API_URL`  | Go API base, e.g. `http://localhost:8080/api/v1`. Defaults to localhost if unset. |

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `pnpm dev`        | Start dev server (port 3000)      |
| `pnpm build`      | Production build (needs API up)   |
| `pnpm start`      | Serve the production build        |
| `pnpm lint`       | ESLint                            |
| `pnpm typecheck`  | `tsc --noEmit`                    |
| `pnpm format`     | Prettier write                    |

## Project structure

```
src/
├── app/
│   ├── [locale]/            # All localized pages live here
│   │   ├── layout.tsx       # Root layout (<html>), providers, nav, footer
│   │   ├── page.tsx         # Home
│   │   ├── about/
│   │   ├── projects/        # List + [slug] detail
│   │   ├── blog/            # List (search + tags) + [slug] detail
│   │   └── not-found.tsx
│   ├── api/og/              # Dynamic Open Graph image
│   ├── feed.xml/            # RSS feed
│   ├── sitemap.ts           # Sitemap (with hreflang alternates)
│   ├── robots.ts            # robots.txt
│   ├── manifest.ts          # PWA manifest
│   ├── not-found.tsx        # Global (non-localized) 404
│   └── globals.css          # Tailwind v4 tokens + design system
├── components/
│   ├── ui/                  # Primitives: button, card, badge, input
│   ├── mdx-content.tsx      # Renders API `body` via next-mdx-remote/rsc
│   └── ...                  # navbar, footer, cards, search, theme, TOC
├── config/site.ts           # Single source of truth for site metadata
├── i18n/                    # next-intl routing, navigation, request config
├── lib/
│   ├── content.ts           # async API fetchers + TOC/reading-time/excerpt
│   ├── seo.ts               # metadata + JSON-LD helpers
│   └── utils.ts
└── messages/                # en.json, uz.json (UI strings)
```

> `content/posts` and `content/projects` (legacy `.mdx`) remain in the repo as a
> backup of the original seed data but are **no longer read** by the site.

## Authoring content

Content is **no longer added by committing `.mdx` files**. To publish a post or
project, create it in the **dashboard** (`portfolio-dashboard`) and publish it —
it lands in PostgreSQL and the public site fetches it via the API. Only content
with `draft=false` (published) is visible here.

The shape of a post/project (locale, slug, title, description, body, tags/stack,
cover, featured, date, etc.) is defined and validated by the API. See
`portfolio-api/README.md` for the schema and endpoints.

## Internationalization

Locales are defined in `src/i18n/routing.ts` (`en`, `uz`). To add a language:

1. Add the code to `locales`.
2. Create `src/messages/<locale>.json`.
3. Add a label in `localeNames` (`src/config/site.ts`).
4. Author content for that locale in the dashboard.

## Rendering strategy (SSG / ISR)

Pages are statically generated via `generateStaticParams` (now async — it fetches
the API at build time). Data fetches in `lib/content.ts` use `next: { revalidate:
3600 }`, so published content is re-fetched from the API at most once per hour per
route (ISR). Fetch failures return empty results instead of crashing the build.

## Deployment

Optimized for **Vercel**. Ensure the API is reachable from the build/runtime
environment and set:

- `NEXT_PUBLIC_SITE_URL` — production domain (canonical URLs, OG, sitemap, RSS).
- `NEXT_PUBLIC_API_URL` — public-facing API base URL.

See `../DEPLOYMENT.md` for the full three-app deployment guide.

---

Built with Next.js, Tailwind CSS and MDX, backed by a Go + PostgreSQL API.
