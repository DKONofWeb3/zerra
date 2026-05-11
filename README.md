# Yap Dashboard

A multi-page crypto / social analytics dashboard. Built with Vite + React + TypeScript.

## Status

**Milestone 1 — Complete.** Project scaffolding, design tokens, layout shell, routing, and stub pages are in place. The Dashboard page renders a structural skeleton with section markers; sections are filled in subsequent milestones.

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **React Router v6** for routing
- **Tailwind CSS v3** with CSS-variable-based design tokens
- **Lucide React** for icons
- **Framer Motion** for animation (used from M2 onward)
- **Recharts** for sparklines (used in M2)
- **Satoshi** display/body font, loaded from Fontshare

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. All sidebar links should navigate to their stub pages.

```bash
npm run build      # type-check + production build
npm run preview    # preview the production build
```

## Project structure

```
src/
├── App.tsx                      # Routes
├── main.tsx                     # Entry point
├── components/
│   ├── PagePlaceholder.tsx      # Reusable stub for unbuilt pages
│   └── layout/
│       ├── AppLayout.tsx        # Sidebar + TopBar + <Outlet/>
│       ├── Sidebar.tsx
│       └── TopBar.tsx
├── lib/
│   ├── cn.ts                    # clsx + tailwind-merge helper
│   ├── mock-data.ts             # Seed data for development
│   └── types.ts                 # Domain types (mirror backend later)
├── pages/
│   ├── Dashboard/index.tsx      # Homepage (M1: shell, M2/M3: sections)
│   ├── Portfolio/index.tsx      # Stub
│   ├── Yap/index.tsx            # Stub
│   ├── Watchlist/index.tsx      # Stub
│   ├── Market/index.tsx         # Stub
│   ├── Wallet/index.tsx         # Stub
│   └── NotFound/index.tsx
├── styles/
│   └── globals.css              # Tailwind + design tokens
└── vite-env.d.ts
```

## Design tokens

All colors, gradients, and shadows are CSS variables in `src/styles/globals.css` under `:root`. The Tailwind config (`tailwind.config.js`) consumes them via `rgb(var(--name) / <alpha-value>)`, so utilities like `bg-bg-card`, `text-fg-secondary`, `border-stroke` work seamlessly.

When you have access to Figma values, edit only the `:root` block. Nothing else needs to change.

| Variable | Purpose |
| --- | --- |
| `--bg-base` | App background |
| `--bg-sidebar` | Sidebar background |
| `--bg-card` | Card surfaces |
| `--bg-elevated` | Hover / elevated state |
| `--fg-primary` | Primary text |
| `--fg-secondary` | Body text |
| `--fg-tertiary` | Meta / labels |
| `--fg-muted` | Section labels, dim |
| `--stroke` / `--stroke-strong` | Borders |
| `--brand` / `--brand-glow` | Blue accent + glow |
| `--success` / `--danger` / `--warning` | Status colors |
| `--streak` | Flame orange |

## Roadmap

- ✅ **M1** — Setup, tokens, layout shell, routing, stub pages
- ⬜ **M2** — Dashboard top section: header, price cards with sparklines, user activity marquee
- ⬜ **M3** — Dashboard bottom section: Yap section card, Project overview table
- ⬜ **M4** — Polish: animations, hover states, micro-interactions, responsive breakpoints

## Notes

- Token icons (`/tokens/*.svg`) are referenced in mock data but not yet bundled. Add them in `public/tokens/` or replace with a crypto icon library in M2.
- Tailwind v3 was chosen over v4 for stability. The token system migrates to v4 cleanly when you're ready.
- Tab-active state in the sidebar uses a blinking `|` cursor — this is intentional and matches the design.
