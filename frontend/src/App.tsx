import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'
import type { Session } from '@supabase/supabase-js'
import '@xyflow/react/dist/style.css'
import {
  isEmbeddedBrowserContext,
  recoverSessionFromAuthRedirect,
  signInWithGitHub,
  signOut,
} from './features/auth/authService'
import CommitNode from './features/graph/CommitNode'
import { fetchRepositoryGraph } from './features/graph/graphService'
import { toReactFlowGraph } from './features/graph/graphLayout'
import type { CommitGraphNode, GraphSyncMetadata } from './features/graph/types'
import { fetchRepositories } from './features/repositories/repositoryService'
import {
  getRecentRepositories,
  saveRecentRepository,
} from './features/repositories/recentRepositories'
import type { RepositorySummary } from './features/repositories/types'
import {
  getSupabaseConfigurationIssue,
  isSupabaseConfigured,
  supabase,
} from './lib/supabase'

const nodeTypes: NodeTypes = { commit: CommitNode }
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000

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
  const [graphNodes, setGraphNodes] = useState<Node<CommitGraphNode>[]>([])
  const [graphEdges, setGraphEdges] = useState<Edge[]>([])
  const [selectedCommit, setSelectedCommit] = useState<CommitGraphNode | null>(null)
  const [isLoadingGraph, setIsLoadingGraph] = useState(false)
  const [graphError, setGraphError] = useState<string | null>(null)
  const [hasLoadedGraph, setHasLoadedGraph] = useState(false)
  const [graphSync, setGraphSync] = useState<GraphSyncMetadata | null>(null)
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null)
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false)
  const isGraphRefreshInFlight = useRef(false)
  const supabaseConfigurationIssue = getSupabaseConfigurationIssue()

  useEffect(() => {
    let isMounted = true

    async function initializeSession() {
      if (supabaseConfigurationIssue) {
        setIsLoadingSession(false)
        return
      }

      const recovered = await recoverSessionFromAuthRedirect()

      if (!isMounted) {
        return
      }

      if (recovered.error) {
        setAuthError(recovered.error.message)
      }

      if (recovered.session) {
        setSession(recovered.session)
        setIsLoadingSession(false)
        return
      }

      const { data, error } = await supabase.auth.getSession()

      if (isMounted) {
        if (error) {
          setAuthError(error.message)
        }
        setSession(data.session)
        setIsLoadingSession(false)
      }
    }

    void initializeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setIsAutoRefreshEnabled(false)
      }
      setIsLoadingSession(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabaseConfigurationIssue])

  useEffect(() => {
    setRecentRepositories(getRecentRepositories())
  }, [])

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
    setGraphNodes([])
    setGraphEdges([])
    setSelectedCommit(null)
    setGraphError(null)
    setGraphSync(null)
    setLastRefreshError(null)
    setIsAutoRefreshEnabled(false)
    setHasLoadedGraph(false)
  }

  const handleLoadGraph = useCallback(async () => {
    if (isGraphRefreshInFlight.current) {
      return
    }

    if (!selectedRepository) {
      return
    }

    isGraphRefreshInFlight.current = true
    setIsLoadingGraph(true)
    setGraphError(null)
    setLastRefreshError(null)
    setSelectedCommit(null)

    try {
      const graph = await fetchRepositoryGraph(selectedRepository.full_name)
      const flowGraph = toReactFlowGraph(graph)
      setGraphNodes(flowGraph.nodes)
      setGraphEdges(flowGraph.edges)
      setGraphSync(graph.sync)
      setLastRefreshError(null)
      setHasLoadedGraph(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Repository graph could not be loaded.'
      setGraphError(message)
      setLastRefreshError(error instanceof Error ? error.message : 'Repository graph could not be loaded.')
    } finally {
      isGraphRefreshInFlight.current = false
      setIsLoadingGraph(false)
    }
  }, [selectedRepository])

  useEffect(() => {
    if (!session || !isAutoRefreshEnabled || !selectedRepository || !hasLoadedGraph) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      void handleLoadGraph()
    }, AUTO_REFRESH_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [handleLoadGraph, hasLoadedGraph, isAutoRefreshEnabled, selectedRepository, session])

  async function handleSignIn() {
    setAuthError(null)

    if (isEmbeddedBrowserContext()) {
      setAuthError('Open http://localhost:5173 in a normal browser tab before signing in.')
      return
    }

    if (supabaseConfigurationIssue) {
      setAuthError(supabaseConfigurationIssue)
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
        <div className="hero-copy">
          <p className="eyebrow">Portfolio project</p>
          <h1>Git Visualiser</h1>
          <p>Connect GitHub, choose a repository, and visualise its workflow.</p>
          <p>Read-only GitHub repository visualisation focused on recent commit activity.</p>
        </div>
        <div className="hero-graph-card" aria-hidden="true">
          <div className="hero-graph-card__bar">
            <span>repo/main</span>
            <span>read-only</span>
          </div>
          <div className="hero-graph">
            <div className="hero-commit hero-commit--active">
              <span className="hero-commit__dot" />
              <span className="hero-commit__sha">a8f42c1</span>
              <span className="hero-commit__message">Load graph</span>
            </div>
            <div className="hero-commit">
              <span className="hero-commit__dot" />
              <span className="hero-commit__sha">7b31d9a</span>
              <span className="hero-commit__message">Branch labels</span>
            </div>
            <div className="hero-commit">
              <span className="hero-commit__dot" />
              <span className="hero-commit__sha">1d09ef4</span>
              <span className="hero-commit__message">Commit details</span>
            </div>
          </div>
          <div className="hero-graph-card__footer">
            <span>3 branches</span>
            <span>24 commits</span>
          </div>
        </div>
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
        {isSupabaseConfigured && supabaseConfigurationIssue ? (
          <p className="notice">{supabaseConfigurationIssue}</p>
        ) : null}

        {isLoadingSession ? <p>Checking session...</p> : null}

        {!isLoadingSession && !session ? (
          <button
            type="button"
            onClick={() => void handleSignIn()}
            disabled={Boolean(supabaseConfigurationIssue)}
          >
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

      {session ? (
        <section className="panel" aria-labelledby="repository-graph-heading">
          <div className="repo-actions">
            <div>
              <h2 id="repository-graph-heading">Repository graph</h2>
              <p className="graph-copy">
                This graph shows recent commits as nodes and parent relationships as arrows.
                Branch labels appear on the latest commit returned for each branch.
              </p>
              <p className="graph-copy">
                The v1 graph focuses on recent commits and keeps repository access read-only.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadGraph()}
              disabled={!selectedRepository || isLoadingGraph}
            >
              {hasLoadedGraph ? 'Refresh graph' : 'Load graph'}
            </button>
          </div>

          {!selectedRepository ? <p>Select a repository to load its graph.</p> : null}
          {isLoadingGraph ? <p>Refreshing graph...</p> : null}
          {graphError ? <p className="error-message">{graphError}</p> : null}

          {selectedRepository ? (
            <div className="graph-layout">
              <div className="refresh-status">
                {graphSync ? (
                  <p>Last refreshed {new Date(graphSync.fetched_at).toLocaleString()}</p>
                ) : null}
                {graphSync?.rate_limit_remaining !== null &&
                graphSync?.rate_limit_remaining !== undefined ? (
                  <p>GitHub requests remaining: {graphSync.rate_limit_remaining}</p>
                ) : null}
                {lastRefreshError ? (
                  <p className="error-message">Refresh failed: {lastRefreshError}</p>
                ) : null}
              </div>

              <div className="refresh-controls">
                <label className="auto-refresh-toggle">
                  <input
                    type="checkbox"
                    checked={isAutoRefreshEnabled}
                    disabled={!hasLoadedGraph}
                    onChange={(event) => setIsAutoRefreshEnabled(event.target.checked)}
                  />
                  <span>Auto-refresh</span>
                </label>
                <p>
                  {isAutoRefreshEnabled ? 'Auto-refresh is on.' : 'Auto-refresh is off.'}{' '}
                  Every 5 minutes.
                </p>
              </div>

              <div className="graph-shell">
                {hasLoadedGraph && !isLoadingGraph && graphNodes.length === 0 ? (
                  <p>No graph data returned for this repository.</p>
                ) : null}

                {graphNodes.length > 0 ? (
                  <ReactFlow
                    nodes={graphNodes}
                    edges={graphEdges}
                    nodeTypes={nodeTypes}
                    fitView
                    onNodeClick={(_, node: Node<CommitGraphNode>) => setSelectedCommit(node.data)}
                  >
                    <Background />
                    <Controls />
                  </ReactFlow>
                ) : null}
              </div>

              <aside className="commit-details" aria-label="Commit details">
                <h3>Commit details</h3>
                {!selectedCommit ? <p>Select a commit node to see details.</p> : null}

                {selectedCommit ? (
                  <div className="detail-grid">
                    <div>
                      <h4>Commit</h4>
                      <p>{selectedCommit.message}</p>
                      <p>{selectedCommit.sha}</p>
                    </div>
                    <div>
                      <h4>Author</h4>
                      <p>
                        {selectedCommit.author_name ||
                          selectedCommit.author_login ||
                          'Unknown author'}
                      </p>
                      <p>{selectedCommit.authored_at ?? 'Unknown date'}</p>
                    </div>
                    <div>
                      <h4>Parents</h4>
                      <p>{selectedCommit.parents.length}</p>
                      <p>
                        {selectedCommit.parents.length > 0
                          ? selectedCommit.parents.join(', ')
                          : 'No fetched parents.'}
                      </p>
                    </div>
                    <div>
                      <h4>Branches</h4>
                      {selectedCommit.branch_labels.length > 0 ? (
                        <div className="branch-labels">
                          {selectedCommit.branch_labels.map((branch) => (
                            <span className="branch-label" key={branch}>
                              {branch}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p>No branch labels in fetched window.</p>
                      )}
                    </div>
                    <div>
                      <h4>Pull requests</h4>
                      {selectedCommit.pull_requests.length > 0 ? (
                        <ul>
                          {selectedCommit.pull_requests.map((pullRequest) => (
                            <li key={pullRequest.number}>
                              <a
                                href={pullRequest.html_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                #{pullRequest.number} {pullRequest.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No pull request context available.</p>
                      )}
                    </div>
                    <div>
                      <h4>GitHub</h4>
                      <a href={selectedCommit.html_url} target="_blank" rel="noreferrer">
                        Open commit on GitHub
                      </a>
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}

export default App
