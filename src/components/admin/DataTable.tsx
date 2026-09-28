'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────

export type Column<T> = {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

type Props<T extends { id: string }> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
}

// ─── Component ───────────────────────────────────────────────

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Tidak ada data.',
}: Props<T>) {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full max-w-[180px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="py-16 text-center text-gray-400 text-sm">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 text-gray-700', col.className)}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
