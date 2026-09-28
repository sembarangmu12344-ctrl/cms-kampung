import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, MessageCircle, Tag, ExternalLink, Star, Camera } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getImageUrl, getWhatsAppLink } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const umkm = await prisma.umkm.findUnique({ where: { slug }, select: { businessName: true, description: true } })
  if (!umkm) return { title: 'UMKM Tidak Ditemukan' }
  return { title: umkm.businessName, description: umkm.description ?? undefined }
}

export default async function UmkmDetailPage({ params }: Props) {
  const { slug } = await params

  const umkm = await prisma.umkm.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      photos: { orderBy: { orderIndex: 'asc' } },
    },
  })

  if (!umkm) notFound()

  const waLink = umkm.whatsapp
    ? getWhatsAppLink(umkm.whatsapp, `Halo Kak ${umkm.ownerName}, saya tertarik dengan produk ${umkm.businessName}. Boleh minta info lebih lanjut?`)
    : null

  const coverImg = getImageUrl(umkm.coverImage, 'https://placehold.co/800x500/16a34a/white?text=UMKM')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link href="/umkm" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Kembali ke Direktori UMKM
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Cover Image */}
        <div>
          <div className="relative h-72 rounded-2xl overflow-hidden shadow-sm mb-3">
            <Image src={coverImg} alt={umkm.businessName} fill className="object-cover" priority />
            {umkm.isFeatured && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-semibold">
                  <Star size={12} fill="currentColor" /> Unggulan
                </span>
              </div>
            )}
          </div>

          {/* Foto produk */}
          {umkm.photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {umkm.photos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="relative h-16 rounded-lg overflow-hidden">
                  <Image src={photo.photoUrl} alt={photo.caption ?? ''} fill className="object-cover" />
                </div>
              ))}
              {umkm.photos.length > 4 && (
                <div className="relative h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-500 flex flex-col items-center gap-1">
                    <Camera size={14} /> +{umkm.photos.length - 4}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {umkm.category && (
            <Link href={`/umkm?category=${umkm.category.slug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full mb-3">
              <Tag size={12} /> {umkm.category.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {umkm.businessName}
          </h1>
          <p className="text-gray-500 mb-4">Pemilik: <strong>{umkm.ownerName}</strong></p>

          {umkm.description && (
            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {umkm.description}
            </p>
          )}

          <ul className="space-y-3 mb-6">
            {umkm.address && (
              <li className="flex gap-3 text-sm">
                <MapPin size={18} className="text-primary-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">{umkm.address}</span>
              </li>
            )}
            {umkm.mapsLink && (
              <li>
                <a href={umkm.mapsLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <ExternalLink size={14} /> Lihat di Google Maps
                </a>
              </li>
            )}
          </ul>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="btn-primary bg-green-500 hover:bg-green-600 flex-1 justify-center text-base py-3">
                <MessageCircle size={18} /> Hubungi via WhatsApp
              </a>
            )}
            {umkm.mapsLink && (
              <a href={umkm.mapsLink} target="_blank" rel="noopener noreferrer"
                className="btn-secondary flex-1 justify-center">
                <MapPin size={16} /> Lihat Lokasi
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Semua foto produk */}
      {umkm.photos.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Foto Produk</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {umkm.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                <Image src={photo.photoUrl} alt={photo.caption ?? umkm.businessName} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                {photo.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-2 line-clamp-1">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
