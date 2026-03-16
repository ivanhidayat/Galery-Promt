// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types ──────────────────────────────────────────────────────────────────

export type PromptEntry = {
  id: string
  title: string
  image_url: string
  prompt: string
  negative_prompt: string | null
  model: string
  steps: number | null
  cfg: number | null
  sampler: string | null
  resolution: string | null
  tags: string[]
  created_at: string
}

export type PromptInsert = Omit<PromptEntry, 'id' | 'created_at'>
