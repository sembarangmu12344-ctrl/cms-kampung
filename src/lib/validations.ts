/**
 * Zod Validation Schemas
 */

import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['super_admin', 'admin', 'visitor']).default('admin'),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['super_admin', 'admin', 'visitor']).optional(),
  isActive: z.boolean().optional(),
})

// ─── News ────────────────────────────────────────────────────
export const createNewsSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(300),
  content: z.string().min(1, 'Konten wajib diisi'),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isPinned: z.boolean().default(false),
  categoryId: z.string().uuid().optional().nullable(),
})

export const updateNewsSchema = createNewsSchema.partial()

// ─── UMKM ────────────────────────────────────────────────────
export const createUmkmSchema = z.object({
  businessName: z.string().min(3, 'Nama usaha minimal 3 karakter').max(200),
  ownerName: z.string().min(3, 'Nama pemilik minimal 3 karakter').max(150),
  description: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  mapsLink: z.string().url('Link Google Maps tidak valid').optional().nullable().or(z.literal('')),
  coverImage: z.string().optional().nullable().or(z.literal('')),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

export const updateUmkmSchema = createUmkmSchema.partial()

// ─── Gallery ─────────────────────────────────────────────────
export const createGallerySchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().min(1, 'URL gambar wajib diisi'),
  categoryId: z.string().uuid().optional().nullable(),
  isPublished: z.boolean().default(true),
})

export const updateGallerySchema = createGallerySchema.partial()

// ─── Village Info ─────────────────────────────────────────────
export const updateVillageSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  tagline: z.string().max(300).optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().max(20).optional().nullable().or(z.literal('')),
  email: z.string().email().optional().nullable().or(z.literal('')),
  logoUrl: z.string().optional().nullable().or(z.literal('')),
  bannerUrl: z.string().optional().nullable().or(z.literal('')),
  mapEmbed: z.string().optional().nullable(),
  socialMedia: z
    .object({
      instagram: z.string().optional().or(z.literal('')),
      facebook: z.string().optional().or(z.literal('')),
      youtube: z.string().optional().or(z.literal('')),
      tiktok: z.string().optional().or(z.literal('')),
    })
    .optional()
    .nullable(),
  statistics: z
    .object({
      population: z.number().optional(),
      households: z.number().optional(),
      area_km2: z.number().optional(),
      rw: z.number().optional(),
      rt: z.number().optional(),
    })
    .optional()
    .nullable(),
})

// ─── Category ─────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  type: z.enum(['news', 'umkm', 'gallery']),
})

// ─── Settings ─────────────────────────────────────────────────
export const updateSettingSchema = z.object({
  value: z.string(),
})

// ─── Helper: Format Zod Errors ───────────────────────────────
export function formatZodError(error: z.ZodError): Record<string, string> {
  return error.issues.reduce(
    (acc, issue) => {
      const key = issue.path.join('.')
      acc[key] = issue.message
      return acc
    },
    {} as Record<string, string>
  )
}
