/**
 * POST /api/auth/logout
 */

import { NextRequest } from 'next/server'
import { removeAuthCookie } from '@/lib/auth'
import { ok } from '@/lib/response'

export async function POST(_request: NextRequest) {
  await removeAuthCookie()
  return ok(null, 'Logout berhasil')
}
