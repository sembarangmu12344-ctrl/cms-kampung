import { Metadata } from 'next'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import GalleryGrid from '@/components/public/GalleryGrid'

export const metadata: Metadata = { title: 'Galeri Foto' }
export const revalidate = 300

type Props = { searchParams: Promise<{ category?: string }> }

export default async function GaleriPage({ searchParams }: Props) {
  const params = await searchParams
  const categorySlug = params.category ?? ''

  const [photos, categories] = await Promise.all([
    prisma.gallery.findMany({
      where: {
        isPublished: true,
        ...(categorySlug && { category: { slug: categorySlug } }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.category.findMany({ where: { type: 'gallery' }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Galeri Foto</h1>
        <p className="text-gray-500 mt-2">Momen dan kegiatan kampung dalam gambar</p>
      </div>

      {/* Filter kategori */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          <Link href="/galeri"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!categorySlug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Semua
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/galeri?category=${cat.slug}`}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categorySlug === cat.slug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {photos.length > 0 ? (
        <GalleryGrid photos={photos} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Belum ada foto di galeri.</p>
        </div>
      )}
    </div>
  )
}
