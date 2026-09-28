import { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import prisma from '@/lib/prisma'
import NewsCard from '@/components/public/NewsCard'
import type { NewsListItem } from '@/types'

export const metadata: Metadata = { title: 'Berita & Pengumuman' }
export const revalidate = 300

type Props = { searchParams: Promise<{ page?: string; category?: string; search?: string }> }

export default async function BeritaPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 9
  const skip = (page - 1) * limit
  const categorySlug = params.category ?? ''
  const search = params.search ?? ''

  const where = {
    status: 'published' as const,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [newsRaw, total, categories] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImage: true, status: true, isPinned: true,
        views: true, publishedAt: true, createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.news.count({ where }),
    prisma.category.findMany({ where: { type: 'news' }, orderBy: { name: 'asc' } }),
  ])

  const news = newsRaw as NewsListItem[]
  const totalPages = Math.ceil(total / limit)

  const buildUrl = (p: number, cat?: string, q?: string) => {
    const sp = new URLSearchParams()
    if (p > 1) sp.set('page', p.toString())
    if (cat) sp.set('category', cat)
    if (q) sp.set('search', q)
    return `/berita${sp.toString() ? `?${sp}` : ''}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Berita & Pengumuman</h1>
        <p className="text-gray-500 mt-2">Informasi terkini seputar kampung</p>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form method="GET" action="/berita" className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari berita..."
            className="input pl-9"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          <Link href="/berita"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!categorySlug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Semua
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id}
              href={buildUrl(1, cat.slug, search)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categorySlug === cat.slug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {news.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {news.map((n) => <NewsCard key={n.id} news={n} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {page > 1 && (
                <Link href={buildUrl(page - 1, categorySlug, search)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">
                  ← Sebelumnya
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
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
          <p className="text-lg">Belum ada berita{search ? ` untuk "${search}"` : ''}.</p>
        </div>
      )}
    </div>
  )
}
