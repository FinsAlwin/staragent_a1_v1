const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: ["localhost"],
    unoptimized: true, // Required for Amplify
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET,
    NEXT_PUBLIC_MONGODB_URI: process.env.NEXT_PUBLIC_MONGODB_URI,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  // For AWS Amplify deployment
  poweredByHeader: false,
  compress: true,
  // Handle file uploads and CORS
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
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
      "@": path.resolve(__dirname),
    };

    // PDF.js worker configuration
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdfjs-dist/build/pdf.worker.min.js":
          "pdfjs-dist/build/pdf.worker.min.js",
        canvas: false,
      };
    }

    // Handle canvas in Node.js environment
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
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
