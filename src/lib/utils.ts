/**
 * General Utility Functions
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// ─── Tailwind Class Merger ────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date Formatters ─────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: localeId })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy, HH:mm 'WIB'", { locale: localeId })
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: localeId })
}

// ─── WhatsApp Link Generator ──────────────────────────────────
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

// ─── Truncate Text ────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// ─── Strip HTML Tags ──────────────────────────────────────────
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// ─── Format Number ───────────────────────────────────────────
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

// ─── Generate Excerpt dari HTML ──────────────────────────────
export function generateExcerpt(html: string, maxLength = 160): string {
  const text = stripHtml(html)
  return truncate(text, maxLength)
}

// ─── Validate URL ────────────────────────────────────────────
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ─── Image Fallback ──────────────────────────────────────────
export function getImageUrl(url?: string | null, fallback = '/images/placeholder.jpg'): string {
  if (!url) return fallback
  if (url.startsWith('/') || url.startsWith('http')) return url
  return fallback
}
