/**
 * GET    /api/events/[id]
 * PUT    /api/events/[id]
 * DELETE /api/events/[id]
 */

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'
import { z } from 'zod'

const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  location: z.string().max(300).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  status: z.enum(['upcoming', 'ongoing', 'done', 'cancelled']).optional(),
  coverImage: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    })
    if (!event) return notFound('Kegiatan tidak ditemukan')
    return ok(event)
  } catch (error) {
    console.error('[GET /api/events/[id]]', error)
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

    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return notFound('Kegiatan tidak ditemukan')

    const body = await request.json()
    const result = updateEventSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', result.error.issues.reduce((acc, i) => {
        acc[i.path.join('.')] = i.message; return acc
      }, {} as Record<string, string>))
    }

    const { title, description, location, startDate, endDate, startTime, endTime, status, coverImage, isPublished } = result.data

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(location !== undefined && { location: location || null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(startTime !== undefined && { startTime: startTime || null }),
        ...(endTime !== undefined && { endTime: endTime || null }),
        ...(status && { status }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: { author: { select: { id: true, name: true } } },
    })

    return ok(updated, 'Kegiatan berhasil diperbarui')
  } catch (error) {
    console.error('[PUT /api/events/[id]]', error)
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

    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) return notFound('Kegiatan tidak ditemukan')

    await prisma.event.delete({ where: { id } })
    return ok(null, 'Kegiatan berhasil dihapus')
  } catch (error) {
    console.error('[DELETE /api/events/[id]]', error)
    return serverError()
  }
}
