import { supabase } from '../../lib/supabase'

export async function signInWithGitHub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
      // Keep identity scopes minimal; private repository read access should use GitHub App permissions in later phases.
      scopes: 'read:user user:email',
    },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}
