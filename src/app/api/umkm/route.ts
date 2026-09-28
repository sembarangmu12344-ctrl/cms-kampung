import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { createUmkmSchema, formatZodError } from '@/lib/validations'
import { ok, created, badRequest, unauthorized, forbidden, serverError, getPaginationParams, getPaginationMeta } from '@/lib/response'
import { createUniqueSlug } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const { page, limit, skip } = getPaginationParams(searchParams)

    const search = searchParams.get('search') ?? ''
    const categorySlug = searchParams.get('category') ?? ''
    const featured = searchParams.get('featured')

    // Admin bisa lihat semua, publik hanya yang aktif
    const token = getTokenFromRequest(request)
    let isAdminRequest = false
    if (token) {
      const user = await verifyToken(token)
      if (user && isAdmin(user.role)) isAdminRequest = true
    }

    const where = {
      ...(!isAdminRequest && { isActive: true }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' as const } },
          { ownerName: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(featured === 'true' && { isFeatured: true }),
    }

    const [umkm, total] = await Promise.all([
      prisma.umkm.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          businessName: true,
          ownerName: true,
          slug: true,
          description: true,
          whatsapp: true,
          address: true,
          coverImage: true,
          isActive: true,
          isFeatured: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { photos: true } },
        },
      }),
      prisma.umkm.count({ where }),
    ])

    return ok(umkm, undefined, getPaginationMeta(total, page, limit))
  } catch (error) {
    console.error('[GET /api/umkm]', error)
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
    const result = createUmkmSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { businessName, ownerName, description, whatsapp, address, mapsLink, coverImage, categoryId, isActive, isFeatured } = result.data

    const slug = await createUniqueSlug(businessName, 'umkm')

    const umkm = await prisma.umkm.create({
      data: {
        businessName,
        ownerName,
        slug,
        description: description || null,
        whatsapp: whatsapp || null,
        address: address || null,
        mapsLink: mapsLink || null,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        isActive,
        isFeatured,
        authorId: user.id,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        photos: true,
      },
    })

    return created(umkm, 'UMKM berhasil ditambahkan')
  } catch (error) {
    console.error('[POST /api/umkm]', error)
    return serverError()
  }
}
