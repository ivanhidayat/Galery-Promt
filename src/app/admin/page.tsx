'use client'

// src/app/admin/page.tsx
// Halaman admin untuk upload prompt + gambar baru

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { Upload, X, Check, Loader2, ImagePlus, Tag } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

// â”€â”€â”€ Konstanta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const AI_MODELS = ['SDXL', 'FLUX', 'Midjourney v6', 'Anything v5', 'Realistic Vision', 'DreamShaper', 'Juggernaut XL']
const SAMPLERS  = ['DPM++ 2M', 'DPM++ SDE', 'Euler A', 'Euler', 'DDIM', 'PLMS', 'UniPC']
const SUGGESTED_TAGS = ['photorealistic', 'cinematic', 'anime', 'fantasy', 'architecture', 'portrait', 'landscape', 'product', 'dark', 'vibrant']

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type FormState = {
  title: string
  prompt: string
  negative_prompt: string
  model: string
  steps: string
  cfg: string
  sampler: string
  resolution: string
  tags: string[]
}

const INITIAL_FORM: FormState = {
  title: '', prompt: '', negative_prompt: '',
  model: 'SDXL', steps: '30', cfg: '7',
  sampler: 'DPM++ 2M', resolution: '1024x1024', tags: [],
}

// â”€â”€â”€ Komponen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminUploadPage() {
  const [form, setForm]         = useState<FormState>(INITIAL_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [tagInput, setTagInput] = useState('')
  const fileRef                 = useRef<HTMLInputElement>(null)

  // â”€â”€ Field handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const set = (key: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // â”€â”€ Image picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // â”€â”€ Tag handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase()
    if (!clean || form.tags.includes(clean)) return
    setForm(prev => ({ ...prev, tags: [...prev.tags, clean] }))
  }

  function removeTag(tag: string) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  function handleTagInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    }
  }

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!imageFile) { toast.error('Pilih gambar terlebih dahulu'); return }
    if (!form.title || !form.prompt || !form.model) {
      toast.error('Title, Prompt, dan Model wajib diisi')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, Array.isArray(v) ? v.join(',') : v)
      })

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Upload gagal')

      toast.success('Prompt berhasil diupload!')
      setForm(INITIAL_FORM)
      clearImage()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center gap-3">
        <div className="text-lg font-semibold tracking-tight">
          prompt<span className="text-violet-500">gallery</span>
        </div>
        <span className="text-[var(--muted)]">Â·</span>
        <span className="text-sm text-[var(--muted)]">Admin Â· Upload Prompt</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--fg)] mb-1">Upload Prompt Baru</h1>
          <p className="text-sm text-[var(--muted)]">Isi detail prompt dan upload gambar hasil generate AI.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* â”€â”€ Image Upload â”€â”€ */}
          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-2">
              Gambar <span className="text-red-400">*</span>
            </label>
            {preview ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview" className="w-full max-h-80 object-contain" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-[var(--card)] border border-[var(--border)] rounded-full p-1.5 shadow-sm hover:bg-[var(--border)]"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  {imageFile?.name} Â· {((imageFile?.size ?? 0) / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-48 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-violet-300 bg-[var(--card)] hover:bg-violet-50 transition-colors flex flex-col items-center justify-center gap-2 text-[var(--muted)] hover:text-violet-500"
              >
                <ImagePlus size={28} />
                <span className="text-sm">Klik untuk pilih gambar</span>
                <span className="text-xs text-[var(--muted)]">PNG, JPG, WEBP Â· maks. 10MB</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          {/* â”€â”€ Title â”€â”€ */}
          <Field label="Judul / Title" required>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="cth: Bali Temple Cinematic Photography"
              className="input"
            />
          </Field>

          {/* â”€â”€ Prompt â”€â”€ */}
          <Field label="Prompt" required>
            <textarea
              value={form.prompt}
              onChange={e => set('prompt', e.target.value)}
              placeholder="ultra realistic bali temple photography, golden hour sunlight, cinematic lighting..."
              rows={4}
              className="input resize-none"
            />
          </Field>

          {/* â”€â”€ Negative Prompt â”€â”€ */}
          <Field label="Negative Prompt" hint="opsional">
            <textarea
              value={form.negative_prompt}
              onChange={e => set('negative_prompt', e.target.value)}
              placeholder="blurry, low quality, distorted face, watermark..."
              rows={2}
              className="input resize-none"
            />
          </Field>

          {/* â”€â”€ Generation Info (2-col grid) â”€â”€ */}
          <div>
            <p className="text-sm font-medium text-[var(--fg)] mb-3">Generation Info</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Model AI" required>
                <select value={form.model} onChange={e => set('model', e.target.value)} className="input">
                  {AI_MODELS.map(m => <option key={m}>{m}</option>)}
                  <option value="__custom__">Lainnya...</option>
                </select>
              </Field>
              <Field label="Sampler">
                <select value={form.sampler} onChange={e => set('sampler', e.target.value)} className="input">
                  {SAMPLERS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Steps">
                <input type="number" min={1} max={150} value={form.steps}
                  onChange={e => set('steps', e.target.value)} className="input" />
              </Field>
              <Field label="CFG Scale">
                <input type="number" min={1} max={30} step={0.5} value={form.cfg}
                  onChange={e => set('cfg', e.target.value)} className="input" />
              </Field>
              <Field label="Resolution" hint="cth: 1024x1024">
                <input type="text" value={form.resolution}
                  onChange={e => set('resolution', e.target.value)} className="input" />
              </Field>
            </div>
          </div>

          {/* â”€â”€ Tags â”€â”€ */}
          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-2">Tags</label>

            {/* Input tag manual */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 flex items-center border border-[var(--border)] rounded-lg bg-[var(--card)] px-3 py-2 gap-2">
                <Tag size={14} className="text-[var(--muted)]" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder="Ketik tag lalu tekan Enter..."
                  className="flex-1 text-sm outline-none bg-transparent"
                />
              </div>
              <button type="button" onClick={() => { addTag(tagInput); setTagInput('') }}
                className="px-3 py-2 text-sm bg-violet-50 text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-100">
                Tambah
              </button>
            </div>

            {/* Suggested tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_TAGS.filter(t => !form.tags.includes(t)).map(t => (
                <button type="button" key={t} onClick={() => addTag(t)}
                  className="text-xs px-2.5 py-1 border border-[var(--border)] rounded-full text-[var(--muted)] hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50">
                  + {t}
                </button>
              ))}
            </div>

            {/* Active tags */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-violet-100 text-violet-700 border border-violet-200 rounded-full">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* â”€â”€ Submit â”€â”€ */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Mengupload...</>
                : <><Upload size={15} /> Upload Prompt</>
              }
            </button>
            <button
              type="button"
              onClick={() => { setForm(INITIAL_FORM); clearImage() }}
              className="px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)]"
            >
              Reset
            </button>
          </div>
        </form>
      </main>

      {/* Global styles via style tag (Next.js tanpa CSS modules) */}
      <style jsx global>{`
        .input {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--card);
          color: var(--fg);
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .input::placeholder { color: var(--muted); }
      `}</style>
    </div>
  )
}

// â”€â”€â”€ Helper: Field wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Field({ label, children, required, hint }: {
  label: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--fg)] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="ml-1.5 text-xs font-normal text-[var(--muted)]">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

