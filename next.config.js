/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig