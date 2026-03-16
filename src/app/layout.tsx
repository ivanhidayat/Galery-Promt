// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import ThemeScript from '../components/ui/ThemeScript'
import ThemeToggle from '../components/ui/ThemeToggle'

export const metadata: Metadata = {
  title: 'Prompt Gallery',
  description: 'Galeri referensi prompt AI — temukan, copy, dan generate.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors">
        <ThemeScript />
        {children}
        <ThemeToggle />
      </body>
    </html>
  )
}
