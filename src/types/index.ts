/**
 * Global TypeScript Types & Interfaces
 */

import type { User, News, Umkm, UmkmPhoto, Gallery, Category, VillageInfo, Setting } from '@prisma/client'

// ─── Re-export Prisma Types ───────────────────────────────────
export type { User, News, Umkm, UmkmPhoto, Gallery, Category, VillageInfo, Setting }

// ─── Auth ────────────────────────────────────────────────────
export type SafeUser = Omit<User, 'password'>

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'visitor'
  avatarUrl?: string | null
}

// ─── News dengan relasi ───────────────────────────────────────
export type NewsWithRelations = News & {
  category?: Category | null
  author?: SafeUser | null
}

export type NewsListItem = Pick<
  News,
  'id' | 'title' | 'slug' | 'excerpt' | 'coverImage' | 'status' |
  'isPinned' | 'views' | 'publishedAt' | 'createdAt'
> & {
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null
  author?: Pick<User, 'id' | 'name'> | null
}

// ─── UMKM dengan relasi ───────────────────────────────────────
export type UmkmWithRelations = Umkm & {
  category?: Category | null
  photos?: UmkmPhoto[]
  author?: SafeUser | null
}

export type UmkmListItem = Pick<
  Umkm,
  'id' | 'businessName' | 'ownerName' | 'slug' | 'description' |
  'whatsapp' | 'address' | 'coverImage' | 'isActive' | 'isFeatured' | 'createdAt'
> & {
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null
  _count?: { photos: number }
}

// ─── Gallery dengan relasi ────────────────────────────────────
export type GalleryWithRelations = Gallery & {
  category?: Category | null
  author?: SafeUser | null
}

// ─── API Response Types ───────────────────────────────────────
export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string> | string
  meta?: PaginationMeta
}

export type PaginationMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

// ─── Form Types ───────────────────────────────────────────────
export type NewsFormData = {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  status: 'draft' | 'published' | 'archived'
  isPinned: boolean
  categoryId?: string | null
}

export type UmkmFormData = {
  businessName: string
  ownerName: string
  description?: string
  whatsapp?: string
  address?: string
  mapsLink?: string
  coverImage?: string
  categoryId?: string | null
  isActive: boolean
  isFeatured: boolean
}

// ─── Village Social Media & Statistics ───────────────────────
export type VillageSocialMedia = {
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
}

export type VillageStatistics = {
  population?: number
  households?: number
  area_km2?: number
  rw?: number
  rt?: number
}

export type VillageInfoFull = Omit<VillageInfo, 'socialMedia' | 'statistics'> & {
  socialMedia?: VillageSocialMedia | null
  statistics?: VillageStatistics | null
}

// ─── Dashboard Stats ─────────────────────────────────────────
export type DashboardStats = {
  totalNews: number
  publishedNews: number
  totalUmkm: number
  activeUmkm: number
  totalGallery: number
  totalVisitors: number
  recentNews: NewsListItem[]
  recentUmkm: UmkmListItem[]
}

// ─── Navigation ──────────────────────────────────────────────
export type NavItem = {
  label: string
  href: string
  icon?: string
  children?: NavItem[]
}
