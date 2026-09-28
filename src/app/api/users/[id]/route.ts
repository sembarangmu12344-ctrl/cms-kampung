import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isSuperAdmin } from '@/lib/auth'
import { updateUserSchema, formatZodError } from '@/lib/validations'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const currentUser = await verifyToken(token)
    // Bisa lihat profile sendiri atau super admin
    if (!currentUser || (currentUser.id !== id && !isSuperAdmin(currentUser.role))) {
      return forbidden()
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true,
        role: true, avatarUrl: true,
        isActive: true, lastLogin: true, createdAt: true,
      },
    })
    if (!user) return notFound('Pengguna tidak ditemukan')

    return ok(user)
  } catch (error) {
    console.error('[GET /api/users/[id]]', error)
    return serverError()
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const currentUser = await verifyToken(token)
    if (!currentUser || (currentUser.id !== id && !isSuperAdmin(currentUser.role))) {
      return forbidden()
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return notFound('Pengguna tidak ditemukan')

    const body = await request.json()
    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { name, email, password, role, isActive } = result.data

    // Hanya super admin yang bisa ubah role dan isActive
    if ((role || isActive !== undefined) && !isSuperAdmin(currentUser.role)) {
      return forbidden('Hanya Super Admin yang dapat mengubah role')
    }

    // Cek email duplikat
    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) return badRequest('Email sudah digunakan')
    }

    let hashedPassword: string | undefined
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(role && isSuperAdmin(currentUser.role) && { role }),
        ...(isActive !== undefined && isSuperAdmin(currentUser.role) && { isActive }),
      },
      select: {
        id: true, name: true, email: true,
        role: true, isActive: true, updatedAt: true,
      },
    })

    return ok(updated, 'Pengguna berhasil diperbarui')
  } catch (error) {
    console.error('[PUT /api/users/[id]]', error)
    return serverError()
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const currentUser = await verifyToken(token)
    if (!currentUser || !isSuperAdmin(currentUser.role)) return forbidden()

    // Tidak boleh hapus diri sendiri
    if (currentUser.id === id) {
      return badRequest('Tidak dapat menghapus akun sendiri')
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return notFound('Pengguna tidak ditemukan')

    await prisma.user.delete({ where: { id } })
    return ok(null, 'Pengguna berhasil dihapus')
  } catch (error) {
    console.error('[DELETE /api/users/[id]]', error)
    return serverError()
  }
}
