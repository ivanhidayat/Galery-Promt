// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Work around Windows EPERM spawn issues during local builds.
    webpackBuildWorker: false,
    // Prefer worker_threads over child processes for type checking/linting.
    workerThreads: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gallery',
        permanent: false,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Untuk placeholder dev
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

export default nextConfig
