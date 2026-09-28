'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'

type VillageForm = {
  name: string
  tagline: string
  description: string
  address: string
  phone: string
  email: string
  logoUrl: string
  bannerUrl: string
  mapEmbed: string
  instagram: string
  facebook: string
  youtube: string
  tiktok: string
  population: string
  households: string
  area_km2: string
  rw: string
  rt: string
}

export default function AdminProfilKampungPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [form, setForm] = useState<VillageForm>({
    name: '', tagline: '', description: '', address: '',
    phone: '', email: '', logoUrl: '', bannerUrl: '', mapEmbed: '',
    instagram: '', facebook: '', youtube: '', tiktok: '',
    population: '', households: '', area_km2: '', rw: '', rt: '',
  })

  useEffect(() => {
    fetch('/api/village')
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          const v = d.data
          const social = v.socialMedia ?? {}
          const stats = v.statistics ?? {}
          setForm({
            name: v.name ?? '', tagline: v.tagline ?? '',
            description: v.description ?? '', address: v.address ?? '',
            phone: v.phone ?? '', email: v.email ?? '',
            logoUrl: v.logoUrl ?? '', bannerUrl: v.bannerUrl ?? '',
            mapEmbed: v.mapEmbed ?? '',
            instagram: social.instagram ?? '', facebook: social.facebook ?? '', youtube: social.youtube ?? '', tiktok: social.tiktok ?? '',
            population: stats.population?.toString() ?? '',
            households: stats.households?.toString() ?? '',
            area_km2: stats.area_km2?.toString() ?? '',
            rw: stats.rw?.toString() ?? '',
            rt: stats.rt?.toString() ?? '',
          })
        }
      })
      .catch(() => setError('Gagal memuat data kampung.'))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof VillageForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleUpload = async (file: File, type: 'logo' | 'banner') => {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingBanner
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cms-kampung/village')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm((prev) => ({ ...prev, [type === 'logo' ? 'logoUrl' : 'bannerUrl']: data.data.url }))
      } else {
        alert(data.message ?? 'Upload gagal')
      }
    } catch {
      alert('Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/village', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, tagline: form.tagline, description: form.description,
          address: form.address, phone: form.phone, email: form.email,
          logoUrl: form.logoUrl, bannerUrl: form.bannerUrl, mapEmbed: form.mapEmbed,
          socialMedia: { instagram: form.instagram, facebook: form.facebook, youtube: form.youtube, tiktok: form.tiktok },
          statistics: {
            population: form.population ? parseInt(form.population) : undefined,
            households: form.households ? parseInt(form.households) : undefined,
            area_km2: form.area_km2 ? parseFloat(form.area_km2) : undefined,
            rw: form.rw ? parseInt(form.rw) : undefined,
            rt: form.rt ? parseInt(form.rt) : undefined,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Gagal menyimpan'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-500" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Profil Kampung</h2>
          <p className="text-sm text-gray-500">Informasi dasar yang tampil di website publik</p>
        </div>
        <button onClick={handleSave} disabled={saving} className={`btn-primary ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Informasi Dasar */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Informasi Dasar</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kampung <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={set('name')} className="input" placeholder="Kampung Sejahtera" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
            <input value={form.tagline} onChange={set('tagline')} className="input" placeholder="Bersatu, Maju, Sejahtera" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <textarea value={form.description} onChange={set('description')} className="input min-h-[100px]" placeholder="Cerita singkat tentang kampung..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
          <textarea value={form.address} onChange={set('address')} className="input min-h-[72px]" placeholder="Jl. Raya..." />
        </div>
      </div>

      {/* Kontak */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Kontak</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label>
            <input value={form.phone} onChange={set('phone')} className="input" placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input value={form.email} onChange={set('email')} className="input" type="email" placeholder="info@kampung.id" />
          </div>
        </div>
      </div>

      {/* Media Sosial */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Media Sosial</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { key: 'instagram' as const, label: 'Instagram', ph: 'https://instagram.com/...' },
            { key: 'facebook' as const, label: 'Facebook', ph: 'https://facebook.com/...' },
            { key: 'tiktok' as const, label: 'TikTok', ph: 'https://tiktok.com/@...' },
            { key: 'youtube' as const, label: 'YouTube', ph: 'https://youtube.com/...' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input value={form[key]} onChange={set(key)} className="input" placeholder={ph} type="url" />
            </div>
          ))}
        </div>
      </div>

      {/* Statistik */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Statistik Kampung</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { key: 'population' as const, label: 'Penduduk' },
            { key: 'households' as const, label: 'KK' },
            { key: 'area_km2' as const, label: 'Luas (km²)' },
            { key: 'rw' as const, label: 'Jumlah RW' },
            { key: 'rt' as const, label: 'Jumlah RT' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input value={form[key]} onChange={set(key)} className="input" type="number" min="0" step="0.1" />
            </div>
          ))}
        </div>
      </div>

      {/* Media */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Gambar & Peta</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Kampung</label>
            {form.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logoUrl} alt="Logo" className="w-20 h-20 object-contain border rounded-lg mb-2 bg-gray-50" />
            )}
            <label className={`btn-secondary text-xs w-full justify-center cursor-pointer ${uploadingLogo ? 'opacity-50' : ''}`}>
              {uploadingLogo ? <><Loader2 size={13} className="animate-spin" /> Uploading...</> : '📁 Upload Logo'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')} />
            </label>
            {form.logoUrl && (
              <button type="button" onClick={() => setForm((p) => ({ ...p, logoUrl: '' }))}
                className="text-xs text-red-500 hover:text-red-700 mt-1 w-full text-center">
                Hapus Logo
              </button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Kampung</label>
            {form.bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.bannerUrl} alt="Banner" className="w-full h-20 object-cover border rounded-lg mb-2" />
            )}
            <label className={`btn-secondary text-xs w-full justify-center cursor-pointer ${uploadingBanner ? 'opacity-50' : ''}`}>
              {uploadingBanner ? <><Loader2 size={13} className="animate-spin" /> Uploading...</> : '📁 Upload Banner'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingBanner}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')} />
            </label>
            {form.bannerUrl && (
              <button type="button" onClick={() => setForm((p) => ({ ...p, bannerUrl: '' }))}
                className="text-xs text-red-500 hover:text-red-700 mt-1 w-full text-center">
                Hapus Banner
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Maps Embed Code</label>
          <textarea value={form.mapEmbed} onChange={set('mapEmbed')} className="input min-h-[80px] font-mono text-xs" placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>' />
          <p className="text-xs text-gray-400 mt-1">Salin dari Google Maps → Bagikan → Sematkan peta</p>
        </div>
      </div>
    </div>
  )
}
