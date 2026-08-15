import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./plantillas/**/*', './src/lib/**/*'],
  },
};

export default nextConfig;
