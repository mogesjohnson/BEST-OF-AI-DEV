import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { Shell } from "@/components/Shell";
import { Toc } from "@/components/Toc";
import { allPages, findPage, navEntries } from "@/lib/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPages()
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/why/[slug]">): Promise<Metadata> {
  const page = findPage((await params).slug);
  return { title: page?.title, description: page?.summary };
}

export default async function WhyPage({ params }: PageProps<"/why/[slug]">) {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page || !slug) notFound();
  return (
    <Shell nav={navEntries()} current={slug} rail={<Toc toc={page.toc} />}>
      <Article page={page} />
    </Shell>
  );
}
