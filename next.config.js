/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Untuk development: matikan optimasi agar /uploads/ lokal bisa tampil
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    // Naikkan batas body size ke 15MB untuk upload file hingga 10MB
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
}

module.exports = nextConfig
