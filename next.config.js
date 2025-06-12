const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['mongoose'],
  },
  // If using pdfjs-dist as a module and need to copy worker file:
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   config.module.rules.push({
  //     test: /pdf\.worker\.min\.js$/,
  //     type: 'asset/resource',
  //     generator: {
  //       filename: 'static/chunks/[hash][ext][query]'
  //     }
  //   });
  //   return config;
  // },
  webpack: (config, { isServer }) => {
    // Add path alias resolution
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };

    // PDF.js worker configuration
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/build/pdf.worker.min.js': 'pdfjs-dist/build/pdf.worker.min.js',
        canvas: false,
      };
    }

    // Handle canvas in Node.js environment
    if (isServer) {
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }

    // Ensure proper path resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

module.exports = nextConfig;
