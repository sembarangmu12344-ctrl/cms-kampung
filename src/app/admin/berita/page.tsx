import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Search, Eye, Pin } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import DeleteButton from './DeleteButton'

export const metadata: Metadata = { title: 'Kelola Berita | Admin' }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ page?: string; status?: string; search?: string }> }

const STATUS_BADGE: Record<string, string> = {
  published: 'badge-green',
  draft:     'badge-yellow',
  archived:  'badge-gray',
}
const STATUS_LABEL: Record<string, string> = {
  published: 'Publik',
  draft:     'Draft',
  archived:  'Arsip',
}

export default async function AdminBeritaPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 15
  const skip = (page - 1) * limit
  const status = params.status ?? ''
  const search = params.search ?? ''

  const where = {
    ...(status && { status: status as 'published' | 'draft' | 'archived' }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, status: true,
        isPinned: true, views: true, publishedAt: true, createdAt: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.news.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  const buildUrl = (p: number, s?: string, q?: string) => {
    const sp = new URLSearchParams()
    if (p > 1) sp.set('page', p.toString())
    if (s) sp.set('status', s)
    if (q) sp.set('search', q)
    return `/admin/berita${sp.toString() ? `?${sp}` : ''}`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Berita</h2>
          <p className="text-sm text-gray-500">{total} berita total</p>
        </div>
        <Link href="/admin/berita/tambah" className="btn-primary shrink-0">
          <Plus size={16} /> Tulis Berita
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/berita" className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input name="search" defaultValue={search} placeholder="Cari judul berita..." className="input pl-9 text-sm" />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
        <div className="flex gap-2 flex-wrap">
          {['', 'published', 'draft', 'archived'].map((s) => (
            <Link key={s} href={buildUrl(1, s, search)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === '' ? 'Semua' : STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Penulis</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell w-16">Views</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Tidak ada berita.
                  </td>
                </tr>
              ) : news.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex items-start gap-1.5">
                      {n.isPinned && <Pin size={13} className="text-yellow-500 mt-0.5 shrink-0" />}
                      <Link href={`/admin/berita/${n.id}`}
                        className="font-medium text-gray-800 hover:text-primary-700 line-clamp-2">
                        {n.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {n.category?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_BADGE[n.status]}`}>
                      {STATUS_LABEL[n.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {n.author?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {formatDate(n.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    <span className="flex items-center gap-1"><Eye size={13} />{n.views}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/berita/${n.id}`}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                        Edit
                      </Link>
                      <DeleteButton id={n.id} title={n.title} type="news" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={buildUrl(page - 1, status, search)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">
              ← Sebelumnya
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={buildUrl(page + 1, status, search)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
