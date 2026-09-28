/**
 * POST /api/upload  - Upload file gambar (admin)
 * Mengembalikan URL file yang dapat digunakan
 */

import { NextRequest } from 'next/server'
import { getTokenFromRequest, verifyToken, isAdmin } from '@/lib/auth'
import { uploadFile } from '@/lib/upload'
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isAdmin(user.role)) return forbidden()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'cms-kampung'

    if (!file) return badRequest('File wajib disertakan')

    const result = await uploadFile(file, folder)

    return ok(result, 'File berhasil diupload')
  } catch (error: unknown) {
    // Handle validation errors dari uploadFile
    if (error instanceof Error && error.message.includes('Tipe file')) {
      return badRequest(error.message)
    }
    if (error instanceof Error && error.message.includes('Ukuran file')) {
      return badRequest(error.message)
    }
    console.error('[POST /api/upload]', error)
    return serverError()
  }
}
