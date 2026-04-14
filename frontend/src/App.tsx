import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  isEmbeddedBrowserContext,
  signInWithGitHub,
  signOut,
} from './features/auth/authService'
import { fetchRepositories } from './features/repositories/repositoryService'
import {
  getRecentRepositories,
  saveRecentRepository,
} from './features/repositories/recentRepositories'
import type { RepositorySummary } from './features/repositories/types'
import { isSupabaseConfigured, supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [repositories, setRepositories] = useState<RepositorySummary[]>([])
  const [recentRepositories, setRecentRepositories] = useState<RepositorySummary[]>([])
  const [selectedRepository, setSelectedRepository] = useState<RepositorySummary | null>(null)
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false)
  const [hasLoadedRepositories, setHasLoadedRepositories] = useState(false)
  const [repositoryError, setRepositoryError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (isMounted) {
        if (error) {
          setAuthError(error.message)
        }
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

  useEffect(() => {
    setRecentRepositories(getRecentRepositories())
  }, [])

  useEffect(() => {
    if (session && window.location.hash.includes('access_token=')) {
      window.history.replaceState(null, document.title, window.location.pathname)
    }
  }, [session])

  const userLabel =
    session?.user.email ?? session?.user.user_metadata.user_name ?? session?.user.id

  async function handleLoadRepositories() {
    setIsLoadingRepositories(true)
    setRepositoryError(null)

    try {
      setRepositories(await fetchRepositories())
      setHasLoadedRepositories(true)
    } catch (error) {
      setRepositoryError(
        error instanceof Error ? error.message : 'Repositories could not be loaded.',
      )
    } finally {
      setIsLoadingRepositories(false)
    }
  }

  function handleSelectRepository(repository: RepositorySummary) {
    setSelectedRepository(repository)
    setRecentRepositories(saveRecentRepository(repository))
  }

  async function handleSignIn() {
    setAuthError(null)

    if (isEmbeddedBrowserContext()) {
      setAuthError('Open http://localhost:5173 in a normal browser tab before signing in.')
      return
    }

    const { error } = await signInWithGitHub()

    if (error) {
      setAuthError(error.message)
    }
  }

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
          <button type="button" onClick={() => void handleSignIn()}>
            Sign in with GitHub
          </button>
        ) : null}
        {authError ? <p className="error-message">{authError}</p> : null}

        {!isLoadingSession && session ? (
          <div className="auth-state">
            <p>Signed in as {userLabel}</p>
            <button type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        ) : null}
      </section>

      {session ? (
        <section className="panel" aria-labelledby="repositories-heading">
          <div className="repo-actions">
            <div>
              <h2 id="repositories-heading">Repositories</h2>
              <p>
                Load repositories available to the configured read-only backend token. This
                is separate from GitHub sign-in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadRepositories()}
              disabled={isLoadingRepositories}
            >
              Load repositories
            </button>
          </div>

          {isLoadingRepositories ? <p>Loading repositories...</p> : null}
          {repositoryError ? <p className="error-message">{repositoryError}</p> : null}

          {hasLoadedRepositories &&
          !isLoadingRepositories &&
          !repositoryError &&
          repositories.length === 0 ? (
            <p>No repositories found for this access token.</p>
          ) : null}

          {selectedRepository ? (
            <section className="selected-repository" aria-label="Selected repository">
              <h3>Selected repository</h3>
              <p>{selectedRepository.full_name}</p>
            </section>
          ) : null}

          {repositories.length > 0 ? (
            <div className="repo-grid">
              {repositories.map((repo) => (
                <article className="repo-card" key={repo.full_name}>
                  <header>
                    <div>
                      <h3>{repo.full_name}</h3>
                      <p>{repo.description ?? 'No description provided.'}</p>
                    </div>
                    <span>{repo.visibility}</span>
                  </header>
                  <dl className="repo-meta">
                    <div>
                      <dt>Default branch</dt>
                      <dd>{repo.default_branch}</dd>
                    </div>
                    <div>
                      <dt>Last pushed</dt>
                      <dd>{repo.pushed_at ?? 'No push date'}</dd>
                    </div>
                  </dl>
                  <button type="button" onClick={() => handleSelectRepository(repo)}>
                    Select repository
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {recentRepositories.length > 0 ? (
            <section aria-labelledby="recent-repositories-heading">
              <h3 id="recent-repositories-heading">Recent repositories</h3>
              <div className="recent-list">
                {recentRepositories.map((repo) => (
                  <button
                    type="button"
                    key={repo.full_name}
                    onClick={() => handleSelectRepository(repo)}
                  >
                    {repo.full_name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}

export default App
