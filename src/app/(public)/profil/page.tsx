import { Metadata } from 'next'
import { MapPin, Phone, Mail, Users, Home, Map, Instagram, Facebook, Youtube } from 'lucide-react'
import prisma from '@/lib/prisma'
import type { VillageInfoFull, VillageStatistics, VillageSocialMedia } from '@/types'

export const metadata: Metadata = { title: 'Profil Kampung' }
export const revalidate = 3600

export default async function ProfilPage() {
  const village = await prisma.villageInfo.findFirst() as VillageInfoFull | null

  if (!village) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        <p>Informasi profil kampung belum tersedia.</p>
      </div>
    )
  }

  const stats = village.statistics as VillageStatistics | null
  const social = village.socialMedia as VillageSocialMedia | null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        {village.logoUrl && (
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={village.logoUrl}
              alt={village.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{village.name}</h1>
        {village.tagline && (
          <p className="text-lg text-primary-600 mt-2 italic">"{village.tagline}"</p>
        )}
      </div>

      {/* Banner */}
      {village.bannerUrl && (
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-10 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={village.bannerUrl}
            alt={`Banner ${village.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Tentang */}
      {village.description && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Tentang Kampung
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{village.description}</p>
        </section>
      )}

      {/* Statistik */}
      {stats && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Data Statistik
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: Users, label: 'Penduduk',  value: stats.population?.toLocaleString('id-ID') },
              { icon: Home,  label: 'KK',         value: stats.households?.toLocaleString('id-ID') },
              { icon: Map,   label: 'Luas (km²)', value: stats.area_km2?.toString() },
              { icon: MapPin,label: 'RW',          value: stats.rw?.toString() },
              { icon: MapPin,label: 'RT',          value: stats.rt?.toString() },
            ].filter((s) => s.value).map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-primary-50 rounded-xl p-4 text-center">
                <Icon size={22} className="text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-700">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kontak & Lokasi */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Kontak
          </h2>
          <ul className="space-y-3 text-sm">
            {village.address && (
              <li className="flex gap-3">
                <MapPin size={18} className="text-primary-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">{village.address}</span>
              </li>
            )}
            {village.phone && (
              <li className="flex gap-3 items-center">
                <Phone size={18} className="text-primary-500 shrink-0" />
                <a href={`tel:${village.phone}`} className="text-primary-600 hover:underline">{village.phone}</a>
              </li>
            )}
            {village.email && (
              <li className="flex gap-3 items-center">
                <Mail size={18} className="text-primary-500 shrink-0" />
                <a href={`mailto:${village.email}`} className="text-primary-600 hover:underline">{village.email}</a>
              </li>
            )}
          </ul>

          {/* Media Sosial */}
          {social && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Media Sosial</p>
              <div className="flex gap-3">
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-800 bg-pink-50 px-3 py-1.5 rounded-lg">
                    <Instagram size={16} /> Instagram
                  </a>
                )}
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Facebook size={16} /> Facebook
                  </a>
                )}
                {social.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg">
                    <Youtube size={16} /> YouTube
                  </a>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Peta */}
        {village.mapEmbed && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Lokasi
            </h2>
            <div
              className="w-full h-56 rounded-xl overflow-hidden border border-gray-200"
              dangerouslySetInnerHTML={{ __html: village.mapEmbed }}
            />
          </section>
        )}
      </div>
    </div>
  )
}
