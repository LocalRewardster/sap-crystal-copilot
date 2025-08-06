/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_APP_NAME: 'SAP Crystal Copilot AI Report Editor',
    NEXT_PUBLIC_VERSION: '1.0.0',
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  
  // App directory is now stable in Next.js 14
  // experimental: {
  //   appDir: true,
  // },
};

module.exports = nextConfig;