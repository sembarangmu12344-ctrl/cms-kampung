export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { createGallerySchema, formatZodError } from '@/lib/validations'
import { ok, created, badRequest, unauthorized, forbidden, serverError, getPaginationParams, getPaginationMeta } from '@/lib/response'
import { uploadFile } from '@/lib/upload'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const { page, limit, skip } = getPaginationParams(searchParams)
    const categorySlug = searchParams.get('category') ?? ''

    const token = getTokenFromRequest(request)
    let isAdminRequest = false
    if (token) {
      const user = await verifyToken(token)
      if (user && isAdmin(user.role)) isAdminRequest = true
    }

    const where = {
      ...(!isAdminRequest && { isPublished: true }),
      ...(categorySlug && { category: { slug: categorySlug } }),
    }

    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.gallery.count({ where }),
    ])

    return ok(galleries, undefined, getPaginationMeta(total, page, limit))
  } catch (error) {
    console.error('[GET /api/gallery]', error)
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const contentType = request.headers.get('content-type') ?? ''

    let imageUrl = ''
    let title = ''
    let description = ''
    let categoryId: string | null = null
    let isPublished = true

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get('image') as File | null
      if (!file) return badRequest('File gambar wajib diisi')

      const { url } = await uploadFile(file, 'cms-kampung/gallery')
      imageUrl = url
      title = (formData.get('title') as string) || ''
      description = (formData.get('description') as string) || ''
      categoryId = (formData.get('categoryId') as string) || null
      isPublished = formData.get('isPublished') !== 'false'
    } else {
      // Handle JSON (URL sudah ada)
      const body = await request.json()
      const result = createGallerySchema.safeParse(body)
      if (!result.success) {
        return badRequest('Input tidak valid', formatZodError(result.error))
      }
      imageUrl = result.data.imageUrl
      title = result.data.title
      description = result.data.description || ''
      categoryId = result.data.categoryId || null
      isPublished = result.data.isPublished
    }

    if (!title) return badRequest('Judul foto wajib diisi')

    const gallery = await prisma.gallery.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        categoryId,
        isPublished,
        authorId: user.id,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })

    return created(gallery, 'Foto berhasil ditambahkan ke galeri')
  } catch (error) {
    console.error('[POST /api/gallery]', error)
    return serverError()
  }
}
