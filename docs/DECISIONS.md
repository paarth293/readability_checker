# Decision Log

## 2026-10-09: Technology Stack Selection

- **Language:** TypeScript in strict mode. Reason: Guarantees type safety, predictable refactoring, and fits the strictness requirements. Alternatives rejected: JavaScript (unsafe), Rust/WASM (overkill for simple text processing).
- **Build tool:** Vite. Reason: Extremely fast, built-in support for TypeScript and Web Workers, easy configuration for small static bundles. Alternatives rejected: Webpack (too slow and complex), Rollup (requires more manual config than Vite).
- **UI approach:** Plain TypeScript with Web Components. Reason: Zero external UI dependencies, extremely small footprint, aligns with performance goals (under 100KB JS). Alternatives rejected: React (too heavy), Preact (still adds dependency overhead), Svelte (compilation step adds complexity vs pure TS).
- **Styling approach:** Plain modern CSS with custom properties. Reason: Minimal bundle size, native browser support for theming (light/dark). Alternatives rejected: Tailwind CSS (unnecessary overhead for a single-view app), SCSS (build complexity).
- **Test tooling:** Vitest (unit), Playwright (E2E), Axe-core (accessibility). Reason: Vitest is fast and native to Vite; Playwright covers all major browsers reliably; Axe-core is the industry standard for A11y. Alternatives rejected: Jest (slower, older ecosystem), Cypress (heavier than Playwright).
- **Quality tooling:** ESLint, Prettier, TypeScript checker. Reason: Standard, proven tools for maintaining strict quality. Alternatives rejected: Rome/Biome (newer, less ecosystem support).
- **Hosting:** Cloudflare Pages. Reason: Free tier is generous (100k requests/day, unlimited bandwidth), global CDN, HTTP/3, auto-Brotli. Easily supports the 10,000 concurrent user requirement since it's just static files. Alternatives rejected: Vercel (stricter free tier limits), Netlify (lower bandwidth limits).
