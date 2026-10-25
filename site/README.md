# Docs site

A static Next.js site that renders the Markdown pages in [`../docs/why`](../docs/why). It has no
content of its own: edit the Markdown, not the site.

## Run it

Needs Node 20.9 or newer. From the repo root:

```sh
cd site
npm ci
npm run dev
```

Open http://localhost:3000. Edits to `docs/why/*.md` show up after a reload.

## Build it

```sh
npm run lint
npm run typecheck
npm run build
```

CI runs the same three commands in `.github/workflows/site.yml`, only when `site/` or
`docs/why/` changes.

`npm run build` writes plain HTML to `site/out/`. To host it under a subpath, such as GitHub
Pages for this repo, set `BASE_PATH=/BEST-OF-AI-DEV` before building. In PowerShell 5.1, run
`$env:BASE_PATH = "/BEST-OF-AI-DEV"` on its own line, then `npm run build`.

## Page format

Each page is `docs/why/NN-slug.md` with front matter:

```md
---
title: Small PRs
summary: One line under the title.
group: Change and review
order: 1
---
```

`group` picks the sidebar section; the known groups are listed in `src/lib/site.ts`. Every
`##` heading shows up in "On this page". A `>` blockquote renders as a callout.
