# Portfolio

Jackson Lawrence's personal site. Next.js (App Router) with Tailwind CSS v4, themed with the
AnyForm brand tokens (`src/styles/`, ported from `~/af-approvals/web`).

- `pnpm dev`: run locally
- `pnpm build`, `pnpm lint`, `pnpm typecheck`

All content lives in `src/content/profile.ts`, the single source of truth for pages and the
machine-readable outputs. Only real facts go in there; anything not yet written is `null`.

## Notes

- **Resume:** the source is `resume/resume.html`; `pnpm resume` prints it to `public/resume.pdf`
  with headless Chrome.
- **Project pages** (`/projects/<slug>` and their `.md` twins) are built but switched off with
  `PROJECT_PAGES_ENABLED` in `src/content/profile.ts`. Flip it to `true` to publish them again;
  the constellation links, sitemap and agent views follow the same switch.
- **Illustrations** are reviewed at `/dev/illustrations` (development only).
