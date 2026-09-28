import { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import prisma from '@/lib/prisma'
import UmkmCard from '@/components/public/UmkmCard'
import type { UmkmListItem } from '@/types'

export const metadata: Metadata = { title: 'Direktori UMKM' }
export const revalidate = 300

type Props = { searchParams: Promise<{ page?: string; category?: string; search?: string }> }

export default async function UmkmPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 12
  const skip = (page - 1) * limit
  const categorySlug = params.category ?? ''
  const search = params.search ?? ''

  const where = {
    isActive: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { businessName: { contains: search, mode: 'insensitive' as const } },
        { ownerName: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [umkmRaw, total, categories] = await Promise.all([
    prisma.umkm.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, businessName: true, ownerName: true, slug: true,
        description: true, whatsapp: true, address: true,
        coverImage: true, isActive: true, isFeatured: true, createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { photos: true } },
      },
    }),
    prisma.umkm.count({ where }),
    prisma.category.findMany({ where: { type: 'umkm' }, orderBy: { name: 'asc' } }),
  ])

  const umkm = umkmRaw as UmkmListItem[]
  const totalPages = Math.ceil(total / limit)

  const buildUrl = (p: number, cat?: string, q?: string) => {
    const sp = new URLSearchParams()
    if (p > 1) sp.set('page', p.toString())
    if (cat) sp.set('category', cat)
    if (q) sp.set('search', q)
    return `/umkm${sp.toString() ? `?${sp}` : ''}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Direktori UMKM</h1>
        <p className="text-gray-500 mt-2">Temukan produk dan jasa dari warga kampung kami</p>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form method="GET" action="/umkm" className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input name="search" defaultValue={search} placeholder="Cari UMKM..." className="input pl-9" />
        </form>
        <div className="flex gap-2 flex-wrap">
          <Link href="/umkm"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!categorySlug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Semua
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={buildUrl(1, cat.slug, search)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categorySlug === cat.slug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {umkm.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
            {umkm.map((u) => <UmkmCard key={u.id} umkm={u} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {page > 1 && (
                <Link href={buildUrl(page - 1, categorySlug, search)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">
                  ← Sebelumnya
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
              {page < totalPages && (
                <Link href={buildUrl(page + 1, categorySlug, search)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">
                  Berikutnya →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Belum ada UMKM{search ? ` untuk "${search}"` : ''}.</p>
        </div>
      )}
    </div>
  )
}
