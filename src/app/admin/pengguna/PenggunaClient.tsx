'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Trash2 } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

type Props = {
  users: User[]
  currentUserId: string
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin Kampung',
  visitor: 'Pengunjung',
}

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'badge-red',
  admin: 'badge-blue',
  visitor: 'badge-gray',
}

export default function PenggunaClient({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' })

  const handleTambah = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Gagal menambah pengguna'); return }
      setUsers((prev) => [{ ...data.data, lastLogin: null }, ...prev])
      setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'admin' })
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Hapus pengguna "${user.name}" (${user.email})?\n\nTindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
      } else {
        alert(data.message ?? 'Gagal menghapus pengguna')
      }
    } catch {
      alert('Terjadi kesalahan.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kelola Pengguna</h2>
          <p className="text-sm text-gray-500">{users.length} pengguna terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? <><X size={16} /> Batal</> : <><Plus size={16} /> Tambah Admin</>}
        </button>
      </div>

      {/* Form Tambah */}
      {showForm && (
        <div className="card p-5 space-y-4 border-2 border-primary-200">
          <h3 className="font-semibold text-gray-800">Tambah Admin Baru</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                type="email"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                type="password"
                placeholder="Min 8 karakter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input"
              >
                <option value="admin">Admin Kampung</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
          <button onClick={handleTambah} disabled={loading} className="btn-primary">
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
              : 'Simpan Pengguna'
            }
          </button>
        </div>
      )}

      {/* Tabel */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Login Terakhir</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Dibuat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-gray-50 transition-colors ${u.id === currentUserId ? 'bg-primary-50/30' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-2 text-xs text-primary-600">(Anda)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ROLE_BADGE[u.role] ?? 'badge-gray'}`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Belum pernah'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== currentUserId ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`text-xs font-medium ${u.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                        >
                          {deletingId === u.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Trash2 size={12} />
                          }
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <strong>⚠️ Catatan:</strong> Akun Anda sendiri tidak bisa dihapus atau dinonaktifkan.
      </div>
    </div>
  )
}
