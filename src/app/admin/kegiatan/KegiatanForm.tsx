'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ArrowLeft, Eye } from 'lucide-react'
import Link from 'next/link'

type EventData = {
  id: string
  title: string
  description: string | null
  location: string | null
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  status: string
  coverImage: string | null
  isPublished: boolean
}

type Props = {
  event?: EventData | null
  mode: 'create' | 'edit'
}

const STATUS_OPTIONS = [
  { value: 'upcoming',  label: '🔵 Akan Datang' },
  { value: 'ongoing',   label: '🟢 Sedang Berlangsung' },
  { value: 'done',      label: '⚫ Selesai' },
  { value: 'cancelled', label: '🔴 Dibatalkan' },
]

// Format date untuk input[type=date]: YYYY-MM-DD
function toDateInput(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().split('T')[0]
}

export default function KegiatanForm({ event, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [title, setTitle]           = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [location, setLocation]     = useState(event?.location ?? '')
  const [startDate, setStartDate]   = useState(toDateInput(event?.startDate))
  const [endDate, setEndDate]       = useState(toDateInput(event?.endDate))
  const [startTime, setStartTime]   = useState(event?.startTime ?? '')
  const [endTime, setEndTime]       = useState(event?.endTime ?? '')
  const [status, setStatus]         = useState(event?.status ?? 'upcoming')
  const [coverImage, setCoverImage] = useState(event?.coverImage ?? '')
  const [isPublished, setIsPublished] = useState(event?.isPublished ?? true)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cms-kampung/events')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) setCoverImage(data.data.url)
      else alert(data.message ?? 'Upload gagal')
    } catch {
      alert('Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Judul kegiatan wajib diisi'); return }
    if (!startDate) { setError('Tanggal mulai wajib diisi'); return }

    setLoading(true)
    setError('')
    try {
      const url    = mode === 'create' ? '/api/events' : `/api/events/${event!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, location,
          startDate, endDate: endDate || null,
          startTime: startTime?.match(/^\d{2}:\d{2}$/) ? startTime : null,
          endTime: endTime?.match(/^\d{2}:\d{2}$/) ? endTime : null,
          status, coverImage: coverImage || null, isPublished,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Gagal menyimpan kegiatan'); return }

      router.push('/admin/kegiatan')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Link href="/admin/kegiatan" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div className="flex gap-3">
          <a href="/kegiatan" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
            <Eye size={15} /> Lihat Publik
          </a>
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {mode === 'create' ? 'Simpan Kegiatan' : 'Perbarui Kegiatan'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kolom kiri — info utama */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Informasi Kegiatan</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Contoh: Posyandu Rutin Bulan Oktober"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Keterangan tambahan tentang kegiatan ini..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                📍 Lokasi
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
                placeholder="Contoh: Balai Desa, RT 03/RW 01"
              />
            </div>
          </div>

          {/* Tanggal & Waktu */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Tanggal & Waktu</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tanggal Selesai <span className="text-gray-400 text-xs">(opsional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                  min={startDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Jam Mulai <span className="text-gray-400 text-xs">(opsional)</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value.replace('.', ':'))}
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">Format 24 jam, contoh: 08:00</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Jam Selesai <span className="text-gray-400 text-xs">(opsional)</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value.replace('.', ':'))}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom kanan — pengaturan */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Pengaturan</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Kegiatan</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">✅ Tampilkan di website</span>
            </label>
          </div>

          {/* Foto Cover */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Foto Kegiatan</h3>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... atau upload file"
              className="input text-sm mb-3"
            />
            <label className={`btn-secondary text-xs w-full justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading...</> : '📁 Upload Foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
            </label>
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="Preview" className="mt-3 rounded-lg w-full h-32 object-cover border" />
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
