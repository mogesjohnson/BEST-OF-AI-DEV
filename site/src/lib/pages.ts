import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import { GROUPS, REPO_URL, hrefOf, type NavEntry } from "./site";

/**
 * The site has no content of its own. Every page is a Markdown file in ../docs/why, so the
 * same text reads on GitHub and on the site, and there is one copy to keep current.
 */
export const WHY_DIR = path.join(process.cwd(), "..", "docs", "why");

export type TocItem = { id: string; title: string };
export type Page = {
  slug: string;
  /** File name in docs/why, for the "Edit on GitHub" link. */
  file: string;
  title: string;
  summary: string;
  group: string;
  order: number;
  html: string;
  toc: TocItem[];
};

/** Reads `key: value` front matter. Small on purpose: no YAML features, no dependency. */
export function parseFrontMatter(source: string): { data: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!m) return { data: {}, body: source };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([a-z]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return { data, body: source.slice(m[0].length) };
}

const WHY_URL = new RegExp(`^${REPO_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/blob/main/docs/why/(?:\\d+-)?([a-z0-9-]+)\\.md(#[\\w-]+)?$`);

/**
 * Pages link to each other with full GitHub URLs, so the links work on GitHub. On the site,
 * those links go to the rendered page instead. index.md maps to the home page.
 */
export function localHref(href: string, basePath = process.env.BASE_PATH || ""): string {
  const m = WHY_URL.exec(href);
  if (!m) return href;
  return `${basePath}${hrefOf(m[1] === "index" ? "" : m[1])}${m[2] ?? ""}`;
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;|&#\d+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Renders Markdown, gives every h2 and h3 an id, and returns the h2s for "On this page". */
export function render(body: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        if (depth === 1) return "";
        const base = slugify(inner) || "section";
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        if (depth === 2) toc.push({ id, title: inner.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}" class="bd-h${depth}">${inner}<a class="bd-anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const attr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        const t = title ? ` title="${attr(title)}"` : "";
        return `<a href="${attr(localHref(href))}"${t}>${text}</a>`;
      },
    },
  });
  const html = marked.parse(body, { async: false });
  return { html, toc };
}

function load(file: string): Page {
  const { data, body } = parseFrontMatter(fs.readFileSync(path.join(WHY_DIR, file), "utf8"));
  const slug = file === "index.md" ? "" : file.replace(/^\d+-/, "").replace(/\.md$/, "");
  const title = data.title || /^#\s+(.+)$/m.exec(body)?.[1] || slug;
  return { slug, file, title, summary: data.summary || "", group: data.group || "Start here", order: Number(data.order || 0), ...render(body) };
}

let cache: Page[] | undefined;

export function allPages(): Page[] {
  cache ??= fs
    .readdirSync(WHY_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(load)
    .sort((a, b) => {
      const g = (p: Page) => (GROUPS.includes(p.group) ? GROUPS.indexOf(p.group) : GROUPS.length);
      return g(a) - g(b) || a.order - b.order || a.title.localeCompare(b.title);
    });
  return cache;
}

export const findPage = (slug: string) => allPages().find((p) => p.slug === slug);

export const navEntries = (): NavEntry[] => allPages().map(({ slug, title, summary, group }) => ({ slug, title, summary, group }));
