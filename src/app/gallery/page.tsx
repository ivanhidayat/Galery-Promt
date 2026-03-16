// src/app/gallery/page.tsx
// Halaman galeri utama â€” fetch dari Supabase, masonry grid

import { supabase, PromptEntry } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60 // ISR: refresh tiap 60 detik

async function getImages(query?: string, tag?: string): Promise<PromptEntry[]> {
  let q = supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })

  if (tag)   q = q.contains('tags', [tag])
  if (query) q = q.textSearch('fts', query)

  const { data, error } = await q.limit(48)
  if (error) { console.error(error); return [] }
  return data as PromptEntry[]
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string }
}) {
  const images = await getImages(searchParams.q, searchParams.tag)

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Header */}
      <header className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center gap-4">
        <Link href="/gallery" className="text-lg font-semibold tracking-tight text-[var(--fg)]">
          prompt<span className="text-violet-500">gallery</span>
        </Link>
        <form className="flex-1 max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Cari prompt, style, model..."
            className="w-full text-sm border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] placeholder:text-[var(--muted)] rounded-lg px-3 py-2 outline-none focus:border-violet-400"
          />
        </form>
        <Link href="/admin" className="text-sm text-[var(--muted)] hover:text-violet-600">
          Admin â†—
        </Link>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {images.length === 0 ? (
          <div className="text-center py-24 text-[var(--muted)]">
            <p className="text-4xl mb-3">ðŸŽ¨</p>
            <p className="text-sm">Belum ada prompt. Upload lewat admin!</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {images.map(img => (
              <Link key={img.id} href={`/prompt/${img.id}`}
                className="break-inside-avoid mb-4 block group rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-violet-300 hover:-translate-y-0.5 transition-all">
                <div className="relative w-full bg-[var(--border)]">
                  <Image
                    src={img.image_url}
                    alt={img.title}
                    width={400}
                    height={400}
                    className="w-full h-auto block"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-[var(--fg)] mb-1 line-clamp-2">{img.title}</p>
                  <p className="text-xs text-[var(--muted)] mb-2">{img.model} Â· {img.resolution}</p>
                  <div className="flex flex-wrap gap-1">
                    {img.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

