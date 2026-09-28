import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import NewsForm from '../NewsForm'

export const metadata: Metadata = { title: 'Tulis Berita | Admin' }

export default async function TambahBeritaPage() {
  const categories = await prisma.category.findMany({
    where: { type: 'news' },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tulis Berita Baru</h2>
        <p className="text-sm text-gray-500 mt-1">Buat berita atau pengumuman untuk warga</p>
      </div>
      <NewsForm categories={categories} mode="create" />
    </div>
  )
}
