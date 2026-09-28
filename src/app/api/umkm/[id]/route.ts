/**
 * GET    /api/umkm/[id]
 * PUT    /api/umkm/[id]
 * DELETE /api/umkm/[id]
 */

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { updateUmkmSchema, formatZodError } from '@/lib/validations'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'
import { createUniqueSlug } from '@/lib/slugify'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const umkm = await prisma.umkm.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        photos: { orderBy: { orderIndex: 'asc' } },
        author: { select: { id: true, name: true } },
      },
    })

    if (!umkm) return notFound('UMKM tidak ditemukan')

    return ok(umkm)
  } catch (error) {
    console.error('[GET /api/umkm/[id]]', error)
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

    const existing = await prisma.umkm.findUnique({ where: { id } })
    if (!existing) return notFound('UMKM tidak ditemukan')

    const body = await request.json()
    const result = updateUmkmSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { businessName, ownerName, description, whatsapp, address, mapsLink, coverImage, categoryId, isActive, isFeatured } = result.data

    let slug = existing.slug
    if (businessName && businessName !== existing.businessName) {
      slug = await createUniqueSlug(businessName, 'umkm', id)
    }

    const updated = await prisma.umkm.update({
      where: { id },
      data: {
        ...(businessName && { businessName, slug }),
        ...(ownerName && { ownerName }),
        ...(description !== undefined && { description: description || null }),
        ...(whatsapp !== undefined && { whatsapp: whatsapp || null }),
        ...(address !== undefined && { address: address || null }),
        ...(mapsLink !== undefined && { mapsLink: mapsLink || null }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        photos: { orderBy: { orderIndex: 'asc' } },
      },
    })

    return ok(updated, 'UMKM berhasil diperbarui')
  } catch (error) {
    console.error('[PUT /api/umkm/[id]]', error)
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

    const existing = await prisma.umkm.findUnique({ where: { id } })
    if (!existing) return notFound('UMKM tidak ditemukan')

    // Photos akan otomatis terhapus karena CASCADE
    await prisma.umkm.delete({ where: { id } })

    return ok(null, 'UMKM berhasil dihapus')
  } catch (error) {
    console.error('[DELETE /api/umkm/[id]]', error)
    return serverError()
  }
}
