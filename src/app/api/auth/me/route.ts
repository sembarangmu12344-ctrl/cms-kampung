import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { ok, unauthorized, notFound, serverError } from '@/lib/response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const payload = await verifyToken(token)
    if (!payload) return unauthorized('Token tidak valid atau sudah kadaluarsa')

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
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
    })

    if (!user) return notFound('User tidak ditemukan')
    if (!user.isActive) return unauthorized('Akun telah dinonaktifkan')

    return ok(user)
  } catch (error) {
    console.error('[GET /api/auth/me]', error)
    return serverError()
  }
}
