export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getTokenFromRequest, verifyToken, isSuperAdmin, isAdmin } from '@/lib/auth'
import { updateVillageSchema, formatZodError } from '@/lib/validations'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

export async function GET() {
  try {
    const village = await prisma.villageInfo.findFirst()
    if (!village) return notFound('Info kampung belum dikonfigurasi')
    return ok(village)
  } catch (error) {
    console.error('[GET /api/village]', error)
    return serverError()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const body = await request.json()
    const result = updateVillageSchema.safeParse(body)
    if (!result.success) {
      console.error('[PUT /api/village] Validation error:', JSON.stringify(result.error.issues))
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const existing = await prisma.villageInfo.findFirst()

    // Sanitasi: konversi string kosong ke null untuk field URL
    const sanitizedData = {
      ...result.data,
      logoUrl: result.data.logoUrl || null,
      bannerUrl: result.data.bannerUrl || null,
      email: result.data.email || null,
      phone: result.data.phone || null,
      address: result.data.address || null,
      tagline: result.data.tagline || null,
      description: result.data.description || null,
      mapEmbed: result.data.mapEmbed || null,
      // Prisma butuh Prisma.JsonNull untuk nullable Json fields
      socialMedia: result.data.socialMedia === null ? Prisma.JsonNull : result.data.socialMedia,
      statistics: result.data.statistics === null ? Prisma.JsonNull : result.data.statistics,
    }

    let village
    if (existing) {
      village = await prisma.villageInfo.update({
        where: { id: existing.id },
        data: sanitizedData as Parameters<typeof prisma.villageInfo.update>[0]['data'],
      })
    } else {
      if (!isSuperAdmin(user.role)) return forbidden('Hanya Super Admin yang dapat membuat info kampung')
      village = await prisma.villageInfo.create({
        data: {
          name: sanitizedData.name ?? 'Kampung Baru',
          ...sanitizedData,
        },
      })
    }

    return ok(village, 'Info kampung berhasil diperbarui')
  } catch (error) {
    console.error('[PUT /api/village]', error)
    return serverError()
  }
}
