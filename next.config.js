// Next.js application configuration

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Client-side environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
  },
  
  // API routes proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`
      }
    ];
  },
  
  // Enable React strict mode
  reactStrictMode: true
};

module.exports = nextConfig;
