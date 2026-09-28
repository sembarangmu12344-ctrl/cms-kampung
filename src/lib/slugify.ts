/**
 * Slug Generator - Mendukung karakter Indonesia
 */

import SlugifyLib from 'slugify'
import prisma from './prisma'

export function createSlug(text: string): string {
  return SlugifyLib(text, {
    lower: true,
    strict: true,
    locale: 'id',
    trim: true,
  })
}

/**
 * Buat slug unik dengan suffix angka jika sudah ada
 * Contoh: "berita-desa" -> "berita-desa-2" -> "berita-desa-3"
 */
export async function createUniqueSlug(
  text: string,
  model: 'news' | 'umkm',
  excludeId?: string
): Promise<string> {
  const baseSlug = createSlug(text)
  let slug = baseSlug
  let counter = 1

  while (true) {
    let existing = null

    if (model === 'news') {
      existing = await prisma.news.findUnique({
        where: { slug },
        select: { id: true },
      })
    } else if (model === 'umkm') {
      existing = await prisma.umkm.findUnique({
        where: { slug },
        select: { id: true },
      })
    }

    // Tidak ada duplikat, atau duplikat adalah record yang sedang diedit
    if (!existing || existing.id === excludeId) {
      break
    }

    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}
