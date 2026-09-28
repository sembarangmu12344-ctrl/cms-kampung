/**
 * GET  /api/users  - List pengguna (super_admin)
 * POST /api/users  - Tambah pengguna baru (super_admin)
 */

import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isSuperAdmin } from '@/lib/auth'
import { createUserSchema, formatZodError } from '@/lib/validations'
import { ok, created, badRequest, unauthorized, forbidden, serverError, getPaginationParams, getPaginationMeta } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isSuperAdmin(user.role)) return forbidden()

    const { searchParams } = request.nextUrl
    const { page, limit, skip } = getPaginationParams(searchParams)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ])

    return ok(users, undefined, getPaginationMeta(total, page, limit))
  } catch (error) {
    console.error('[GET /api/users]', error)
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isSuperAdmin(user.role)) return forbidden()

    const body = await request.json()
    const result = createUserSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { name, email, password, role } = result.data

    // Cek email sudah ada
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return badRequest('Email sudah terdaftar')

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: {
        id: true, name: true, email: true,
        role: true, isActive: true, createdAt: true,
      },
    })

    return created(newUser, 'Pengguna berhasil ditambahkan')
  } catch (error) {
    console.error('[POST /api/users]', error)
    return serverError()
  }
}
