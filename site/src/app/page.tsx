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
      <Article page={page} />
    </Shell>
  );
}
