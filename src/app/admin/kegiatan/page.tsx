import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Calendar, MapPin, Clock, Pencil, Trash2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import DeleteKegiatanButton from './DeleteKegiatanButton'

export const metadata: Metadata = { title: 'Kelola Kegiatan | Admin' }
export const dynamic = 'force-dynamic'

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  upcoming:  { label: 'Akan Datang',    badge: 'badge-blue'   },
  ongoing:   { label: 'Berlangsung',    badge: 'badge-green'  },
  done:      { label: 'Selesai',        badge: 'badge-gray'   },
  cancelled: { label: 'Dibatalkan',     badge: 'badge-red'    },
}

export default async function AdminKegiatanPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: 'asc' },
    include: { author: { select: { name: true } } },
  })

  const upcoming  = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
  const past      = events.filter((e) => e.status === 'done' || e.status === 'cancelled')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Kegiatan</h2>
          <p className="text-sm text-gray-500">{events.length} kegiatan terdaftar</p>
        </div>
        <Link href="/admin/kegiatan/tambah" className="btn-primary text-sm">
          <Plus size={16} /> Tambah Kegiatan
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">Belum ada kegiatan.</p>
          <Link href="/admin/kegiatan/tambah" className="btn-primary text-sm">
            <Plus size={15} /> Tambah Kegiatan Pertama
          </Link>
        </div>
      ) : (
        <>
          {/* Mendatang & Berlangsung */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Mendatang & Berlangsung ({upcoming.length})
              </h3>
              <div className="space-y-2">
                {upcoming.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Selesai & Dibatalkan */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                Selesai & Dibatalkan ({past.length})
              </h3>
              <div className="space-y-2 opacity-75">
                {past.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EventRow({ event }: {
  event: {
    id: string
    title: string
    location: string | null
    startDate: Date
    startTime: string | null
    endTime: string | null
    status: string
    isPublished: boolean
    author: { name: string } | null
  }
}) {
  const cfg = STATUS_CONFIG[event.status] ?? { label: event.status, badge: 'badge-gray' }
  const start = new Date(event.startDate)
  const dayNum   = start.getDate()
  const monthStr = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(start)

  return (
    <div className="card flex items-center gap-4 px-4 py-3 hover:shadow-sm transition-shadow">
      {/* Tanggal */}
      <div className={`shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center text-white ${event.status === 'ongoing' ? 'bg-green-500' : event.status === 'upcoming' ? 'bg-primary-600' : 'bg-gray-400'}`}>
        <span className="text-lg font-bold leading-none">{dayNum}</span>
        <span className="text-[10px] uppercase">{monthStr}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{event.title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={11} /> {formatDate(event.startDate)}{event.startTime ? ` · ${event.startTime}` : ''}{event.endTime ? `–${event.endTime}` : ''}
          </span>
          {event.location && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={11} /> {event.location}
            </span>
          )}
        </div>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`badge ${cfg.badge} hidden sm:inline-flex`}>{cfg.label}</span>
        {!event.isPublished && (
          <span className="badge badge-gray hidden sm:inline-flex">Tersembunyi</span>
        )}

        {/* Aksi */}
        <Link href={`/admin/kegiatan/${event.id}`}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Edit">
          <Pencil size={15} />
        </Link>
        <DeleteKegiatanButton id={event.id} title={event.title} />
      </div>
    </div>
  )
}
