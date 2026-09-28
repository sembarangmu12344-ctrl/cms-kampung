import Link from 'next/link'
import { ArrowRight, Users, Home, MapPin, Newspaper, Store, Image as ImageIcon, CalendarDays, Clock } from 'lucide-react'
import prisma from '@/lib/prisma'
import NewsCard from '@/components/public/NewsCard'
import UmkmCard from '@/components/public/UmkmCard'
import AnnouncementPopup from '@/components/public/AnnouncementPopup'
import { formatDate } from '@/lib/utils'
import type { VillageInfoFull, NewsListItem, UmkmListItem, VillageStatistics } from '@/types'

export const revalidate = 300

export default async function BerandaPage() {
  const [village, newsRaw, umkmRaw, galleryCount, pinnedRaw, upcomingEvents] = await Promise.all([
    prisma.villageInfo.findFirst(),
    prisma.news.findMany({
      where: { status: 'published' },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 6,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImage: true, status: true, isPinned: true,
        views: true, publishedAt: true, createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.umkm.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      select: {
        id: true, businessName: true, ownerName: true, slug: true,
        description: true, whatsapp: true, address: true,
        coverImage: true, isActive: true, isFeatured: true, createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { photos: true } },
      },
    }),
    prisma.gallery.count({ where: { isPublished: true } }),
    // Ambil berita yang di-pin untuk popup pengumuman (maks 5)
    prisma.news.findMany({
      where: { status: 'published', isPinned: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImage: true, publishedAt: true, createdAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    // Ambil 4 kegiatan mendatang untuk widget beranda
    prisma.event.findMany({
      where: {
        isPublished: true,
        status: { in: ['upcoming', 'ongoing'] },
        startDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      orderBy: { startDate: 'asc' },
      take: 4,
    }),
  ])

  const villageData = village as VillageInfoFull | null
  const news = newsRaw as NewsListItem[]
  const umkm = umkmRaw as UmkmListItem[]
  const stats = villageData?.statistics as VillageStatistics | null
  const featuredNews = news[0]
  const restNews = news.slice(1, 5)

  // Konversi date ke string untuk client component
  const announcements = pinnedRaw.map((n) => ({
    ...n,
    publishedAt: n.publishedAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <>
      {/* Popup Pengumuman — muncul otomatis jika ada berita yang di-pin */}
      <AnnouncementPopup announcements={announcements} />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-red-900 via-primary-700 to-red-800 text-white overflow-hidden">
        {/* Motif dekoratif Pancasila */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/2 translate-y-1/2" />
        </div>
        {/* Stripe merah-putih di sisi kanan */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white opacity-30" />
        {villageData?.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={villageData.bannerUrl}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-primary-200 font-medium mb-2 text-sm tracking-wider uppercase">
              Selamat Datang di
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {villageData?.name ?? 'Kampung Sejahtera'}
            </h1>
            {villageData?.tagline && (
              <p className="text-xl text-primary-100 mb-6 italic">"{villageData.tagline}"</p>
            )}
            {villageData?.description && (
              <p className="text-primary-100 leading-relaxed mb-8 line-clamp-3">
                {villageData.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href="/profil" className="btn-primary bg-white text-primary-700 hover:bg-primary-50">
                Profil Kampung <ArrowRight size={16} />
              </Link>
              <Link href="/umkm" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-white text-white font-medium text-sm hover:bg-white hover:text-primary-700 transition-colors">
                Direktori UMKM
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── STATISTIK ────────────────────────────────────── */}
      {stats && (
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users,   label: 'Penduduk',  value: stats.population?.toLocaleString('id-ID') ?? '-' },
                { icon: Home,    label: 'KK',         value: stats.households?.toLocaleString('id-ID') ?? '-' },
                { icon: MapPin,  label: 'Luas (km²)', value: stats.area_km2?.toString() ?? '-' },
                { icon: Store,   label: 'UMKM Aktif', value: umkm.length.toString() + '+' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-primary-50">
                  <Icon size={24} className="text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary-700">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── BERITA TERBARU ───────────────────────────────── */}
      {news.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Berita & Pengumuman</h2>
                <p className="text-gray-500 text-sm mt-1">Informasi terkini dari kampung</p>
              </div>
              <Link href="/berita" className="text-sm text-primary-600 font-medium hover:text-primary-800 flex items-center gap-1">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>

            {/* Featured + grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredNews && (
                <div className="lg:col-span-2">
                  <NewsCard news={featuredNews} variant="featured" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {restNews.map((n) => (
                  <NewsCard key={n.id} news={n} variant="horizontal" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── UMKM UNGGULAN ────────────────────────────────── */}
      {umkm.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Direktori UMKM</h2>
                <p className="text-gray-500 text-sm mt-1">Produk dan jasa unggulan warga kampung</p>
              </div>
              <Link href="/umkm" className="text-sm text-primary-600 font-medium hover:text-primary-800 flex items-center gap-1">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {umkm.slice(0, 6).map((u) => (
                <UmkmCard key={u.id} umkm={u} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA GALERI ───────────────────────────────────── */}
      {galleryCount > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ImageIcon size={40} className="text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Galeri Foto</h2>
            <p className="text-gray-500 mb-6">{galleryCount} foto kegiatan dan momen kampung</p>
            <Link href="/galeri" className="btn-primary">
              Lihat Galeri <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ─── WIDGET KEGIATAN MENDATANG ────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kegiatan Mendatang</h2>
                <p className="text-gray-500 text-sm mt-1">Agenda dan jadwal kegiatan warga kampung</p>
              </div>
              <Link href="/kegiatan" className="text-sm text-primary-600 font-medium hover:text-primary-800 flex items-center gap-1">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.map((event) => {
                const start = new Date(event.startDate)
                const dayNum = start.getDate()
                const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(start)
                const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(start)
                const isOngoing = event.status === 'ongoing'

                return (
                  <div key={event.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Tanggal header */}
                    <div className={`px-4 py-3 flex items-center gap-3 ${isOngoing ? 'bg-green-500' : 'bg-primary-600'}`}>
                      <div className="text-center">
                        <p className="text-xs text-white/70 uppercase font-medium">{dayName}</p>
                        <p className="text-2xl font-bold text-white leading-none">{dayNum}</p>
                        <p className="text-xs text-white/70 uppercase">{monthName}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug">
                          {event.title}
                        </h3>
                        {isOngoing && (
                          <span className="inline-flex items-center gap-1 text-xs text-white/90 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Berlangsung
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detail */}
                    <div className="px-4 py-3 space-y-1.5">
                      {event.startTime && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={12} className="text-primary-400 shrink-0" />
                          <span>
                            {event.startTime}{event.endTime ? ` – ${event.endTime} WIB` : ' WIB'}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={12} className="text-primary-400 shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 pt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tombol lihat semua di bawah */}
            <div className="text-center mt-6">
              <Link href="/kegiatan" className="btn-secondary text-sm">
                <CalendarDays size={16} /> Lihat Semua Jadwal Kegiatan
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── SHORTCUT MENU ────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-r from-red-900 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold mb-2">Layanan Kampung</h2>
          <p className="text-center text-red-200 text-sm mb-8">Akses cepat informasi kampung</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { href: '/profil',    icon: Home,         label: 'Profil Kampung', desc: 'Sejarah & visi misi' },
              { href: '/berita',    icon: Newspaper,    label: 'Berita',         desc: 'Info & pengumuman' },
              { href: '/umkm',      icon: Store,        label: 'UMKM',           desc: 'Produk warga' },
              { href: '/kegiatan',  icon: CalendarDays, label: 'Kegiatan',       desc: 'Jadwal agenda' },
              { href: '/galeri',    icon: ImageIcon,    label: 'Galeri',         desc: 'Foto kegiatan' },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-5 text-center transition-all hover:border-gold-400/50 group">
                <Icon size={28} className="mx-auto mb-3 text-gold-300 group-hover:text-gold-200 transition-colors" />
                <p className="font-semibold">{label}</p>
                <p className="text-xs text-red-200 mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
