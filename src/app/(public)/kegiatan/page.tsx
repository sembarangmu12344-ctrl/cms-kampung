import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Kegiatan Kampung' }
export const revalidate = 300

type Props = { searchParams: Promise<{ status?: string }> }

const STATUS_CONFIG = {
  upcoming:  { label: 'Akan Datang', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  ongoing:   { label: 'Berlangsung', bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500 animate-pulse'  },
  done:      { label: 'Selesai',     bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  cancelled: { label: 'Dibatalkan',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400'    },
}

export default async function KegiatanPage({ searchParams }: Props) {
  const params = await searchParams
  const statusFilter = params.status ?? ''

  const where = {
    isPublished: true,
    ...(statusFilter && { status: statusFilter as keyof typeof STATUS_CONFIG }),
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
    include: { author: { select: { name: true } } },
  })

  // Kelompokkan per bulan
  const grouped: Record<string, typeof events> = {}
  for (const event of events) {
    const key = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
      .format(new Date(event.startDate))
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(event)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kegiatan Kampung</h1>
        <p className="text-gray-500 mt-2">Jadwal dan agenda kegiatan warga kampung</p>
      </div>

      {/* Filter status */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Link href="/kegiatan"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Semua
        </Link>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <Link key={key} href={`/kegiatan?status=${key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${statusFilter === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <span className={`w-2 h-2 rounded-full ${statusFilter === key ? 'bg-white' : cfg.dot}`} />
            {cfg.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      {events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Belum ada kegiatan{statusFilter ? ` dengan status "${STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              {/* Header bulan */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800">{month}</h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{monthEvents.length} kegiatan</span>
              </div>

              {/* List kegiatan */}
              <div className="space-y-3">
                {monthEvents.map((event) => {
                  const cfg = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG]
                  const start = new Date(event.startDate)
                  const dayNum = start.getDate()
                  const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(start)

                  return (
                    <div key={event.id}
                      className={`flex gap-4 p-4 rounded-2xl border transition-shadow hover:shadow-md ${event.status === 'done' || event.status === 'cancelled' ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200'}`}>

                      {/* Tanggal */}
                      <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${event.status === 'upcoming' ? 'bg-primary-600' : event.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className="text-xs text-white/80 uppercase font-medium">{dayName}</span>
                        <span className="text-xl font-bold text-white leading-none">{dayNum}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-800">{event.title}</h3>
                          <span className={`badge shrink-0 ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                          {/* Waktu */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>
                              {formatDate(event.startDate)}
                              {event.startTime && ` · ${event.startTime}`}
                              {event.endTime && ` – ${event.endTime} WIB`}
                              {event.endDate && event.endDate.toString() !== event.startDate.toString() && (
                                <> s/d {formatDate(event.endDate)}</>
                              )}
                            </span>
                          </div>

                          {/* Lokasi */}
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={12} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Deskripsi */}
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
