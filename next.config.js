/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  },
  webpack: (config) => {
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  // Increase build memory limit
  experimental: {
    largePageDataBytes: 128 * 1000000, // 128MB
  }
}

module.exports = nextConfig 