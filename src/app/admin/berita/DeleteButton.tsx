'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  title: string
  type: 'news' | 'umkm' | 'gallery'
}

const API_MAP = { news: 'news', umkm: 'umkm', gallery: 'gallery' }

export default function DeleteButton({ id, title, type }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Hapus "${title}"?\n\nTindakan ini tidak dapat dibatalkan.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/${API_MAP[type]}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.message ?? 'Gagal menghapus.')
      }
    } catch {
      alert('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
      aria-label={`Hapus ${title}`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      Hapus
    </button>
  )
}
