import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, User, Tag } from 'lucide-react'
import prisma from '@/lib/prisma'
import NewsCard from '@/components/public/NewsCard'
import { formatDateTime, getImageUrl } from '@/lib/utils'
import type { NewsListItem } from '@/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const news = await prisma.news.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  if (!news) return { title: 'Berita Tidak Ditemukan' }
  return { title: news.title, description: news.excerpt ?? undefined }
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params

  const news = await prisma.news.findUnique({
    where: { slug, status: 'published' },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  })

  if (!news) notFound()

  // Increment views
  await prisma.news.update({ where: { id: news.id }, data: { views: { increment: 1 } } })

  // Berita terkait
  const relatedRaw = await prisma.news.findMany({
    where: {
      status: 'published',
      categoryId: news.categoryId ?? undefined,
      id: { not: news.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, title: true, slug: true, excerpt: true,
      coverImage: true, status: true, isPinned: true,
      views: true, publishedAt: true, createdAt: true,
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
  })
  const related = relatedRaw as NewsListItem[]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link href="/berita" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Kembali ke Berita
      </Link>

      {/* Category & meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {news.category && (
          <Link href={`/berita?category=${news.category.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
            <Tag size={12} /> {news.category.name}
          </Link>
        )}
        {news.isPinned && (
          <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
            📌 Penting
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {news.title}
      </h1>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
        {news.author && (
          <span className="flex items-center gap-1.5">
            <User size={14} /> {news.author.name}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {formatDateTime(news.publishedAt ?? news.createdAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye size={14} /> {news.views + 1} dibaca
        </span>
      </div>

      {/* Cover Image */}
      {news.coverImage && (
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-sm">
          <Image
            src={getImageUrl(news.coverImage)}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <article
        className="prose max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14 pt-10 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Berita Terkait</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((n) => <NewsCard key={n.id} news={n} />)}
          </div>
        </section>
      )}
    </div>
  )
}
