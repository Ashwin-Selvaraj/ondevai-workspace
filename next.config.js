/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  customWorkerDir: 'worker',
  // Exclude model weight files from precache — they're handled by the custom worker
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    // Offline fallback for navigation
    {
      urlPattern: /^\/$/,
      handler: 'NetworkFirst',
      options: { cacheName: 'start-url' },
    },
  ],
});

const nextConfig = {
  // REQUIRED: WebLLM needs SharedArrayBuffer which requires these headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },

  webpack: (config) => {
    config.externals = config.externals || [];

    // Exclude native Node binaries (onnxruntime-node) — we use the WASM/web version
    config.externals.push('onnxruntime-node');

    // Handle WASM files
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Treat .mjs files in node_modules as ES modules so import.meta is valid
    // (onnxruntime-web ships ort.bundle.min.mjs which uses import.meta.url)
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Fallbacks for browser environment
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);
