# Aditya Nitin Gawali — Portfolio

Personal portfolio site for Aditya Nitin Gawali (AI/ML & Backend Engineer), built with Next.js. All content — bio, experience, projects, skills, contact links — is driven from a single typed data source, so updating the resume never means touching layout code.

Live sections: Hero (interactive 3D visual), About, Experience (tabbed case studies with animated architecture diagrams), Projects (an explorer with sandboxed, interactive demos of each project), Skills (auto-scrolling marquees), Contact.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for utilities, layered with hand-written CSS custom properties for the design tokens (colors, spacing, motion durations) in `app/globals.css`
- **Framer Motion** for scroll reveals, layout transitions, and spring physics
- **React Three Fiber / Three.js** for the hero's shader-based organic sphere
- **Lenis** for eased/momentum scrolling on desktop (native scroll is left untouched on touch devices and under `prefers-reduced-motion`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page hot-reloads as you edit.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project structure

```
app/                 Root layout, global styles, the single page route
components/           One component per section, plus shared UI (Nav, GravityGrid,
                      CommandPalette, Toast, Magnetic, SmoothScroll)
data/resume.ts        Single source of truth for all content — bio, education,
                      experience, projects, skills, contact links. Nothing on the
                      page should hardcode content that belongs here.
public/                Static assets (resume.pdf, favicon, etc.)
```

## Notable features

- **Command palette** — `⌘K` / `Ctrl+K` (or the search button in the nav) opens a searchable palette for jumping to any section, copying the contact email, downloading the résumé, or opening a project's repo.
- **Cursor-reactive background grid** — the fixed canvas grid behind the page bends around the cursor with damped, spring-like motion (mouse/trackpad only; static on touch devices and under reduced motion).
- **Interactive project sandboxes** — the Projects explorer's demos aren't static screenshots: Omnichat's terminal preview responds to quick-prompt chips, and the Clickbait Clarifier demo scores headlines you type in with a small heuristic classifier (clearly labeled as a simulation of the real model, not the model itself).
- **Full accessibility fallbacks** — every hover/cursor-driven effect (magnetic buttons, grid warp, 3D tilt) degrades to a static or tap-friendly equivalent on touch devices, and all custom motion respects `prefers-reduced-motion`.

## Deployment

This is a fully static Next.js build (no API routes, no server-only code), so it deploys cleanly to [Vercel](https://vercel.com/new) (zero-config for Next.js), Netlify, or Cloudflare Pages via a standard git-based deploy.
