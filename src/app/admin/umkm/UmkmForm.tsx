'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ArrowLeft, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Category, Umkm, UmkmPhoto } from '@/types'

type Props = {
  categories: Category[]
  umkm?: (Umkm & { photos?: UmkmPhoto[] }) | null
  mode: 'create' | 'edit'
}

export default function UmkmForm({ categories, umkm, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState<UmkmPhoto[]>(umkm?.photos ?? [])

  const [businessName, setBusinessName] = useState(umkm?.businessName ?? '')
  const [ownerName, setOwnerName] = useState(umkm?.ownerName ?? '')
  const [description, setDescription] = useState(umkm?.description ?? '')
  const [whatsapp, setWhatsapp] = useState(umkm?.whatsapp ?? '')
  const [address, setAddress] = useState(umkm?.address ?? '')
  const [mapsLink, setMapsLink] = useState(umkm?.mapsLink ?? '')
  const [coverImage, setCoverImage] = useState(umkm?.coverImage ?? '')
  const [categoryId, setCategoryId] = useState(umkm?.categoryId ?? '')
  const [isActive, setIsActive] = useState(umkm?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(umkm?.isFeatured ?? false)

  const handleImageUpload = async (file: File, type: 'cover' | 'product') => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cms-kampung/umkm')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { alert(data.message ?? 'Upload gagal'); return }

      if (type === 'cover') {
        setCoverImage(data.data.url)
      } else if (umkm?.id) {
        // Upload foto produk
        const pfd = new FormData()
        pfd.append('photo', file)
        const pRes = await fetch(`/api/umkm/${umkm.id}/photos/upload`, { method: 'POST', body: pfd })
        const pData = await pRes.json()
        if (pRes.ok) setPhotos((prev) => [...prev, pData.data])
        else alert(pData.message ?? 'Upload foto produk gagal')
      }
    } catch {
      alert('Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!umkm?.id || !confirm('Hapus foto ini?')) return
    const res = await fetch(`/api/umkm/${umkm.id}/photos/${photoId}`, { method: 'DELETE' })
    if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    else alert('Gagal menghapus foto')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = mode === 'create' ? '/api/umkm' : `/api/umkm/${umkm!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName, ownerName, description, whatsapp,
          address, mapsLink, coverImage,
          categoryId: categoryId || null,
          isActive, isFeatured,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Tampilkan error detail kalau ada
        if (data.errors && typeof data.errors === 'object') {
          const errMsg = Object.entries(data.errors)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n')
          setError(errMsg)
        } else {
          setError(data.message ?? 'Gagal menyimpan')
        }
        return
      }
      router.push('/admin/umkm')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/umkm" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div className="flex gap-3">
          {umkm?.slug && (
            <a href={`/umkm/${umkm.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
              <Eye size={15} /> Preview
            </a>
          )}
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {mode === 'create' ? 'Simpan UMKM' : 'Perbarui UMKM'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Usaha <span className="text-red-500">*</span></label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input" required placeholder="Warung Bu Sari" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Pemilik <span className="text-red-500">*</span></label>
                <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="input" required placeholder="Sari Wulandari" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[120px]" placeholder="Ceritakan tentang usaha ini..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input min-h-[72px]" placeholder="RT 01/RW 02, Kampung Sejahtera..." />
            </div>
          </div>

          {/* Kontak */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Informasi Kontak</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input" placeholder="628123456789" />
                <p className="text-xs text-gray-400 mt-1">Format: 628xxxxxxxxxx</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Google Maps</label>
                <input value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} className="input" placeholder="https://maps.google.com/..." type="url" />
              </div>
            </div>
          </div>

          {/* Foto Produk (edit mode only) */}
          {mode === 'edit' && umkm?.id && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Foto Produk ({photos.length}/10)</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.photoUrl} alt="" className="w-full h-full object-cover rounded-lg border" />
                    <button type="button" onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {photos.length < 10 && (
                <label className={`btn-secondary text-xs w-full justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                  {uploading ? <><Loader2 size={13} className="animate-spin" />Uploading...</> : '+ Tambah Foto Produk'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')} />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Pengaturan</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
                <option value="">— Pilih Kategori —</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700">✅ Aktif (tampil di website)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-yellow-500 rounded" />
              <span className="text-sm text-gray-700">⭐ Unggulan (tampil di beranda)</span>
            </label>
          </div>

          {/* Cover Image */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Foto Cover</h3>
            <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://... atau upload file" className="input text-sm mb-3" />
            <label className={`btn-secondary text-xs w-full justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? <><Loader2 size={13} className="animate-spin" />Uploading...</> : '📁 Upload Cover'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')} />
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
