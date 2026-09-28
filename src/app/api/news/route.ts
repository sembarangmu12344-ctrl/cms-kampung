\nexport const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { createNewsSchema, formatZodError } from '@/lib/validations'
import { ok, created, badRequest, unauthorized, forbidden, serverError, getPaginationParams, getPaginationMeta } from '@/lib/response'
import { createUniqueSlug } from '@/lib/slugify'
import { generateExcerpt } from '@/lib/utils'
import { ContentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const { page, limit, skip } = getPaginationParams(searchParams)

    const search = searchParams.get('search') ?? ''
    const categorySlug = searchParams.get('category') ?? ''
    const status = searchParams.get('status') as ContentStatus | null
    const pinned = searchParams.get('pinned')

    // Cek apakah request dari admin (bisa lihat draft)
    const token = getTokenFromRequest(request)
    let isAdminRequest = false
    if (token) {
      const user = await verifyToken(token)
      if (user && isAdmin(user.role)) isAdminRequest = true
    }

    const where = {
      ...(isAdminRequest
        ? status ? { status } : {}
        : { status: ContentStatus.published }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(pinned === 'true' && { isPinned: true }),
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          status: true,
          isPinned: true,
          views: true,
          publishedAt: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.news.count({ where }),
    ])

    return ok(news, undefined, getPaginationMeta(total, page, limit))
  } catch (error) {
    console.error('[GET /api/news]', error)
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
    const result = createNewsSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { title, content, excerpt, coverImage, status, isPinned, categoryId } = result.data

    const slug = await createUniqueSlug(title, 'news')
    const autoExcerpt = excerpt || generateExcerpt(content)
    const publishedAt = status === 'published' ? new Date() : null

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt: autoExcerpt,
        coverImage: coverImage || null,
        status,
        isPinned,
        publishedAt,
        categoryId: categoryId || null,
        authorId: user.id,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
      },
    })

    return created(news, 'Berita berhasil dibuat')
  } catch (error) {
    console.error('[POST /api/news]', error)
    return serverError()
  }
}
