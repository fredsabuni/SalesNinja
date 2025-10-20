/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix chunk loading issues
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-select', 
      '@radix-ui/react-toast',
      'lucide-react'
    ],
    // Disable turbopack for now to fix SSR chunk issues
    turbo: undefined
  },
  
  // Optimize webpack for stable chunks
  webpack: (config, { dev, isServer }) => {
    // Fix SSR chunk loading issues
    if (isServer) {
      config.optimization.splitChunks = false;
    } else if (!dev) {
      // Only optimize client-side chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          }
        }
      };
    }
    return config;
  },
  
  // Disable problematic features that can cause chunk issues
  poweredByHeader: false,
  generateEtags: false,
  
  // Output configuration - disable standalone for Netlify
  output: undefined
};

module.exports = nextConfig;