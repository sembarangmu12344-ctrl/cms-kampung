import { Metadata } from 'next'
import KegiatanForm from '../KegiatanForm'

export const metadata: Metadata = { title: 'Tambah Kegiatan | Admin' }

export default function TambahKegiatanPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tambah Kegiatan Baru</h2>
        <p className="text-sm text-gray-500 mt-1">Buat jadwal kegiatan kampung untuk warga</p>
      </div>
      <KegiatanForm mode="create" />
    </div>
  )
}
