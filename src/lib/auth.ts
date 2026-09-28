/**
 * Auth Utilities - JWT & Session Management
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export type JwtPayload = {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'visitor'
  name: string
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production'
)
const COOKIE_NAME = 'cms_kampung_token'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

// ─── Generate Token ─────────────────────────────────────────
export async function signToken(payload: JwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
}

// ─── Verify Token ───────────────────────────────────────────
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

// ─── Set Auth Cookie ────────────────────────────────────────
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  })
}

// ─── Remove Auth Cookie ─────────────────────────────────────
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// ─── Get Current User dari Cookie (Server Component) ────────
export async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// ─── Get Token dari Request (API Route) ─────────────────────
export function getTokenFromRequest(request: NextRequest): string | null {
  // Cek cookie dulu
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  // Fallback ke Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

// ─── Permission Checker ──────────────────────────────────────
export type Permission =
  | 'news:read' | 'news:write' | 'news:delete'
  | 'umkm:read' | 'umkm:write' | 'umkm:delete'
  | 'gallery:read' | 'gallery:write' | 'gallery:delete'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'village:read' | 'village:write'
  | 'settings:read' | 'settings:write'
  | 'upload:write'

const ROLE_PERMISSIONS: Record<JwtPayload['role'], Permission[] | ['*']> = {
  super_admin: ['*'],
  admin: [
    'news:read', 'news:write', 'news:delete',
    'umkm:read', 'umkm:write', 'umkm:delete',
    'gallery:read', 'gallery:write', 'gallery:delete',
    'village:read',
    'settings:read',
    'upload:write',
  ],
  visitor: [
    'news:read',
    'umkm:read',
    'gallery:read',
    'village:read',
  ],
}

export function hasPermission(role: JwtPayload['role'], permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role]
  if (perms[0] === '*') return true
  return (perms as Permission[]).includes(permission)
}

export function isAdmin(role: JwtPayload['role']): boolean {
  return role === 'super_admin' || role === 'admin'
}

export function isSuperAdmin(role: JwtPayload['role']): boolean {
  return role === 'super_admin'
}
