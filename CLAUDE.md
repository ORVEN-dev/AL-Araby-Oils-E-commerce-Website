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

## Where things get written

| What | Where | Who |
|---|---|---|
| Code structure, "what calls what" | `graphify-out/` (gitignored, rebuildable) | `graph-keeper` agent |
| Decisions, history, what's next | Obsidian vault → `Projects/AL-Araby Oils.md`, `Dev Logs/` | `vault-keeper` agent |

Never document code structure in the vault — the graph regenerates it. Never put decisions in the graph.

## Workflow

- `/boot` — start of session
- `/ship <thing>` — implement → `ui-critic` + `code-auditor` review in parallel → fix → document to vault
