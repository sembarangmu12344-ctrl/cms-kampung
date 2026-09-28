'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Newspaper, Store, Image, Settings,
  Users, Globe, ChevronRight, X, CalendarDays
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard',      href: '/admin',                icon: LayoutDashboard, exact: true,          superAdminOnly: false },
  { label: 'Berita',         href: '/admin/berita',         icon: Newspaper,       exact: false,         superAdminOnly: false },
  { label: 'UMKM',           href: '/admin/umkm',           icon: Store,           exact: false,         superAdminOnly: false },
  { label: 'Kegiatan',       href: '/admin/kegiatan',       icon: CalendarDays,    exact: false,         superAdminOnly: false },
  { label: 'Galeri',         href: '/admin/galeri',         icon: Image,           exact: false,         superAdminOnly: false },
  { label: 'Profil Kampung', href: '/admin/profil-kampung', icon: Globe,           exact: false,         superAdminOnly: false },
  { label: 'Pengguna',       href: '/admin/pengguna',       icon: Users,           exact: false,         superAdminOnly: true  },
  { label: 'Pengaturan',     href: '/admin/pengaturan',     icon: Settings,        exact: false,         superAdminOnly: false },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  userRole?: string
}

export default function Sidebar({ isOpen, onClose, userRole }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const visibleItems = navItems.filter(
    (item) => !item.superAdminOnly || userRole === 'super_admin'
  )

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40 flex flex-col transition-transform duration-300',
          'lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              K
            </div>
            <span className="font-semibold text-sm">CMS Kampung</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1" aria-label="Tutup sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2 font-medium">Menu</p>
          <ul className="space-y-0.5">
            {visibleItems.map(({ label, href, icon: Icon, exact }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                    isActive(href, exact)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive(href, exact) && <ChevronRight size={14} />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: Link ke website */}
        <div className="px-3 pb-4 border-t border-gray-800 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Globe size={18} />
            <span>Lihat Website</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
