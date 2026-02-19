/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/whatafounder',
  images: {
    domains: [],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/whatafounder',
        permanent: false,
        basePath: false,
      },
    ]
  },
}

module.exports = nextConfig
