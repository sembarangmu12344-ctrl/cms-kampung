import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import UmkmForm from '../UmkmForm'

type Props = { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: 'Edit UMKM | Admin' }

export default async function EditUmkmPage({ params }: Props) {
  const { id } = await params

  const [umkm, categories] = await Promise.all([
    prisma.umkm.findUnique({
      where: { id },
      include: { photos: { orderBy: { orderIndex: 'asc' } } },
    }),
    prisma.category.findMany({ where: { type: 'umkm' }, orderBy: { name: 'asc' } }),
  ])

  if (!umkm) notFound()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Edit UMKM</h2>
        <p className="text-sm text-gray-500 mt-1">{umkm.businessName}</p>
      </div>
      <UmkmForm categories={categories} umkm={umkm} mode="edit" />
    </div>
  )
}
