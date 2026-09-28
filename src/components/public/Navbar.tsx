'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Newspaper, Store, Image, Phone, Info, CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/',          label: 'Beranda',  icon: Home },
  { href: '/profil',    label: 'Profil',   icon: Info },
  { href: '/berita',    label: 'Berita',   icon: Newspaper },
  { href: '/umkm',      label: 'UMKM',     icon: Store },
  { href: '/kegiatan',  label: 'Kegiatan', icon: CalendarDays },
  { href: '/galeri',    label: 'Galeri',   icon: Image },
  { href: '/kontak',    label: 'Kontak',   icon: Phone },
]

export default function Navbar({ villageName = 'CMS Kampung' }: { villageName?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b-2 border-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-primary-700 text-lg">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
              K
            </div>
            <span className="hidden sm:block truncate max-w-[180px]">{villageName}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
