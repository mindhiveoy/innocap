/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      enabled: true,
    },
  },
  outputFileTracingExcludes: {
    // Vercel bundles traced files per-serverless function. The webpack/swc caches inside
    // `.next/cache` are huge and not needed at runtime, but can get pulled into the trace,
    // pushing functions over the 250MB unzipped limit.
    '*': ['.next/cache/webpack/**', '.next/cache/swc/**'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'removeViewBox',
                  active: false
                }
              ]
            }
          }
        },
        'url-loader'
      ]
    });

    return config;
  },
};

module.exports = nextConfig; 