/** @type {import('next').NextConfig} */
const nextConfig = {
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