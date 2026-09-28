import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import PenggunaClient from './PenggunaClient'

export const metadata: Metadata = { title: 'Kelola Pengguna | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminPenggunaPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'super_admin') {
    redirect('/admin')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true,
      isActive: true, lastLogin: true, createdAt: true,
    },
  })

  const usersForClient = users.map((u) => ({
    ...u,
    lastLogin: u.lastLogin?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <PenggunaClient
      users={usersForClient}
      currentUserId={currentUser.id}
    />
  )
}
