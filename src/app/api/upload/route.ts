// src/app/api/upload/route.ts
// Menggunakan service_role key agar bisa bypass RLS untuk admin insert

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role key HANYA dipakai di server-side (API route)
// JANGAN expose ke client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // ── 1. Ambil file gambar ─────────────────────────────────
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Image file required' }, { status: 400 })
    }

    // ── 2. Upload gambar ke Supabase Storage ─────────────────
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: storageError } = await supabaseAdmin.storage
      .from('prompt-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (storageError) throw storageError

    // Dapatkan public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('prompt-images')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl

    // ── 3. Parse field lainnya ───────────────────────────────
    const tagsRaw = formData.get('tags') as string
    const tags = tagsRaw
      ? tagsRaw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : []

    const payload = {
      title:           formData.get('title') as string,
      image_url:       imageUrl,
      prompt:          formData.get('prompt') as string,
      negative_prompt: (formData.get('negative_prompt') as string) || null,
      model:           formData.get('model') as string,
      steps:           formData.get('steps') ? Number(formData.get('steps')) : null,
      cfg:             formData.get('cfg')   ? Number(formData.get('cfg'))   : null,
      sampler:         (formData.get('sampler') as string) || null,
      resolution:      (formData.get('resolution') as string) || null,
      tags,
    }

    // Validasi minimal
    if (!payload.title || !payload.prompt || !payload.model) {
      return NextResponse.json(
        { error: 'title, prompt, dan model wajib diisi' },
        { status: 400 }
      )
    }

    // ── 4. Insert ke database ─────────────────────────────────
    const { data, error: dbError } = await supabaseAdmin
      .from('images')
      .insert(payload)
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[upload]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
