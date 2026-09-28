'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Category, News } from '@/types'

// Lazy load RichEditor karena pakai browser API
const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-xl min-h-[280px] bg-gray-50 animate-pulse flex items-center justify-center">
      <p className="text-sm text-gray-400">Memuat editor...</p>
    </div>
  ),
})

type Props = {
  categories: Category[]
  news?: News | null
  mode: 'create' | 'edit'
}

export default function NewsForm({ categories, news, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(news?.title ?? '')
  const [content, setContent] = useState(news?.content ?? '')
  const [excerpt, setExcerpt] = useState(news?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(news?.coverImage ?? '')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(news?.status ?? 'draft')
  const [isPinned, setIsPinned] = useState(news?.isPinned ?? false)
  const [categoryId, setCategoryId] = useState(news?.categoryId ?? '')
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cms-kampung/news')
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
    setLoading(true)
    setError('')

    try {
      const url = mode === 'create' ? '/api/news' : `/api/news/${news!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, content, excerpt, coverImage,
          status, isPinned,
          categoryId: categoryId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.errors && typeof data.errors === 'object') {
          const errMsg = Object.entries(data.errors)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n')
          setError(errMsg)
        } else {
          setError(data.message ?? 'Gagal menyimpan berita')
        }
        return
      }

      router.push('/admin/berita')
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
        <Link href="/admin/berita" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div className="flex gap-3">
          {news?.slug && (
            <a href={`/berita/${news.slug}`} target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-sm">
              <Eye size={15} /> Preview
            </a>
          )}
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {mode === 'create' ? 'Simpan Berita' : 'Perbarui Berita'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Judul Berita <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul berita..."
                className="input text-lg font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Konten <span className="text-red-500">*</span>
              </label>
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder="Tulis isi berita di sini..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ringkasan (Excerpt)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat berita (opsional, maks 500 karakter)..."
                className="input min-h-[80px]"
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Sidebar options */}
        <div className="space-y-4">
          {/* Status & Publish */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Pengaturan Publish</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input">
                <option value="draft">Draft (Tersimpan, tidak publik)</option>
                <option value="published">Publik (Tampil di website)</option>
                <option value="archived">Arsip (Disembunyikan)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">📌 Pin sebagai pengumuman penting</span>
            </label>
          </div>

          {/* Kategori */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Kategori</h3>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              <option value="">— Pilih Kategori —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Cover Image */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Foto Cover</h3>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... atau upload file di bawah"
              className="input text-sm mb-3"
            />
            <label className={`btn-secondary text-xs w-full justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? <><Loader2 size={13} className="animate-spin" />Uploading...</> : '📁 Upload dari komputer'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
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
