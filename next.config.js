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
      asyncWebAssembly: true,
      layers: true,
    };

    // Add WASM MIME type
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Cache model files
    config.module.rules.push({
      test: /\.safetensors$/,
      type: 'asset/resource',
    });

    return config;
  },
  // Increase build memory limit
  experimental: {
    largePageDataBytes: 128 * 1000000, // 128MB
  }
}

module.exports = nextConfig 