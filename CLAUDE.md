# AL-Araby Oils — E-commerce Frontend

Start any session here with `/boot`. It loads the code graph, the vault memory, and git state.

## Stack

Vite 5 · React 18 · TypeScript · Tailwind · shadcn/ui (Radix) · React Router (**HashRouter**) · react-hook-form + zod

Scaffolded by Lovable — `lovable-tagger` runs in dev mode only.

## Commands

```bash
npm run dev       # localhost:8080
npm run build     # production build, must pass before any commit
npm run lint      # eslint
npm run deploy    # gh-pages -d dist  → live site
```

**Live:** https://mohammed-004del.github.io/AL-Araby-Oils-E-commerce-Website/
**Repo:** https://github.com/Mohammed-004del/AL-Araby-Oils-E-commerce-Website

## Layout

- `src/pages/` — 13 routes: Home, Shop, ProductDetail, Cart, Checkout, Login, Register, About, Blog, Contact, FAQ, LearnMore, NotFound
- `src/components/` — Navbar, Hero, ProductCard, CategoryCard, Footer, ScrollToTop + `ui/` (shadcn primitives)
- `src/contexts/` `src/data/` `src/hooks/` `src/types/` — state, static product data, utilities
- `src/assets/` — every image the app imports, via the `@/assets/…` alias.
- `assests/` — misspelled, and **not used by any code**: README screenshots only. Don't wire anything new to it.

Frontend only. Cart, checkout, and auth are UI with no backend.

## Constraints — don't break these

- **HashRouter, and no `basename`.** GitHub Pages has no server-side rewrite, so BrowserRouter 404s every deep link on refresh. The hash path is already independent of the repo subpath — adding a `basename` on top puts routes at `#/AL-Araby-Oils-E-commerce-Website/shop`, which is what caused the earlier revert. The router flip-flopped four times (`503a188` → `63f6d0b` → `f76d0c3` → `a212595`); `a212595` had left BrowserRouter in place. Settled 2026-07-25.
- **`base` in `vite.config.ts` must stay `/AL-Araby-Oils-E-commerce-Website/` in production.** Changing it breaks every asset URL on the live site.
- **`npm run build` must pass before committing.** A `minify: 'terser'` config sat broken and uncommitted for six months because nobody ran it.
- **Minifier is esbuild, deliberately.** It needs no extra dependency and drops `console`/`debugger` via the top-level `esbuild.drop` option. Don't switch to terser without adding it to devDependencies first.
- **The skip link is a `<button>`, not an `<a href="#…">`.** Under HashRouter a fragment href is read as a route and lands on NotFound. `<main>` carries `tabIndex={-1}` so it can receive focus.
- **Focus rings use `focus-visible:`, not `focus:`.** shadcn's `buttonVariants` already ships a correct `focus-visible` ring — don't re-add one on `<Button>`.
- **Scroll animation goes through GSAP ScrollTrigger, not hand-rolled scroll listeners.** Every trigger must be created inside `gsap.context()`/`useGSAP` and reverted on unmount — this is a SPA, and leaked triggers degrade scroll after a few route changes. Wrap motion in `gsap.matchMedia()` so `prefers-reduced-motion` is honoured. Set initial states with `gsap.set`, never CSS `opacity: 0`, so a JS failure leaves content visible instead of blank. Settled 2026-07-26.
- **The CSP is injected at build time by `cspPlugin` in `vite.config.ts`, not written into `index.html`.** `script-src 'self'` would block the React plugin's inline refresh preamble and break `npm run dev`. GitHub Pages serves no custom headers, so a `<meta>` CSP is the only option — and `frame-ancestors`, `report-uri`, and `sandbox` are ignored in `<meta>` by spec, meaning **there is no clickjacking protection available while the site is on Pages.**

## Backend readiness — read this before writing the first endpoint

The frontend is done in a way that assumes these rules. Breaking them is how this app gets a real vulnerability.

- **The server re-prices every order from its own catalog.** The client sends product **ids and quantities only** — never `price`, never `cartTotal`. `cartTotal` in `CartContext.tsx` is computed from values that came out of `localStorage`, so any endpoint that trusts a client-sent price lets the customer set their own. Display-only, forever.
- **Validation lives in `src/lib/schemas.ts`** — plain zod, no React import, so the backend imports the identical file and validation is defined once on both sides of the wire.
- **Nothing client-side is enforcement.** `required`/`type="email"`, the `cart.length` redirect in `Checkout.tsx`, and the password-match check in `Register.tsx` are all UX. The server re-validates everything, including integer-ness and the quantity ceiling.
- **Auth tokens: not `localStorage`, not `sessionStorage`, not a JS-readable cookie, not the URL.** Note `mohammed-004del.github.io` is **one origin shared by every repo published to Pages** — another project of yours can read this one's storage.
- **Decide where the frontend lives *before* auth is written.** `github.io` is on the Public Suffix List, so it can never be same-site with an API — that forces `SameSite=None` + CORS-with-credentials + your own CSRF tokens, permanently. Moving to Cloudflare Pages/Netlify/Vercel with an `api.` subdomain gets `SameSite=Lax` cookies *and* real response headers (full CSP, `frame-ancestors`, HSTS). Neither option touches HashRouter or `base`.
- If it stays on Pages: access token **in memory only**, refreshed via an `HttpOnly; Secure; SameSite=None` cookie on the API domain, CSRF token on every state-changing request.
- **Never pass a query param into `<Link to>` or `navigate()` without an allowlist** — that is the open-redirect shape in react-router's advisories, and a `?redirect=` post-login flow is exactly when it appears.

## Where things get written

| What | Where | Who |
|---|---|---|
| Code structure, "what calls what" | `graphify-out/` (gitignored, rebuildable) | `graph-keeper` agent |
| Decisions, history, what's next | Obsidian vault → `Projects/AL-Araby Oils.md`, `Dev Logs/` | `vault-keeper` agent |

Never document code structure in the vault — the graph regenerates it. Never put decisions in the graph.

## Workflow

- `/boot` — start of session
- `/ship <thing>` — implement → `ui-critic` + `code-auditor` review in parallel → fix → document to vault
