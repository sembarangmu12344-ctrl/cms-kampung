/**
 * Next.js Edge Middleware
 * Melindungi route /admin dari akses tanpa login
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production'
)
const COOKIE_NAME = 'cms_kampung_token'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Protect /admin routes ───────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const role = payload.role as string

      // Hanya super_admin dan admin yang boleh akses /admin
      if (role !== 'super_admin' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Hanya super_admin yang boleh akses /admin/pengguna
      if (pathname.startsWith('/admin/pengguna') && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      return NextResponse.next()
    } catch {
      // Token invalid, redirect ke login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(COOKIE_NAME)
      return response
    }
  }

  // ─── Redirect /auth/login jika sudah login ───────────────
  if (pathname === '/auth/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET)
        return NextResponse.redirect(new URL('/admin', request.url))
      } catch {
        // Token invalid, biarkan ke halaman login
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
  ],
}
