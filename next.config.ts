import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [".prisma", "@prisma/client"],
  // Use Turbopack configuration
  turbopack: {
    // Turbopack handles TypeScript files automatically
    resolveAlias: {
      ".prisma/client": ".prisma/client",
    },
  },
};

export default nextConfig;
