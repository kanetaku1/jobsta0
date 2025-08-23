import type { NextConfig } from 'next';

module.exports = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
