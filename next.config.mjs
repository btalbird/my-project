import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native N-API bindings — Turbopack cannot place them in ESM chunks (Vercel build error:
  // "non-ecmascript placeable asset"). Load from node_modules at runtime instead.
  serverExternalPackages: ["@resvg/resvg-js"],
  // Turbopack can infer the wrong workspace root (e.g. `./app`), then fail to resolve `next`.
  // Root must be absolute — see https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
