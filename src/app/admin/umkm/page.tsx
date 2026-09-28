import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Search, Star } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import DeleteButton from '../berita/DeleteButton'

export const metadata: Metadata = { title: 'Kelola UMKM | Admin' }
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ page?: string; search?: string; category?: string }> }

export default async function AdminUmkmPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 15
  const skip = (page - 1) * limit
  const search = params.search ?? ''
  const categorySlug = params.category ?? ''

  const where = {
    ...(search && {
      OR: [
        { businessName: { contains: search, mode: 'insensitive' as const } },
        { ownerName: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(categorySlug && { category: { slug: categorySlug } }),
  }

  const [umkm, total, categories] = await Promise.all([
    prisma.umkm.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, businessName: true, ownerName: true, slug: true,
        isActive: true, isFeatured: true, whatsapp: true, createdAt: true,
        category: { select: { name: true, slug: true } },
        _count: { select: { photos: true } },
      },
    }),
    prisma.umkm.count({ where }),
    prisma.category.findMany({ where: { type: 'umkm' }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  const buildUrl = (p: number, cat?: string, q?: string) => {
    const sp = new URLSearchParams()
    if (p > 1) sp.set('page', p.toString())
    if (cat) sp.set('category', cat)
    if (q) sp.set('search', q)
    return `/admin/umkm${sp.toString() ? `?${sp}` : ''}`
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola UMKM</h2>
          <p className="text-sm text-gray-500">{total} UMKM terdaftar</p>
        </div>
        <Link href="/admin/umkm/tambah" className="btn-primary shrink-0">
          <Plus size={16} /> Tambah UMKM
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/umkm" className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input name="search" defaultValue={search} placeholder="Cari nama usaha atau pemilik..." className="input pl-9 text-sm" />
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
        </form>
        <div className="flex gap-2 flex-wrap">
          <Link href={buildUrl(1, '', search)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!categorySlug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Semua
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={buildUrl(1, cat.slug, search)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${categorySlug === cat.slug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat.name}
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Usaha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Pemilik</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Foto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Dibuat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {umkm.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Tidak ada UMKM.</td></tr>
              ) : umkm.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {u.isFeatured && <Star size={13} className="text-yellow-500 shrink-0" fill="currentColor" />}
                      <Link href={`/admin/umkm/${u.id}`}
                        className="font-medium text-gray-800 hover:text-primary-700 line-clamp-1">
                        {u.businessName}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u.ownerName}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u.category?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{u._count.photos} foto</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/umkm/${u.id}`} className="text-xs text-primary-600 hover:text-primary-800 font-medium">Edit</Link>
                      <DeleteButton id={u.id} title={u.businessName} type="umkm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && <Link href={buildUrl(page - 1, categorySlug, search)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">← Sebelumnya</Link>}
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
          {page < totalPages && <Link href={buildUrl(page + 1, categorySlug, search)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">Berikutnya →</Link>}
        </div>
      )}
    </div>
  )
}
