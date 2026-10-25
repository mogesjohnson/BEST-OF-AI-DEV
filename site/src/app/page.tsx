import Image from "next/image";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { Shell } from "@/components/Shell";
import { Toc } from "@/components/Toc";
import { findPage, navEntries } from "@/lib/pages";

export default function Home() {
  const page = findPage("");
  if (!page) notFound();
  return (
    <Shell nav={navEntries()} current="" rail={<Toc toc={page.toc} />}>
      {/* next/image does not add basePath to src, so prefix it like localHref does. */}
      <figure className="bd-hero">
        <Image
          src={`${process.env.BASE_PATH || ""}/images/why-hero.webp`}
          alt="Why it matters: the reasoning behind every AI-dev practice"
          width={1280}
          height={720}
          preload
          sizes="(min-width: 1024px) 760px, 100vw"
        />
      </figure>
      <Article page={page} />
    </Shell>
  );
}
