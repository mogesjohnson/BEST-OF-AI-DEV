import type { TocItem } from "@/lib/pages";

export function Toc({ toc }: { toc: TocItem[] }) {
  if (toc.length === 0) return null;
  return (
    <nav className="bd-toc" aria-label="On this page">
      <p className="bd-toc-title">On this page</p>
      <ul>
        {toc.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="bd-toc-link">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
