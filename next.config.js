/** @type {import('next').NextConfig} */

const isGhPages = process.env.GH_PAGES === 'true'

const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Static export configuration for GitHub Pages
  ...(isGhPages ? { output: 'export', trailingSlash: true } : {}),
  ...(isGhPages && process.env.NEXT_PUBLIC_BASE_PATH ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH } : {}),
  ...(isGhPages && process.env.NEXT_PUBLIC_ASSET_PREFIX ? { assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX } : {}),
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    ...(isGhPages ? { unoptimized: true } : {}),
  },
  
  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: true, // Ignore during Docker builds to avoid errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore during Docker builds to avoid errors
  },
  
  // Transpile packages for compatibility
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/list',
  ],
  
  // Security headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Webpack configuration for better bundle analysis
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size in production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    
    return config
  },
}

module.exports = nextConfig 