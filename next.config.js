/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/materials/:path*\\.(pdf|ipynb)',
        destination: '/materials/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
