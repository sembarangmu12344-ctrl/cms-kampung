'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

// Note: This is a client component that fetches its own data
// For a full implementation, split into a Server Component wrapper + this Client Component

type GalleryItem = {
  id: string
  title: string
  description?: string | null
  imageUrl: string
  isPublished: boolean
  createdAt: string
  category?: { name: string } | null
}

export default function AdminGaleriPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Fetch on mount
  if (!fetched) {
    setFetched(true)
    fetch('/api/gallery?limit=50')
      .then((r) => r.json())
      .then((d) => setPhotos(d.data ?? []))
      .catch(() => {})
  }

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
    setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !title.trim()) {
      alert('Pilih file dan isi judul foto terlebih dahulu')
      return
    }
    setUploading(true)
    try {
      // Upload file
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cms-kampung/gallery')
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const upData = await upRes.json()
      if (!upRes.ok) { alert(upData.message ?? 'Upload gagal'); return }

      // Save to gallery
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, imageUrl: upData.data.url, isPublished: true }),
      })
      const data = await res.json()
      if (res.ok) {
        setPhotos((prev) => [data.data, ...prev])
        setTitle('')
        setDescription('')
        setPreviewUrl('')
        if (fileRef.current) fileRef.current.value = ''
      } else {
        alert(data.message ?? 'Gagal menyimpan foto')
      }
    } catch {
      alert('Terjadi kesalahan')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus foto "${title}"?`)) return
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== id))
    else alert('Gagal menghapus foto')
  }

  const handleTogglePublish = async (photo: GalleryItem) => {
    const res = await fetch(`/api/gallery/${photo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !photo.isPublished }),
    })
    if (res.ok) {
      setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, isPublished: !p.isPublished } : p))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Kelola Galeri</h2>
        <p className="text-sm text-gray-500">{photos.length} foto</p>
      </div>

      {/* Upload Form */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Upload Foto Baru</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            {/* File drop area */}
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors h-40 ${previewUrl ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
              htmlFor="gallery-upload"
            >
              {previewUrl ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded" />
                </div>
              ) : (
                <>
                  <Upload size={28} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">Klik untuk pilih foto</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (maks 5MB)</p>
                </>
              )}
              <input
                id="gallery-upload"
                type="file"
                accept="image/*"
                ref={fileRef}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </label>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Foto <span className="text-red-500">*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Judul foto..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[72px]" placeholder="Keterangan foto (opsional)..." />
            </div>
            <button onClick={handleUpload} disabled={uploading || !previewUrl}
              className="btn-primary w-full justify-center">
              {uploading ? <><Loader2 size={16} className="animate-spin" />Uploading...</> : <><Upload size={16} />Upload Foto</>}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
              <Image
                src={photo.imageUrl}
                alt={photo.title}
                fill
                className={`object-cover transition-all ${!photo.isPublished ? 'opacity-50' : ''}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {!photo.isPublished && (
                <div className="absolute top-2 left-2">
                  <span className="badge badge-gray text-xs">Tersembunyi</span>
                </div>
              )}
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
                <div className="flex-1 flex items-end p-2">
                  <p className="text-white text-xs font-medium line-clamp-2">{photo.title}</p>
                </div>
                <div className="flex gap-1 p-2 justify-end">
                  <button onClick={() => handleTogglePublish(photo)}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title={photo.isPublished ? 'Sembunyikan' : 'Tampilkan'}>
                    {photo.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(photo.id, photo.title)}
                    className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                    title="Hapus">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Upload size={40} className="mx-auto mb-3" />
          <p>Belum ada foto di galeri. Upload foto pertama!</p>
        </div>
      )}
    </div>
  )
}
