/**
 * API Route Auth Middleware
 * Digunakan di dalam API route handlers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken, hasPermission, type Permission, type JwtPayload } from '@/lib/auth'
import { unauthorized, forbidden } from '@/lib/response'

type RouteHandler = (
  request: NextRequest,
  context: { params: Record<string, string> },
  user: JwtPayload
) => Promise<NextResponse>

/**
 * Wrapper untuk API route yang membutuhkan autentikasi
 *
 * Contoh penggunaan:
 * export const POST = withAuth(async (req, ctx, user) => { ... }, 'news:write')
 */
export function withAuth(handler: RouteHandler, requiredPermission?: Permission) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const token = getTokenFromRequest(request)

    if (!token) {
      return unauthorized() as NextResponse
    }

    const user = await verifyToken(token)

    if (!user) {
      return unauthorized('Token tidak valid atau sudah kadaluarsa') as NextResponse
    }

    if (!user.id) {
      return unauthorized('Sesi tidak valid') as NextResponse
    }

    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
      return forbidden() as NextResponse
    }

    return handler(request, context, user)
  }
}
