import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, Pin } from 'lucide-react'
import { formatDate, getImageUrl } from '@/lib/utils'
import type { NewsListItem } from '@/types'

type Props = {
  news: NewsListItem
  variant?: 'default' | 'horizontal' | 'featured'
}

export default function NewsCard({ news, variant = 'default' }: Props) {
  const imgUrl = getImageUrl(news.coverImage, 'https://placehold.co/800x450/22c55e/white?text=Berita')

  if (variant === 'horizontal') {
    return (
      <Link href={`/berita/${news.slug}`}
        className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
        <div className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
          <Image src={imgUrl} alt={news.title} fill className="object-cover" sizes="96px" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-primary-600 font-medium mb-1">
            {news.category?.name ?? 'Umum'}
          </p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {news.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {news.publishedAt ? formatDate(news.publishedAt) : formatDate(news.createdAt)}
          </p>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/berita/${news.slug}`}
        className="relative block rounded-2xl overflow-hidden group h-80 shadow-md">
        <Image src={imgUrl} alt={news.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 p-5 text-white">
          {news.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full mb-2 font-medium">
              <Pin size={10} /> Penting
            </span>
          )}
          <p className="text-xs text-gray-300 mb-1">{news.category?.name ?? 'Umum'}</p>
          <h2 className="text-xl font-bold line-clamp-2 leading-snug">{news.title}</h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {news.publishedAt ? formatDate(news.publishedAt) : formatDate(news.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {news.views} dibaca
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // Default card
  return (
    <Link href={`/berita/${news.slug}`}
      className="card group hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <Image src={imgUrl} alt={news.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        {news.isPinned && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full font-medium">
              <Pin size={10} /> Penting
            </span>
          </div>
        )}
        {news.category && (
          <div className="absolute top-3 right-3">
            <span className="text-xs bg-white/90 text-gray-700 px-2 py-0.5 rounded-full font-medium">
              {news.category.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-700 transition-colors mb-2">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{news.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {news.publishedAt ? formatDate(news.publishedAt) : formatDate(news.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} /> {news.views}
          </span>
        </div>
      </div>
    </Link>
  )
}
