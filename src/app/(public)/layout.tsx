import prisma from '@/lib/prisma'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import type { VillageInfoFull } from '@/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const village = await prisma.villageInfo.findFirst() as VillageInfoFull | null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar villageName={village?.name} />
      <main className="flex-1">{children}</main>
      <Footer village={village} />
    </div>
  )
}
