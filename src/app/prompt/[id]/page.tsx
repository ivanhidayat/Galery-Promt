// src/app/prompt/[id]/page.tsx
// Halaman detail satu prompt â€” image besar + copy buttons

import { supabase, PromptEntry } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CopyButton from '@/components/ui/CopyButton'

export const revalidate = 3600

async function getPrompt(id: string): Promise<PromptEntry | null> {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as PromptEntry
}

export default async function PromptDetailPage({ params }: { params: { id: string } }) {
  const entry = await getPrompt(params.id)
  if (!entry) notFound()

  const genInfo = [
    { label: 'Model',      value: entry.model },
    { label: 'Steps',      value: entry.steps ?? 'â€”' },
    { label: 'CFG Scale',  value: entry.cfg ?? 'â€”' },
    { label: 'Sampler',    value: entry.sampler ?? 'â€”' },
    { label: 'Resolution', value: entry.resolution ?? 'â€”' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <header className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-4">
        <Link href="/gallery" className="text-lg font-semibold tracking-tight text-[var(--fg)]">
          prompt<span className="text-violet-500">gallery</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)]">
          <Image
            src={entry.image_url}
            alt={entry.title}
            width={1024}
            height={1024}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold text-[var(--fg)]">{entry.title}</h1>
          <p className="text-sm text-violet-500 mt-1">{entry.model}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.tags.map(tag => (
              <Link key={tag} href={`/gallery?tag=${tag}`}
                className="text-xs px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full hover:bg-violet-500/20">
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <Section label="Prompt">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--fg)] leading-relaxed">
            {entry.prompt}
          </div>
          <CopyButton text={entry.prompt} label="Copy prompt" />
        </Section>

        {/* Negative Prompt */}
        {entry.negative_prompt && (
          <Section label="Negative Prompt">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--muted)] leading-relaxed">
              {entry.negative_prompt}
            </div>
            <CopyButton text={entry.negative_prompt} label="Copy negative prompt" />
          </Section>
        )}

        {/* Generation Info */}
        <Section label="Generation Info">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {genInfo.map(({ label, value }) => (
              <div key={label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3">
                <p className="text-xs text-[var(--muted)] mb-0.5">{label}</p>
                <p className="text-sm font-medium text-[var(--fg)]">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        <Link href="/gallery" className="inline-block text-sm text-[var(--muted)] hover:text-violet-600">
          â† Kembali ke galeri
        </Link>
      </main>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{label}</p>
      {children}
    </div>
  )
}

