# Portfolio & Blog

A bilingual (EN/UZ), content-driven portfolio and engineering blog built as a
**scalable foundation** — not a throwaway template. Typed content layer, custom
design system, full SEO and i18n out of the box.

> Bu loyiha katta masshtabga moslab qurilgan. Quyidagi `Tez boshlash` bo‘limidan
> foydalanib ishga tushiring.

## Tech stack

| Layer            | Choice                                            |
| ---------------- | ------------------------------------------------- |
| Framework        | Next.js 15 (App Router, RSC)                      |
| Language         | TypeScript (strict)                               |
| Styling          | Tailwind CSS v4 + shadcn/ui-style primitives      |
| Content          | Velite (type-safe MDX content layer)              |
| i18n             | next-intl (locale-prefixed routing)               |
| Theming          | next-themes (dark / light / system)               |
| SEO              | Dynamic OG images (`next/og`), RSS, sitemap, JSON-LD |
| Package manager  | pnpm                                              |

## Tez boshlash / Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env and set your site URL
cp .env.example .env.local

# 3. Run the dev server (Velite builds the content layer automatically)
pnpm dev
```

Open http://localhost:3000 — you'll be redirected to `/en`.

## Scripts

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `pnpm dev`        | Start dev server (runs Velite in watch mode)      |
| `pnpm build`      | Production build (runs Velite, then `next build`) |
| `pnpm start`      | Serve the production build                        |
| `pnpm lint`       | ESLint                                            |
| `pnpm typecheck`  | Generate content types, then `tsc --noEmit`       |
| `pnpm format`     | Prettier write                                    |
| `pnpm content`    | Build the content layer once                      |

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
│   └── ...                  # navbar, footer, mdx, cards, search, theme
├── config/site.ts           # Single source of truth for site metadata
├── i18n/                    # next-intl routing, navigation, request config
├── lib/                     # content queries, seo, utils
└── messages/                # en.json, uz.json (UI strings)

content/
├── posts/{en,uz}/*.mdx      # Blog posts
└── projects/{en,uz}/*.mdx   # Projects
```

## Authoring content

Add an `.mdx` file under `content/posts/<locale>/` or
`content/projects/<locale>/`. Velite validates the frontmatter against the schema
in `velite.config.ts` and regenerates types — invalid frontmatter fails the build,
so content errors are caught early.

### Blog post frontmatter

```yaml
---
title: My post
description: One-sentence summary used for SEO and cards.
locale: en # or "uz"
slug: my-post # used in the URL
date: 2026-06-15
updated: 2026-06-16 # optional
tags: [nextjs, performance]
featured: true # optional — surfaces on the home page
draft: false # optional — hidden in production
---
```

### Project frontmatter

```yaml
---
title: My project
description: Short description.
locale: en
slug: my-project
date: 2026-06-15
order: 10 # higher = shown first
stack: [Next.js, TypeScript] # tech badges
url: https://... # optional live link
repo: https://... # optional source link
featured: true
---
```

## Internationalization

Locales are defined in `src/i18n/routing.ts` (`en`, `uz`). To add a language:

1. Add the code to `locales`.
2. Create `src/messages/<locale>.json`.
3. Add a label in `localeNames` (`src/config/site.ts`).
4. Author content under `content/**/<locale>/`.

## Rendering strategy (SSG / ISR)

Pages are statically generated via `generateStaticParams`. Blog post pages also
export `revalidate = 3600`, so the ISR pattern is wired up for the day content
moves from local MDX to a CMS or API.

## Deployment

Optimized for **Vercel**. Set `NEXT_PUBLIC_SITE_URL` to your production domain so
canonical URLs, OG images, the sitemap and RSS resolve correctly.

## Next steps / extensibility ideas

- Swap the Velite source for a headless CMS and lean on the existing `revalidate`.
- Add a `/snippets` or `/notes` collection — copy the `projects` collection.
- Add view counts or comments behind a small API route.
- Add automated OG fonts for non-Latin scripts.

---

Built with Next.js, Tailwind CSS and MDX.
