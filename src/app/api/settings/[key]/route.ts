import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getTokenFromRequest, verifyToken, isSuperAdmin } from '@/lib/auth'
import { updateSettingSchema, formatZodError } from '@/lib/validations'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

export const dynamic = 'force-dynamic'

// Key yang boleh diakses publik
const PUBLIC_KEYS = ['hero_title', 'hero_subtitle', 'maintenance_mode']

type Params = { params: Promise<{ key: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { key } = await params

    const setting = await prisma.setting.findUnique({ where: { key } })
    if (!setting) return notFound(`Setting '${key}' tidak ditemukan`)

    // Cek akses: publik hanya bisa akses PUBLIC_KEYS
    if (!PUBLIC_KEYS.includes(key)) {
      const token = getTokenFromRequest(request)
      if (!token) return unauthorized()
      const user = await verifyToken(token)
      if (!user) return unauthorized()
    }

    return ok(setting)
  } catch (error) {
    console.error('[GET /api/settings/[key]]', error)
    return serverError()
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { key } = await params

    const token = getTokenFromRequest(request)
    if (!token) return unauthorized()

    const user = await verifyToken(token)
    if (!user || !isSuperAdmin(user.role)) {
      return forbidden('Hanya Super Admin yang dapat mengubah pengaturan')
    }

    const body = await request.json()
    const result = updateSettingSchema.safeParse(body)
    if (!result.success) {
      return badRequest('Input tidak valid', formatZodError(result.error))
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: result.data.value },
      create: { key, value: result.data.value },
    })

    return ok(setting, `Setting '${key}' berhasil diperbarui`)
  } catch (error) {
    console.error('[PUT /api/settings/[key]]', error)
    return serverError()
  }
}
