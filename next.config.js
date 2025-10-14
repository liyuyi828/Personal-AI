/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Electron: keep images unoptimized since we're using file:// protocol
  images: {
    unoptimized: true,
  },
  // Uncomment the lines below if you need to build a static export for production
  // output: 'export',
  // distDir: 'out',
};

module.exports = nextConfig;