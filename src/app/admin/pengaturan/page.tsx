'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, RefreshCw } from 'lucide-react'

type SettingItem = {
  value: string | null
  type: string
  description: string | null
}

const SETTING_LABELS: Record<string, string> = {
  hero_title: 'Judul Hero Beranda',
  hero_subtitle: 'Subtitle Hero Beranda',
  contact_email: 'Email Kontak',
  contact_phone: 'Nomor Telepon',
  news_per_page: 'Berita Per Halaman',
  umkm_per_page: 'UMKM Per Halaman',
  gallery_per_page: 'Galeri Per Halaman',
  maintenance_mode: 'Mode Maintenance',
}

export default function AdminPengaturanPage() {
  const [settings, setSettings] = useState<Record<string, SettingItem>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (res.ok) {
        setSettings(data.data)
        const vals: Record<string, string> = {}
        Object.entries(data.data as Record<string, SettingItem>).forEach(([k, v]) => {
          vals[k] = v.value ?? ''
        })
        setValues(vals)
      }
    } catch {
      setError('Gagal memuat pengaturan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSave = async (key: string) => {
    setSaving(key)
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: values[key] }),
      })
      if (res.ok) {
        setSaved(key)
        setTimeout(() => setSaved(null), 2000)
      } else {
        const d = await res.json()
        alert(d.message ?? 'Gagal menyimpan')
      }
    } catch {
      alert('Terjadi kesalahan')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pengaturan Website</h2>
          <p className="text-sm text-gray-500">Konfigurasi tampilan dan konten website</p>
        </div>
        <button onClick={fetchSettings} className="btn-secondary text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card divide-y divide-gray-100">
        {Object.entries(settings).map(([key, setting]) => (
          <div key={key} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-800 mb-0.5">
                {SETTING_LABELS[key] ?? key}
              </label>
              {setting.description && (
                <p className="text-xs text-gray-400 mb-2">{setting.description}</p>
              )}
              {setting.type === 'boolean' ? (
                <select
                  value={values[key] ?? 'false'}
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="input max-w-[200px] text-sm"
                >
                  <option value="false">Nonaktif</option>
                  <option value="true">Aktif</option>
                </select>
              ) : (
                <input
                  type={setting.type === 'number' ? 'number' : 'text'}
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="input text-sm"
                  min={setting.type === 'number' ? '1' : undefined}
                />
              )}
            </div>
            <button
              onClick={() => handleSave(key)}
              disabled={saving === key}
              className={`btn-primary text-xs shrink-0 ${saved === key ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {saving === key ? (
                <Loader2 size={13} className="animate-spin" />
              ) : saved === key ? (
                '✓ Tersimpan'
              ) : (
                <><Save size={13} /> Simpan</>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>ℹ️ Info:</strong> Untuk mengubah info kampung (nama, alamat, logo, peta), kunjungi halaman{' '}
        <a href="/admin/profil-kampung" className="underline font-medium">Profil Kampung</a>.
      </div>
    </div>
  )
}
