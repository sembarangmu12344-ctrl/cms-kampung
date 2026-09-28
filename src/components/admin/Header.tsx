'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import type { JwtPayload } from '@/lib/auth'

type Props = {
  onMenuClick: () => void
  user: JwtPayload
  pageTitle: string
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin Kampung',
  visitor: 'Pengunjung',
}

export default function Header({ onMenuClick, user, pageTitle }: Props) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{pageTitle}</h1>
      </div>

      {/* Right: user menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
        >
          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={14} className="text-primary-700" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-medium leading-none text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{ROLE_LABEL[user.role] ?? user.role}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
