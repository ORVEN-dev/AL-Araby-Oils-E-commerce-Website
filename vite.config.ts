import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const githubPagesBase = '/AL-Araby-Oils-E-commerce-Website/';
const githubPagesUrl = `https://orven-dev.github.io${githubPagesBase}`;
const cloudflareUrl = 'https://al-araby-oils.orven-agency01.workers.dev/';

// GitHub Pages serves no custom headers, so the Content-Security-Policy has to
// ride in a <meta> tag. It is injected at build time rather than written into
// index.html because `script-src 'self'` would break `npm run dev` — the React
// plugin injects an inline refresh preamble that a nonce-free policy blocks.
//
// Known ceilings of a meta-tag CSP (all are spec limitations, not oversights):
// `frame-ancestors`, `report-uri`, and `sandbox` are ignored in <meta>, so there
// is no clickjacking protection available on Pages at all. `style-src` needs
// 'unsafe-inline' because sonner and Radix inject <style> elements and inline
// style attributes at runtime — removing the one inline block here would not
// change that. `script-src` is the directive that carries the real value, and it
// is strict: no nonce, no 'unsafe-inline', no 'unsafe-eval'.
//
// When a backend lands, widen `connect-src` to the API origin.
// ponytail: meta CSP, move to real response headers if the site leaves Pages.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const cspPlugin = {
  name: 'inject-csp-meta',
  apply: 'build' as const,
  transformIndexHtml(html: string) {
    // Inserted after <meta name="viewport"> so charset stays first, and before
    // the inline <style> and the module script the policy governs — a meta CSP
    // only applies to what follows it.
    const out = html.replace(
      /(<meta name="viewport"[^>]*>)/,
      `$1\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    );
    // String.replace with no match is a silent no-op, which would ship a
    // production build with no CSP at all while the build still "passes".
    // Reordering or requoting the viewport meta is all it would take.
    if (!out.includes('Content-Security-Policy')) {
      throw new Error(
        'cspPlugin: could not find <meta name="viewport"> in index.html — CSP was not injected. ' +
          'Fix the anchor in vite.config.ts rather than removing this check.',
      );
    }
    return out;
  },
};

export default defineConfig(({ command, mode }) => ({
  base: command === 'build' && mode === 'github-pages' ? githubPagesBase : '/',
  define: {
    'import.meta.env.VITE_SITE_URL': JSON.stringify(
      mode === 'github-pages' ? githubPagesUrl : cloudflareUrl,
    ),
  },
  
  server: {
    // localhost, not "::" — binding every interface exposes the dev server to
    // the whole LAN, and esbuild's dev server answers cross-origin requests
    // (GHSA-67mh-4wv8-2f99). Switch back deliberately to test from a phone.
    host: "localhost",
    port: 8080,
  },
  
  plugins: [react(), mode === "development" && componentTagger(), cspPlugin].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  preview: {
    port: 8080,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion'
          ],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    },
    // esbuild is Vite's default minifier - no extra dependency, and it strips
    // console/debugger below via the top-level `esbuild` option. Do not switch
    // to terser without adding it to devDependencies first.
    minify: 'esbuild'
  },

  esbuild: {
    drop: command === 'build' && mode !== 'development' ? ['console', 'debugger'] : []
  }
}));
