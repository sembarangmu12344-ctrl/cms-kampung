import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import KegiatanForm from '../KegiatanForm'

type Props = { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: 'Edit Kegiatan | Admin' }

export default async function EditKegiatanPage({ params }: Props) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  // Konversi Date ke string untuk client component
  const eventForClient = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Edit Kegiatan</h2>
        <p className="text-sm text-gray-500 mt-1 truncate">{event.title}</p>
      </div>
      <KegiatanForm event={eventForClient} mode="edit" />
    </div>
  )
}
