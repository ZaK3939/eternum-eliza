/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['tough-cookie'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:url': require.resolve('url/'),
      'node:buffer': require.resolve('buffer/'),
      'node:stream': require.resolve('stream-browserify'),
      'node:util': require.resolve('util/'),
      'node:path': require.resolve('path-browserify'),
    };
    config.experiments = { asyncWebAssembly: true, layers: true };
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
 };
 
 module.exports = nextConfig;