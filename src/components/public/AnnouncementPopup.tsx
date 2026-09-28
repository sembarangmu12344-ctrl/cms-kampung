'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight, Pin, Calendar, ExternalLink } from 'lucide-react'
import { formatDate, getImageUrl } from '@/lib/utils'

type Announcement = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string | null
  createdAt: string
  category: { name: string; slug: string } | null
}

type Props = {
  announcements: Announcement[]
}

const STORAGE_KEY = 'cms_popup_dismissed'

export default function AnnouncementPopup({ announcements }: Props) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (announcements.length === 0) return

    // Cek apakah popup sudah di-dismiss hari ini
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const today = new Date()
      // Kalau dismiss-nya hari ini, jangan tampilkan lagi
      if (dismissedDate.toDateString() === today.toDateString()) return
    }

    // Tampilkan popup setelah 1 detik
    const timer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [announcements])

  const handleClose = () => {
    setVisible(false)
    // Simpan tanggal dismiss
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
  }

  const handlePrev = () => setCurrent((i) => (i - 1 + announcements.length) % announcements.length)
  const handleNext = () => setCurrent((i) => (i + 1) % announcements.length)

  if (!visible || announcements.length === 0) return null

  const item = announcements[current]
  const imgUrl = getImageUrl(item.coverImage, '')

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary-600 px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-white">
              <Pin size={16} fill="currentColor" />
              <span className="text-sm font-semibold">Pengumuman Penting</span>
              {announcements.length > 1 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {current + 1} / {announcements.length}
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Tutup pengumuman"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cover Image */}
          {imgUrl && (
            <div className="relative h-52 bg-gray-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1">
            {/* Kategori */}
            {item.category && (
              <span className="inline-block text-xs font-medium text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full mb-3">
                {item.category.name}
              </span>
            )}

            {/* Judul */}
            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2">
              {item.title}
            </h2>

            {/* Tanggal */}
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
              <Calendar size={12} />
              {formatDate(item.publishedAt ?? item.createdAt)}
            </p>

            {/* Excerpt */}
            {item.excerpt && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {item.excerpt}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
            {/* Navigation (kalau lebih dari 1 pengumuman) */}
            {announcements.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  aria-label="Pengumuman sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>
                {/* Dots */}
                <div className="flex gap-1">
                  {announcements.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-primary-600' : 'bg-gray-300'}`}
                      aria-label={`Pengumuman ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  aria-label="Pengumuman berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="btn-secondary text-sm py-1.5"
              >
                Tutup
              </button>
              <Link
                href={`/berita/${item.slug}`}
                onClick={handleClose}
                className="btn-primary text-sm py-1.5"
              >
                <ExternalLink size={14} /> Baca Selengkapnya
              </Link>
            </div>
          </div>
        </div>

        {/* Prev/Next button di sisi (kalau lebih dari 1) */}
        {announcements.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev() }}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-colors"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext() }}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-colors"
              aria-label="Berikutnya"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </>
  )
}
