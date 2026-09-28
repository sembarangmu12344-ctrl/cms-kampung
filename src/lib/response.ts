/**
 * API Response Helpers - Format response JSON yang konsisten
 */

import { NextResponse } from 'next/server'

type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string> | string
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

// ─── Success Responses ───────────────────────────────────────
export function ok<T>(data: T, message?: string, meta?: ApiResponse['meta']) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data, meta },
    { status: 200 }
  )
}

export function created<T>(data: T, message = 'Data berhasil dibuat') {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data },
    { status: 201 }
  )
}

// ─── Error Responses ─────────────────────────────────────────
export function badRequest(message: string, errors?: ApiResponse['errors']) {
  return NextResponse.json<ApiResponse>(
    { success: false, message, errors },
    { status: 400 }
  )
}

export function unauthorized(message = 'Silakan login terlebih dahulu') {
  return NextResponse.json<ApiResponse>(
    { success: false, message },
    { status: 401 }
  )
}

export function forbidden(message = 'Anda tidak memiliki akses ke resource ini') {
  return NextResponse.json<ApiResponse>(
    { success: false, message },
    { status: 403 }
  )
}

export function notFound(message = 'Data tidak ditemukan') {
  return NextResponse.json<ApiResponse>(
    { success: false, message },
    { status: 404 }
  )
}

export function serverError(message = 'Terjadi kesalahan pada server') {
  return NextResponse.json<ApiResponse>(
    { success: false, message },
    { status: 500 }
  )
}

// ─── Pagination Helper ───────────────────────────────────────
export function getPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
