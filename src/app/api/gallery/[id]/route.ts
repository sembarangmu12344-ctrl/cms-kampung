export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { updateGallerySchema, formatZodError } from '@/lib/validations'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
      },
    })
    if (!gallery) return notFound('Foto tidak ditemukan')
    return ok(gallery)
  } catch (error) {
    console.error('[GET /api/gallery/[id]]', error)
    return serverError()
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const existing = await prisma.gallery.findUnique({ where: { id } })
    if (!existing) return notFound('Foto tidak ditemukan')

    const body = await request.json()
    const result = updateGallerySchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const updated = await prisma.gallery.update({
      where: { id },
      data: {
        ...(result.data.title && { title: result.data.title }),
        ...(result.data.description !== undefined && { description: result.data.description || null }),
        ...(result.data.imageUrl && { imageUrl: result.data.imageUrl }),
        ...(result.data.categoryId !== undefined && { categoryId: result.data.categoryId || null }),
        ...(result.data.isPublished !== undefined && { isPublished: result.data.isPublished }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })

    return ok(updated, 'Foto berhasil diperbarui')
  } catch (error) {
    console.error('[PUT /api/gallery/[id]]', error)
    return serverError()
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const existing = await prisma.gallery.findUnique({ where: { id } })
    if (!existing) return notFound('Foto tidak ditemukan')

    await prisma.gallery.delete({ where: { id } })
    return ok(null, 'Foto berhasil dihapus')
  } catch (error) {
    console.error('[DELETE /api/gallery/[id]]', error)
    return serverError()
  }
}
