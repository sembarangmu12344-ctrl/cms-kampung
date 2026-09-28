/**
 * GET  /api/categories         - List semua kategori
 * POST /api/categories         - Buat kategori baru (admin)
 */

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { createCategorySchema, formatZodError } from '@/lib/validations'
import { ok, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/response'
import { createSlug } from '@/lib/slugify'
import { CategoryType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') as CategoryType | null

    const categories = await prisma.category.findMany({
      where: { ...(type && { type }) },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            news: true,
            umkm: true,
            galleries: true,
          },
        },
      },
    })

    return ok(categories)
  } catch (error) {
    console.error('[GET /api/categories]', error)
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
    const result = createCategorySchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { name, type } = result.data
    const slug = createSlug(name)

    // Cek slug sudah ada
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      return badRequest('Kategori dengan nama tersebut sudah ada')
    }

    const category = await prisma.category.create({
      data: { name, slug, type },
    })

    return created(category, 'Kategori berhasil dibuat')
  } catch (error) {
    console.error('[POST /api/categories]', error)
    return serverError()
  }
}
