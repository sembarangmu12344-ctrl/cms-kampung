import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { updateNewsSchema, formatZodError } from '@/lib/validations'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'
import { createUniqueSlug } from '@/lib/slugify'
import { generateExcerpt } from '@/lib/utils'
import { ContentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    // Support lookup by slug (cek apakah id adalah UUID atau slug)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isSlug = !UUID_REGEX.test(id)

    const news = await prisma.news.findFirst({
      where: isSlug ? { slug: id } : { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    if (!news) return notFound('Berita tidak ditemukan')

    // Increment views untuk request publik
    const token = getTokenFromRequest(request)
    const user = token ? await verifyToken(token) : null
    if (!user || !isAdmin(user.role)) {
      await prisma.news.update({
        where: { id: news.id },
        data: { views: { increment: 1 } },
      })
    }

    return ok(news)
  } catch (error) {
    console.error('[GET /api/news/[id]]', error)
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

    const existing = await prisma.news.findUnique({ where: { id } })
    if (!existing) return notFound('Berita tidak ditemukan')

    const body = await request.json()
    const result = updateNewsSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const { title, content, excerpt, coverImage, status, isPinned, categoryId } = result.data

    // Re-generate slug jika title berubah
    let slug = existing.slug
    if (title && title !== existing.title) {
      slug = await createUniqueSlug(title, 'news', id)
    }

    // Set publishedAt saat pertama kali publish
    let publishedAt = existing.publishedAt
    if (status === ContentStatus.published && !publishedAt) {
      publishedAt = new Date()
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        ...(title && { title, slug }),
        ...(content !== undefined && {
          content,
          excerpt: excerpt || generateExcerpt(content),
        }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(status !== undefined && { status, publishedAt }),
        ...(isPinned !== undefined && { isPinned }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
      },
    })

    return ok(updated, 'Berita berhasil diperbarui')
  } catch (error) {
    console.error('[PUT /api/news/[id]]', error)
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

    const existing = await prisma.news.findUnique({ where: { id } })
    if (!existing) return notFound('Berita tidak ditemukan')

    await prisma.news.delete({ where: { id } })

    return ok(null, 'Berita berhasil dihapus')
  } catch (error) {
    console.error('[DELETE /api/news/[id]]', error)
    return serverError()
  }
}
