'use client'

// src/components/ui/CopyButton.tsx
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 w-full justify-center py-2.5 text-sm rounded-xl border transition-all
        ${copied
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-violet-300 hover:text-violet-600 hover:bg-violet-500/10'
        }`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Tersalin!' : label}
    </button>
  )
}
