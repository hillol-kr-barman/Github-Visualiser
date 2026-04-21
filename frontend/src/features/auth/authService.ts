import { supabase } from '../../lib/supabase'

function clearAuthRedirectHash() {
  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}`,
  )
}

function readAuthRedirectHash() {
  const hash = window.location.hash.replace(/^#/, '')

  if (!hash) {
    return null
  }

  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const errorDescription = params.get('error_description') ?? params.get('error')

  return { accessToken, refreshToken, errorDescription }
}

export function isEmbeddedBrowserContext() {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

export async function signInWithGitHub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
      // Keep identity scopes minimal; private repository read access should use GitHub App permissions in later phases.
      scopes: 'read:user user:email repo',
    },
  })
}

export async function recoverSessionFromAuthRedirect() {
  const redirect = readAuthRedirectHash()

  if (!redirect) {
    return { session: null, error: null }
  }

  if (redirect.errorDescription) {
    clearAuthRedirectHash()
    return { session: null, error: new Error(redirect.errorDescription) }
  }

  if (!redirect.accessToken || !redirect.refreshToken) {
    return { session: null, error: null }
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: redirect.accessToken,
    refresh_token: redirect.refreshToken,
  })

  clearAuthRedirectHash()
  return { session: data.session, error }
}

export async function signOut() {
  return supabase.auth.signOut()
}
