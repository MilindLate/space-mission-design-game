/** @type {import('next').NextConfig} */
const nextConfig = {
  // R3F and Three.js require these to be transpiled
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Disable static export — game is fully client-side
  output: undefined,
  experimental: {
    // Needed for zustand immer middleware with App Router
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  webpack: (config) => {
    // Handle Three.js shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    return config;
  },
};

module.exports = nextConfig;
