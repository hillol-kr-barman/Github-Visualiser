import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { signInWithGitHub, signOut } from './features/auth/authService'
import { isSupabaseConfigured, supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session)
        setIsLoadingSession(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoadingSession(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const userLabel =
    session?.user.email ?? session?.user.user_metadata.user_name ?? session?.user.id

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Portfolio project</p>
        <h1>Git Visualiser</h1>
        <p>Connect GitHub, choose a repository, and visualise its workflow.</p>
      </section>

      <section className="panel" aria-labelledby="backend-status-heading">
        <h2 id="backend-status-heading">Backend status</h2>
        <p>Health check wiring will appear here after the API connection is added.</p>
      </section>

      <section className="panel" aria-labelledby="github-sign-in-heading">
        <h2 id="github-sign-in-heading">GitHub sign-in</h2>
        {!isSupabaseConfigured ? (
          <p className="notice">
            Add Supabase values to <code>frontend/.env</code> to enable GitHub sign-in.
          </p>
        ) : null}

        {isLoadingSession ? <p>Checking session...</p> : null}

        {!isLoadingSession && !session ? (
          <button type="button" onClick={() => void signInWithGitHub()}>
            Sign in with GitHub
          </button>
        ) : null}

        {!isLoadingSession && session ? (
          <div className="auth-state">
            <p>Signed in as {userLabel}</p>
            <button type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default App
