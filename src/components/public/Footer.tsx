import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react'
import type { VillageInfoFull, VillageSocialMedia } from '@/types'

// Icon TikTok (SVG custom karena tidak ada di Lucide)
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
    </svg>
  )
}

export default function Footer({ village }: { village?: VillageInfoFull | null }) {
  const year = new Date().getFullYear()
  const name = village?.name ?? 'CMS Kampung'
  const social = village?.socialMedia as VillageSocialMedia | null

  return (
    <footer className="bg-red-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Garis merah-putih di atas footer */}
        <div className="flex h-1 mb-10 rounded overflow-hidden">
          <div className="flex-1 bg-primary-600" />
          <div className="flex-1 bg-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Kolom 1: Info Kampung */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                K
              </div>
              <span className="text-white font-semibold">{name}</span>
            </div>
            {village?.tagline && (
              <p className="text-sm text-red-300 italic mb-3">"{village.tagline}"</p>
            )}
            {village?.description && (
              <p className="text-sm text-gray-400 line-clamp-3">{village.description}</p>
            )}
          </div>

          {/* Kolom 2: Link Cepat */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/',       label: 'Beranda' },
                { href: '/profil', label: 'Profil Kampung' },
                { href: '/berita', label: 'Berita & Pengumuman' },
                { href: '/umkm',   label: 'Direktori UMKM' },
                { href: '/galeri', label: 'Galeri Foto' },
                { href: '/kontak', label: 'Kontak' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              {village?.address && (
                <li className="flex gap-2">
                  <MapPin size={16} className="text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-gray-400">{village.address}</span>
                </li>
              )}
              {village?.phone && (
                <li className="flex gap-2 items-center">
                  <Phone size={16} className="text-primary-400 shrink-0" />
                  <a href={`tel:${village.phone}`} className="hover:text-white transition-colors">
                    {village.phone}
                  </a>
                </li>
              )}
              {village?.email && (
                <li className="flex gap-2 items-center">
                  <Mail size={16} className="text-primary-400 shrink-0" />
                  <a href={`mailto:${village.email}`} className="hover:text-white transition-colors truncate">
                    {village.email}
                  </a>
                </li>
              )}
            </ul>

            {/* Social Media */}
            {social && (
              <div className="flex gap-3 mt-4">
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-400 transition-colors">
                    <Instagram size={20} />
                  </a>
                )}
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Facebook size={20} />
                  </a>
                )}
                {social.tiktok && (
                  <a href={social.tiktok} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors">
                    <TikTokIcon size={20} />
                  </a>
                )}
                {social.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-400 transition-colors">
                    <Youtube size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-red-900 mt-10 pt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <p>© {year} {name}. Hak cipta dilindungi.</p>
        </div>

        {/* Watermark Universitas Dinamika */}
        <div className="border-t border-red-900 mt-4 pt-4 flex items-center justify-center gap-2">
          <p className="text-xs text-gray-500">Dikembangkan oleh mahasiswa</p>
          <a
            href="https://www.dinamika.ac.id"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Dinamika-02.png"
              alt="Universitas Dinamika"
              className="h-7 object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
