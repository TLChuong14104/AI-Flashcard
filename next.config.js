/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/AI-Flashcard',
  assetPrefix: '/AI-Flashcard/',
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
