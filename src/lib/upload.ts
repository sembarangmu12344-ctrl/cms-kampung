/**
 * Upload Utility
 * Mendukung: Local storage (dev) & Cloudinary (production)
 */

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB ?? '5')
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type UploadResult = {
  url: string
  fileName: string
  size: number
}

// ─── Validasi File ───────────────────────────────────────────
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipe file tidak didukung. Gunakan: JPG, PNG, WEBP, atau GIF`,
    }
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB}MB`,
    }
  }

  return { valid: true }
}

// ─── Upload ke Local Storage ─────────────────────────────────
export async function uploadToLocal(file: File): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Buat nama file unik dengan timestamp
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`

  // Pastikan folder uploads ada
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, fileName)
  await writeFile(filePath, buffer)

  return {
    url: `/uploads/${fileName}`,
    fileName,
    size: file.size,
  }
}

// ─── Upload ke Cloudinary ────────────────────────────────────
export async function uploadToCloudinary(file: File, folder = 'cms-kampung'): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary belum dikonfigurasi. Cek file .env.local')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  // Buat signature untuk auth Cloudinary
  const timestamp = Math.round(Date.now() / 1000)
  const crypto = await import('crypto')
  const signature = crypto
    .createHash('sha256')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex')

  const formData = new FormData()
  formData.append('file', dataUri)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) {
    throw new Error('Gagal upload ke Cloudinary')
  }

  const data = await response.json()

  return {
    url: data.secure_url,
    fileName: data.public_id,
    size: data.bytes,
  }
}

// ─── Auto-select upload method ───────────────────────────────
export async function uploadFile(file: File, folder = 'cms-kampung'): Promise<UploadResult> {
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Gunakan Cloudinary jika sudah dikonfigurasi
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return uploadToCloudinary(file, folder)
  }

  // Default: local storage
  return uploadToLocal(file)
}
