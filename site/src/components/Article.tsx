import { ArrowUpRight } from "lucide-react";
import type { Page } from "@/lib/pages";
import { sourceOf } from "@/lib/site";

/** One rendered page. The HTML comes from Markdown in this repo, never from a reader. */
export function Article({ page }: { page: Page }) {
  return (
    <>
      <header className="bd-page-header">
        <p className="bd-eyebrow">{page.group}</p>
        <h1 className="bd-h1">{page.title}</h1>
        {page.summary && <p className="bd-lede">{page.summary}</p>}
      </header>
      <div className="bd-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
      <p className="bd-edit">
        <a href={sourceOf(page.file)} target="_blank" rel="noopener noreferrer">
          Edit this page on GitHub <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </p>
    </>
  );
}
