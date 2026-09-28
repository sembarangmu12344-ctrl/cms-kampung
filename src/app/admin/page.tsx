import { Metadata } from 'next'
import Link from 'next/link'
import { Newspaper, Store, Image, Eye, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  const [
    totalNews, publishedNews, draftNews,
    totalUmkm, activeUmkm,
    totalGallery,
    recentNews, recentUmkm,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { status: 'published' } }),
    prisma.news.count({ where: { status: 'draft' } }),
    prisma.umkm.count(),
    prisma.umkm.count({ where: { isActive: true } }),
    prisma.gallery.count(),
    prisma.news.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, status: true,
        views: true, createdAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.umkm.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, businessName: true, ownerName: true,
        isActive: true, isFeatured: true, createdAt: true,
        category: { select: { name: true } },
      },
    }),
  ])

  const STATUS_BADGE: Record<string, string> = {
    published: 'badge-green',
    draft: 'badge-yellow',
    archived: 'badge-gray',
  }
  const STATUS_LABEL: Record<string, string> = {
    published: 'Publik',
    draft: 'Draft',
    archived: 'Arsip',
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Halo, {user?.name} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di panel admin CMS Kampung.</p>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Berita',
            value: totalNews,
            sub: `${publishedNews} publik · ${draftNews} draft`,
            icon: Newspaper,
            color: 'bg-blue-50 text-blue-600',
            href: '/admin/berita',
          },
          {
            label: 'Total UMKM',
            value: totalUmkm,
            sub: `${activeUmkm} aktif`,
            icon: Store,
            color: 'bg-green-50 text-green-600',
            href: '/admin/umkm',
          },
          {
            label: 'Total Galeri',
            value: totalGallery,
            sub: 'foto publik',
            icon: Image,
            color: 'bg-purple-50 text-purple-600',
            href: '/admin/galeri',
          },
          {
            label: 'Total Views',
            value: recentNews.reduce((s, n) => s + n.views, 0),
            sub: 'dari 5 berita terbaru',
            icon: Eye,
            color: 'bg-orange-50 text-orange-600',
            href: '/admin/berita',
          },
        ].map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="card p-5 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
              {value}
            </p>
            <p className="text-sm text-gray-600 font-medium mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* ─── Quick Actions ────────────────────────────────── */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Aksi Cepat
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/berita/tambah" className="btn-primary text-sm">
            <Plus size={16} /> Tulis Berita
          </Link>
          <Link href="/admin/umkm/tambah" className="btn-primary text-sm bg-green-600 hover:bg-green-700">
            <Plus size={16} /> Tambah UMKM
          </Link>
          <Link href="/admin/galeri" className="btn-secondary text-sm">
            <Plus size={16} /> Upload Foto
          </Link>
        </div>
      </div>

      {/* ─── Recent Content ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Newspaper size={16} className="text-blue-500" /> Berita Terbaru
            </h3>
            <Link href="/admin/berita" className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1">
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentNews.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Belum ada berita.</p>
            ) : recentNews.map((n) => (
              <div key={n.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/berita/${n.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-primary-700 line-clamp-1 flex-1">
                    {n.title}
                  </Link>
                  <span className={`${STATUS_BADGE[n.status]} badge shrink-0`}>
                    {STATUS_LABEL[n.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{n.author?.name}</span>
                  <span>{formatDate(n.createdAt)}</span>
                  <span className="flex items-center gap-1"><Eye size={11} />{n.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent UMKM */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Store size={16} className="text-green-500" /> UMKM Terbaru
            </h3>
            <Link href="/admin/umkm" className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1">
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUmkm.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Belum ada UMKM.</p>
            ) : recentUmkm.map((u) => (
              <div key={u.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/umkm/${u.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-primary-700 line-clamp-1 flex-1">
                    {u.businessName}
                  </Link>
                  <span className={u.isActive ? 'badge-green badge' : 'badge-gray badge'}>
                    {u.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{u.ownerName}</span>
                  {u.category && <span>{u.category.name}</span>}
                  <span>{formatDate(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
