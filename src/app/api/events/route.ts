/**
 * GET  /api/events  - List kegiatan (publik)
 * POST /api/events  - Tambah kegiatan (admin)
 */

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { ok, created, badRequest, unauthorized, forbidden, serverError, getPaginationParams, getPaginationMeta } from '@/lib/response'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  description: z.string().optional(),
  location: z.string().max(300).optional(),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().optional(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  status: z.enum(['upcoming', 'ongoing', 'done', 'cancelled']).default('upcoming'),
  coverImage: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status') ?? ''
    const upcoming = searchParams.get('upcoming') // hanya ambil yang akan datang

    const token = getTokenFromRequest(request)
    let isAdminRequest = false
    if (token) {
      const user = await verifyToken(token)
      if (user && isAdmin(user.role)) isAdminRequest = true
    }

    const now = new Date()

    const where = {
      ...(!isAdminRequest && { isPublished: true }),
      ...(status && { status: status as 'upcoming' | 'ongoing' | 'done' | 'cancelled' }),
      // Filter hanya upcoming & ongoing (untuk widget beranda)
      ...(upcoming === 'true' && {
        status: { in: ['upcoming', 'ongoing'] as ('upcoming' | 'ongoing' | 'done' | 'cancelled')[] },
        startDate: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }),
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.event.count({ where }),
    ])

    return ok(events, undefined, getPaginationMeta(total, page, limit))
  } catch (error) {
    console.error('[GET /api/events]', error)
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const body = await request.json()
    const result = createEventSchema.safeParse(body)
    if (!result.success) {
      console.error('[POST /api/events] Validation error:', JSON.stringify(result.error.issues))
      return badRequest('Input tidak valid', result.error.issues.reduce((acc, i) => {
        acc[i.path.join('.')] = i.message; return acc
      }, {} as Record<string, string>))
    }

    const { title, description, location, startDate, endDate, startTime, endTime, status, coverImage, isPublished } = result.data

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        location: location || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        startTime: startTime || null,
        endTime: endTime || null,
        status,
        coverImage: coverImage || null,
        isPublished,
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    })

    return created(event, 'Kegiatan berhasil ditambahkan')
  } catch (error) {
    console.error('[POST /api/events]', error)
    return serverError()
  }
}
