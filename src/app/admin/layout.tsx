import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminShell from './AdminShell'

// Page title mapping berdasarkan pathname (diteruskan via children)
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) redirect('/auth/login')
  if (user.role !== 'super_admin' && user.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminShell user={user} pageTitle="Admin Panel">
      {children}
    </AdminShell>
  )
}
