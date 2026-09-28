export const dynamic = 'force-dynamic'
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

    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    })

    // Konversi ke object {key: value}
    const settingsMap = settings.reduce(
      (acc, s) => {
        acc[s.key] = {
          value: s.value,
          type: s.type,
          description: s.description,
        }
        return acc
      },
      {} as Record<string, { value: string | null; type: string; description: string | null }>
    )

    return ok(settingsMap)
  } catch (error) {
    console.error('[GET /api/settings]', error)
    return serverError()
  }
}
