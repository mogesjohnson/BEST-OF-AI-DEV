import path from "node:path";
import type { NextConfig } from "next";

// Static export: `npm run build` writes plain HTML to out/. No server, no runtime cost.
// BASE_PATH lets the same build live under a subpath, for example /BEST-OF-AI-DEV on GitHub Pages.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  // The repo root has its own lockfile. Pin the root so Next does not guess.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
