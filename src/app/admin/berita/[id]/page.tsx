import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import NewsForm from '../NewsForm'

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit Berita | Admin' }

export default async function EditBeritaPage({ params }: Props) {
  const { id } = await params

  const [news, categories] = await Promise.all([
    prisma.news.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { type: 'news' }, orderBy: { name: 'asc' } }),
  ])

  if (!news) notFound()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Edit Berita</h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{news.title}</p>
      </div>
      <NewsForm categories={categories} news={news} mode="edit" />
    </div>
  )
}
