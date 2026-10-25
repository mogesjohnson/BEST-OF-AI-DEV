// Shared by server pages and client components, so nothing here may import node modules.

export const REPO_URL = "https://github.com/mogesjohnson/BEST-OF-AI-DEV";
export const hrefOf = (slug: string) => (slug ? `/why/${slug}/` : "/");
export const sourceOf = (file: string) => `${REPO_URL}/blob/main/docs/why/${file}`;

/** Group order in the sidebar. A page whose group is not listed goes last. */
export const GROUPS = ["Start here", "Change and review", "Rules and context", "Verification", "Operations"];

/** What the client shell needs for the sidebar: no HTML. */
export type NavEntry = { slug: string; title: string; summary: string; group: string };
