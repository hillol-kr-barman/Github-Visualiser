import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function getProjectRefFromUrl(url: string) {
  try {
    return new URL(url).hostname.split('.')[0]
  } catch {
    return null
  }
}

function getProjectRefFromAnonKey(anonKey: string) {
  try {
    const encodedPayload = anonKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(encodedPayload)) as { ref?: string }
    return payload.ref ?? null
  } catch {
    return null
  }
}

export function getSupabaseConfigurationIssue() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Add Supabase values to frontend/.env to enable GitHub sign-in.'
  }

  const urlProjectRef = getProjectRefFromUrl(supabaseUrl)
  const keyProjectRef = getProjectRefFromAnonKey(supabaseAnonKey)

  if (urlProjectRef && keyProjectRef && urlProjectRef !== keyProjectRef) {
    return `Supabase URL and anon key are from different projects (${urlProjectRef} vs ${keyProjectRef}).`
  }

  return null
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'local-placeholder-anon-key',
)
