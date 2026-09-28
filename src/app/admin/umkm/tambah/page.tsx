import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import UmkmForm from '../UmkmForm'

export const metadata: Metadata = { title: 'Tambah UMKM | Admin' }

export default async function TambahUmkmPage() {
  const categories = await prisma.category.findMany({
    where: { type: 'umkm' },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tambah UMKM Baru</h2>
        <p className="text-sm text-gray-500 mt-1">Daftarkan usaha warga ke direktori UMKM</p>
      </div>
      <UmkmForm categories={categories} mode="create" />
    </div>
  )
}
