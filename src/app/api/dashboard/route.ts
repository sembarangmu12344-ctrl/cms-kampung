\nexport const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { ok, unauthorized, forbidden, serverError } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const [
      totalNews,
      publishedNews,
      draftNews,
      totalUmkm,
      activeUmkm,
      featuredUmkm,
      totalGallery,
      publishedGallery,
      totalUsers,
      recentNews,
      recentUmkm,
    ] = await Promise.all([
      prisma.news.count(),
      prisma.news.count({ where: { status: 'published' } }),
      prisma.news.count({ where: { status: 'draft' } }),
      prisma.umkm.count(),
      prisma.umkm.count({ where: { isActive: true } }),
      prisma.umkm.count({ where: { isFeatured: true } }),
      prisma.gallery.count(),
      prisma.gallery.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { isActive: true } }),
      // 5 berita terbaru
      prisma.news.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          views: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      }),
      // 5 UMKM terbaru
      prisma.umkm.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          businessName: true,
          ownerName: true,
          slug: true,
          isActive: true,
          createdAt: true,
          category: { select: { name: true } },
        },
      }),
    ])

    return ok({
      stats: {
        news: { total: totalNews, published: publishedNews, draft: draftNews },
        umkm: { total: totalUmkm, active: activeUmkm, featured: featuredUmkm },
        gallery: { total: totalGallery, published: publishedGallery },
        users: { active: totalUsers },
      },
      recentNews,
      recentUmkm,
    })
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return serverError()
  }
}
