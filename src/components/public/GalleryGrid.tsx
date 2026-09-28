'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Gallery } from '@/types'

type Props = {
  photos: Gallery[]
}

export default function GalleryGrid({ photos }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const openLightbox = (i: number) => setLightbox(i)
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null))
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % photos.length : null))

  return (
    <>
      {/* Grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer rounded-xl overflow-hidden group relative"
            onClick={() => openLightbox(i)}
          >
            <div className="relative">
              <Image
                src={photo.imageUrl}
                alt={photo.title}
                width={400}
                height={300}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-medium line-clamp-1">{photo.title}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X size={24} />
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-4xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox].imageUrl}
              alt={photos[lightbox].title}
              width={1200}
              height={800}
              className="object-contain w-full max-h-[75vh] rounded-lg"
            />
            <div className="text-center mt-3">
              <p className="text-white font-medium">{photos[lightbox].title}</p>
              {photos[lightbox].description && (
                <p className="text-gray-400 text-sm mt-1">{photos[lightbox].description}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{lightbox + 1} / {photos.length}</p>
            </div>
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Berikutnya"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </>
  )
}
