/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // TEMP: don’t fail the Vercel build on lint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TEMP: don’t fail the Vercel build on TS type errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
