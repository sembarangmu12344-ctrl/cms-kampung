import { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from 'lucide-react'
import prisma from '@/lib/prisma'
import type { VillageInfoFull, VillageSocialMedia } from '@/types'

export const metadata: Metadata = { title: 'Kontak & Lokasi' }
export const revalidate = 3600

export default async function KontakPage() {
  const village = await prisma.villageInfo.findFirst() as VillageInfoFull | null
  const social = village?.socialMedia as VillageSocialMedia | null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Kontak & Lokasi</h1>
        <p className="text-gray-500 mt-2">Hubungi kami untuk informasi lebih lanjut</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Info Kontak */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-5 text-lg">Informasi Kontak</h2>
            <div className="space-y-5">
              {village?.address && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Alamat</p>
                    <p className="text-gray-700 text-sm">{village.address}</p>
                  </div>
                </div>
              )}
              {village?.phone && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Telepon / WhatsApp</p>
                    <a href={`tel:${village.phone}`} className="text-primary-600 hover:underline font-medium">
                      {village.phone}
                    </a>
                  </div>
                </div>
              )}
              {village?.email && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <a href={`mailto:${village.email}`} className="text-primary-600 hover:underline">
                      {village.email}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Jam Operasional</p>
                  <p className="text-gray-700 text-sm">Senin – Jumat: 08.00 – 15.00 WIB</p>
                  <p className="text-gray-500 text-xs">Sabtu – Minggu: Tutup</p>
                </div>
              </div>
            </div>
          </div>

          {/* Media Sosial */}
          {social && (social.instagram || social.facebook || social.youtube) && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4 text-lg">Media Sosial</h2>
              <div className="space-y-3">
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-pink-600 transition-colors p-2 rounded-lg hover:bg-pink-50">
                    <Instagram size={20} className="text-pink-500" />
                    <span>Instagram</span>
                  </a>
                )}
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                    <Facebook size={20} className="text-blue-500" />
                    <span>Facebook</span>
                  </a>
                )}
                {social.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                    <Youtube size={20} className="text-red-500" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Peta */}
        <div>
          {village?.mapEmbed ? (
            <div>
              <h2 className="font-semibold text-gray-900 mb-4 text-lg">Lokasi di Peta</h2>
              <div
                className="w-full h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                dangerouslySetInnerHTML={{ __html: village.mapEmbed }}
              />
            </div>
          ) : (
            <div className="h-80 bg-gray-100 rounded-2xl flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin size={40} className="mx-auto mb-2" />
                <p className="text-sm">Peta belum dikonfigurasi</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
