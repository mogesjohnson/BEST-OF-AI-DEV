"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GROUPS, REPO_URL, hrefOf, type NavEntry } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

function Wordmark() {
  return (
    <Link href="/" className="bd-wordmark" aria-label="BEST OF AI DEV home">
      <span className="bd-mark" aria-hidden="true" />
      <span>
        BEST OF <span className="bd-wordmark-accent">AI DEV</span>
      </span>
    </Link>
  );
}

function Sidebar({ nav, current, onNavigate }: { nav: NavEntry[]; current: string; onNavigate?: () => void }) {
  const groups = [...GROUPS, ...nav.map((p) => p.group).filter((g) => !GROUPS.includes(g))].filter(
    (g, i, all) => all.indexOf(g) === i && nav.some((p) => p.group === g),
  );
  return (
    <>
      {groups.map((group) => (
        <div key={group} className="bd-side-group">
          <p className="bd-side-title">{group}</p>
          <ul className="bd-side-list">
            {nav
              .filter((p) => p.group === group)
              .map((p) => (
                <li key={p.slug}>
                  <Link
                    href={hrefOf(p.slug)}
                    className="bd-side-link"
                    aria-current={p.slug === current ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    {p.slug ? p.title : "Overview"}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/** Top bar, sidebar, article and right rail. The layout follows Shadow Docs. */
export function Shell({ nav, current, rail, children }: { nav: NavEntry[]; current: string; rail?: ReactNode; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="bd-root">
      <a href="#bd-content" className="bd-skip">
        Skip to content
      </a>
      <header className="bd-top">
        <div className="bd-top-left">
          <button type="button" className="bd-icon-btn bd-menu-btn" aria-label="Open navigation" onClick={() => setDrawer(true)}>
            <Menu size={18} />
          </button>
          <Wordmark />
        </div>
        <div className="bd-top-right">
          <a href={REPO_URL} className="bd-top-link" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </header>

      <div className="bd-body">
        <nav className="bd-side" aria-label="Pages">
          <Sidebar nav={nav} current={current} />
        </nav>
        <div className="bd-main">
          <article id="bd-content" className="bd-article">
            {children}
          </article>
          <aside className="bd-rail">
            <div className="bd-rail-inner">{rail}</div>
          </aside>
        </div>
      </div>

      {drawer && (
        <div className="bd-overlay" onMouseDown={() => setDrawer(false)}>
          <nav className="bd-drawer" aria-label="Navigation" onMouseDown={(e) => e.stopPropagation()}>
            <div className="bd-drawer-head">
              <Wordmark />
              <button type="button" className="bd-icon-btn" aria-label="Close navigation" onClick={() => setDrawer(false)}>
                <X size={18} />
              </button>
            </div>
            <Sidebar nav={nav} current={current} onNavigate={() => setDrawer(false)} />
          </nav>
        </div>
      )}
    </div>
  );
}
