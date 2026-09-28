\nexport const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { ok, created, unauthorized, forbidden, notFound, serverError, badRequest } from '@/lib/response'
import { uploadFile } from '@/lib/upload'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const umkm = await prisma.umkm.findUnique({ where: { id } })
    if (!umkm) return notFound('UMKM tidak ditemukan')

    const formData = await request.formData()
    const file = formData.get('photo') as File | null
    const caption = formData.get('caption') as string | null

    if (!file) return badRequest('File foto wajib diisi')

    // Cek limit foto (max 10 per UMKM)
    const photoCount = await prisma.umkmPhoto.count({ where: { umkmId: id } })
    if (photoCount >= 10) {
      return badRequest('Maksimal 10 foto per UMKM')
    }

    const { url } = await uploadFile(file, 'cms-kampung/umkm')

    // Tentukan order index
    const lastPhoto = await prisma.umkmPhoto.findFirst({
      where: { umkmId: id },
      orderBy: { orderIndex: 'desc' },
    })
    const orderIndex = (lastPhoto?.orderIndex ?? -1) + 1

    const photo = await prisma.umkmPhoto.create({
      data: {
        umkmId: id,
        photoUrl: url,
        caption: caption || null,
        orderIndex,
      },
    })

    // Set sebagai cover jika ini foto pertama
    if (photoCount === 0) {
      await prisma.umkm.update({
        where: { id },
        data: { coverImage: url },
      })
    }

    return created(photo, 'Foto berhasil diupload')
  } catch (error) {
    console.error('[POST /api/umkm/[id]/photos/upload]', error)
    return serverError()
  }
}
