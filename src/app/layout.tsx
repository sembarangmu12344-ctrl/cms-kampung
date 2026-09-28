import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | CMS Kampung',
    default: 'CMS Kampung',
  },
  description: 'Website resmi kampung — informasi, berita, dan direktori UMKM warga.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
