import Link from 'next/link'
import Image from 'next/image'
import { MapPin, MessageCircle, Star } from 'lucide-react'
import { getImageUrl, getWhatsAppLink } from '@/lib/utils'
import type { UmkmListItem } from '@/types'

type Props = {
  umkm: UmkmListItem
  variant?: 'default' | 'featured'
}

export default function UmkmCard({ umkm, variant = 'default' }: Props) {
  const imgUrl = getImageUrl(umkm.coverImage, 'https://placehold.co/600x400/16a34a/white?text=UMKM')
  const waLink = umkm.whatsapp
    ? getWhatsAppLink(umkm.whatsapp, `Halo, saya tertarik dengan ${umkm.businessName}`)
    : null

  return (
    <div className={`card group hover:shadow-md transition-shadow ${variant === 'featured' ? 'ring-2 ring-primary-200' : ''}`}>
      {/* Image */}
      <Link href={`/umkm/${umkm.slug}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <Image
            src={imgUrl}
            alt={umkm.businessName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {umkm.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                <Star size={10} fill="currentColor" /> Unggulan
              </span>
            </div>
          )}
          {umkm.category && (
            <div className="absolute top-3 right-3">
              <span className="text-xs bg-white/90 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                {umkm.category.name}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/umkm/${umkm.slug}`}>
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
            {umkm.businessName}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-2">Pemilik: {umkm.ownerName}</p>

        {umkm.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{umkm.description}</p>
        )}

        {umkm.address && (
          <div className="flex items-start gap-1.5 text-xs text-gray-400 mb-3">
            <MapPin size={13} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">{umkm.address}</span>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Link
            href={`/umkm/${umkm.slug}`}
            className="flex-1 text-center text-xs font-medium text-primary-700 hover:text-primary-800 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Lihat Detail
          </Link>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 py-1.5 rounded-lg transition-colors"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
