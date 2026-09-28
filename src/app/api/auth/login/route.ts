/**
 * POST /api/auth/login
 */

import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { loginSchema, formatZodError } from '@/lib/validations'
import { ok, badRequest, unauthorized, serverError } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validasi input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { email, password } = result.data

    // Cari user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return unauthorized('Email atau password salah')
    }

    if (!user.isActive) {
      return unauthorized('Akun Anda telah dinonaktifkan. Hubungi administrator.')
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return unauthorized('Email atau password salah')
    }

    // Generate token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Set cookie
    await setAuthCookie(token)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Return user data (tanpa password)
    const { password: _, ...safeUser } = user

    return ok(
      { user: safeUser, token },
      'Login berhasil'
    )
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return serverError()
  }
}
