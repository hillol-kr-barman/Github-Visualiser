import { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import About from './pages/About'
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react'
import type { Session } from '@supabase/supabase-js'
import '@xyflow/react/dist/style.css'
import {
  isEmbeddedBrowserContext,
  recoverSessionFromAuthRedirect,
  signInWithGitHub,
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
  const [githubToken, setGithubToken] = useState<string>(() => sessionStorage.getItem('gh_token') ?? '')
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

      if (!isMounted) return

      if (recovered.error) setAuthError(recovered.error.message)

      if (recovered.session) {
        setSession(recovered.session)
        if (recovered.session.provider_token) {
          sessionStorage.setItem('gh_token', recovered.session.provider_token)
          setGithubToken(recovered.session.provider_token)
        }
        setIsLoadingSession(false)
        return
      }

      const { data, error } = await supabase.auth.getSession()

      if (isMounted) {
        if (error) setAuthError(error.message)
        setSession(data.session)
        if (data.session?.provider_token) {
          sessionStorage.setItem('gh_token', data.session.provider_token)
          setGithubToken(data.session.provider_token)
        }
        setIsLoadingSession(false)
      }
    }

    void initializeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.provider_token) {
        sessionStorage.setItem('gh_token', nextSession.provider_token)
        setGithubToken(nextSession.provider_token)
      } else if (!nextSession) {
        sessionStorage.removeItem('gh_token')
        setGithubToken('')
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

  async function handleLoadRepositories() {
    setIsLoadingRepositories(true)
    setRepositoryError(null)
    try {
      setRepositories(await fetchRepositories(githubToken))
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
    if (isGraphRefreshInFlight.current || !selectedRepository) return

    isGraphRefreshInFlight.current = true
    setIsLoadingGraph(true)
    setGraphError(null)
    setLastRefreshError(null)
    setSelectedCommit(null)

    try {
      const graph = await fetchRepositoryGraph(selectedRepository.full_name, githubToken)
      const flowGraph = toReactFlowGraph(graph)
      setGraphNodes(flowGraph.nodes)
      setGraphEdges(flowGraph.edges)
      setGraphSync(graph.sync)
      setLastRefreshError(null)
      setHasLoadedGraph(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Repository graph could not be loaded.'
      setGraphError(message)
      setLastRefreshError(message)
    } finally {
      isGraphRefreshInFlight.current = false
      setIsLoadingGraph(false)
    }
  }, [selectedRepository, githubToken])

  useEffect(() => {
    if (!session || !isAutoRefreshEnabled || !selectedRepository || !hasLoadedGraph) return undefined

    const intervalId = window.setInterval(() => {
      void handleLoadGraph()
    }, AUTO_REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
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
    if (error) setAuthError(error.message)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        session={session}
        isLoadingSession={isLoadingSession}
        authError={authError}
        onSignIn={() => void handleSignIn()}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              session={session}
              isSupabaseConfigured={isSupabaseConfigured}
              supabaseConfigurationIssue={supabaseConfigurationIssue}
              repositories={repositories}
              recentRepositories={recentRepositories}
              selectedRepository={selectedRepository}
              isLoadingRepositories={isLoadingRepositories}
              hasLoadedRepositories={hasLoadedRepositories}
              repositoryError={repositoryError}
              graphNodes={graphNodes}
              graphEdges={graphEdges}
              selectedCommit={selectedCommit}
              isLoadingGraph={isLoadingGraph}
              graphError={graphError}
              hasLoadedGraph={hasLoadedGraph}
              graphSync={graphSync}
              lastRefreshError={lastRefreshError}
              isAutoRefreshEnabled={isAutoRefreshEnabled}
              onSignIn={() => void handleSignIn()}
              onLoadRepositories={() => void handleLoadRepositories()}
              onSelectRepository={handleSelectRepository}
              onLoadGraph={() => void handleLoadGraph()}
              onSetAutoRefresh={setIsAutoRefreshEnabled}
              onSelectCommit={setSelectedCommit}
            />
          }
        />
        <Route path="/about" element={<About />} />
      </Routes>

      <Footer />
    </div>
  )
}

interface HomePageProps {
  session: Session | null
  isSupabaseConfigured: boolean
  supabaseConfigurationIssue: string | null
  repositories: RepositorySummary[]
  recentRepositories: RepositorySummary[]
  selectedRepository: RepositorySummary | null
  isLoadingRepositories: boolean
  hasLoadedRepositories: boolean
  repositoryError: string | null
  graphNodes: Node<CommitGraphNode>[]
  graphEdges: Edge[]
  selectedCommit: CommitGraphNode | null
  isLoadingGraph: boolean
  graphError: string | null
  hasLoadedGraph: boolean
  graphSync: GraphSyncMetadata | null
  lastRefreshError: string | null
  isAutoRefreshEnabled: boolean
  onSignIn: () => void
  onLoadRepositories: () => void
  onSelectRepository: (repo: RepositorySummary) => void
  onLoadGraph: () => void
  onSetAutoRefresh: (enabled: boolean) => void
  onSelectCommit: (commit: CommitGraphNode | null) => void
}

function HomePage({
  session,
  isSupabaseConfigured,
  supabaseConfigurationIssue,
  repositories,
  recentRepositories,
  selectedRepository,
  isLoadingRepositories,
  hasLoadedRepositories,
  repositoryError,
  graphNodes,
  graphEdges,
  selectedCommit,
  isLoadingGraph,
  graphError,
  hasLoadedGraph,
  graphSync,
  lastRefreshError,
  isAutoRefreshEnabled,
  onSignIn,
  onLoadRepositories,
  onSelectRepository,
  onLoadGraph,
  onSetAutoRefresh,
  onSelectCommit,
}: HomePageProps) {
  const rfInstance = useRef<ReactFlowInstance<Node<CommitGraphNode>, Edge> | null>(null)

  useEffect(() => {
    if (graphNodes.length > 0) {
      rfInstance.current?.fitView({ padding: 0.15 })
    }
  }, [graphNodes])
  return (
    <main className="mx-auto max-w-225 px-4 sm:px-8 pt-8 sm:pt-12 pb-20 w-full grid gap-10">

      {/* Supabase config warning */}
      {!isSupabaseConfigured || supabaseConfigurationIssue ? (
        <div className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.25)] rounded-lg px-4 py-3">
          <p className="text-danger text-[0.85rem] m-0">
            {!isSupabaseConfigured
              ? 'Supabase env vars are not configured'
              : supabaseConfigurationIssue}
          </p>
        </div>
      ) : null}

      {/* Hero */}
      <section className="grid gap-10 items-center min-[860px]:grid-cols-[1fr_340px]">
        <div>
          <p className="font-mono text-[0.72rem] text-accent uppercase tracking-[0.08em] mb-4">
            Portfolio Project · Hillol Barman
          </p>
          <h1 className="text-[clamp(1.9rem,6vw,3.8rem)] font-bold tracking-[-0.03em] leading-[1.05] mb-4 max-w-none">
            Git<br />
            <span className="text-accent">Visualiser</span>
          </h1>
          <p className="text-[0.95rem] text-muted leading-[1.7] max-w-100 m-0">
            Select a GitHub repository and visualise its commit graph — branches, parents, and
            recent activity at a glance.
          </p>
        </div>

        {/* Mini graph preview */}
        <div
          className="bg-surface border border-border rounded-lg overflow-hidden"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
            <span className="font-mono text-[0.7rem] text-[#6b7685]">repo/main</span>
            <span className="font-mono text-[0.62rem] text-[#6b7685] bg-[rgba(255,255,255,0.05)] border border-border px-1.75 py-0.5 rounded-[3px]">
              read-only
            </span>
          </div>
          {[
            { hash: 'a8f42c1', msg: 'Load graph' },
            { hash: '7b31d9a', msg: 'Branch labels' },
            { hash: '1d09ef4', msg: 'Commit details' },
          ].map((row) => (
            <div
              key={row.hash}
              className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border last:border-0"
            >
              <span className="size-2 rounded-full bg-[rgba(0,212,220,0.5)] shrink-0" />
              <span className="font-mono text-[0.68rem] text-accent shrink-0">{row.hash}</span>
              <span className="text-[0.78rem] text-muted truncate">{row.msg}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3.5 py-[8px] bg-[rgba(0,0,0,0.15)]">
            <span className="font-mono text-[0.65rem] text-[#6b7685]">3 branches</span>
            <span className="font-mono text-[0.65rem] text-[#6b7685]">24 commits</span>
          </div>
        </div>
      </section>

      {/* Sign in to Github*/}

      {session ? null :
        <section>
          <div className="bg-surface border border-border rounded-lg px-6 py-8 flex flex-col items-center gap-4 text-center">
            <h2 className="section-title">Sign in to GitHub to Continue</h2>
            <p className="text-[0.85rem] text-muted m-0">
              Connect your GitHub account to load and visualise your repositories.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="btn flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign in with GitHub
            </button>
          </div>
        </section>
      }

      {/* Repositories */}
      {session ? (
        <section aria-labelledby="repositories-heading">
          <div className="section-header">
            <h2 id="repositories-heading" className="section-title">Repositories</h2>
            <button
              type="button"
              className="btn"
              onClick={onLoadRepositories}
              disabled={isLoadingRepositories}
            >
              {isLoadingRepositories ? 'Loading…' : 'Load repositories'}
            </button>
          </div>

          {repositoryError ? (
            <p className="text-danger text-[0.85rem] font-medium">{repositoryError}</p>
          ) : null}

          {hasLoadedRepositories && !isLoadingRepositories && !repositoryError && repositories.length === 0 ? (
            <p className="text-[#6b7685] text-[0.85rem]">No repositories found for this access token.</p>
          ) : null}

          {/* Selected repo banner */}
          {selectedRepository ? (
            <div className="bg-soft border border-border-strong rounded-[5px] px-3.5 py-2.5 mb-4">
              <p className="text-[0.72rem] text-[#6b7685] uppercase tracking-[0.06em] mb-1">Selected</p>
              <p className="font-mono text-[0.8rem] text-accent m-0">{selectedRepository.full_name}</p>
            </div>
          ) : null}

          {/* Recent repos */}
          {recentRepositories.length > 0 && !hasLoadedRepositories ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {recentRepositories.map((repo) => (
                <button
                  type="button"
                  key={repo.full_name}
                  onClick={() => onSelectRepository(repo)}
                  className={`font-mono text-[0.72rem] px-3 py-1.25 rounded-[5px] border transition-colors cursor-pointer ${selectedRepository?.full_name === repo.full_name
                    ? 'border-accent text-accent bg-[rgba(0,212,220,0.12)]'
                    : 'border-border text-muted bg-surface hover:border-accent hover:text-accent'
                    }`}
                >
                  {repo.full_name}
                </button>
              ))}
            </div>
          ) : null}

          {/* Repo grid */}
          {repositories.length > 0 ? (
            <div className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
              {repositories.map((repo) => {
                const isSelected = selectedRepository?.full_name === repo.full_name
                return (
                  <article
                    key={repo.full_name}
                    className={`bg-surface rounded-lg p-4 grid gap-3 border transition-all hover:-translate-y-px ${isSelected
                      ? 'border-accent'
                      : 'border-border hover:border-[rgba(255,255,255,0.15)]'
                      }`}
                  >
                    <header className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[0.78rem] font-medium text-text wrap-anywhere">
                        {repo.full_name}
                      </span>
                      <span
                        className={`text-[0.62rem] px-1.75 py-0.5 rounded-[3px] border shrink-0 ${repo.visibility === 'public'
                          ? 'bg-[rgba(63,185,80,0.12)] text-[#3fb950] border-[rgba(63,185,80,0.25)]'
                          : 'bg-[rgba(255,255,255,0.05)] text-[#6b7685] border-border'
                          }`}
                      >
                        {repo.visibility}
                      </span>
                    </header>
                    <p className="text-[0.78rem] text-[#6b7685] leading-normal m-0">
                      {repo.description ?? 'No description provided.'}
                    </p>
                    <dl className="grid gap-0.75 m-0 font-mono text-[0.65rem] text-[#6b7685]">
                      <div>
                        <dt className="uppercase tracking-wider inline">Branch: </dt>
                        <dd className="inline m-0">{repo.default_branch}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wider inline">Pushed: </dt>
                        <dd className="inline m-0">{repo.pushed_at ?? '—'}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => onSelectRepository(repo)}
                      className={`w-full text-[0.78rem] px-1.75 py-1.75 rounded-[5px] border transition-colors cursor-pointer ${isSelected
                        ? 'border-accent text-accent bg-[rgba(0,212,220,0.12)]'
                        : 'border-border text-muted bg-transparent hover:border-accent hover:text-accent'
                        }`}
                    >
                      {isSelected ? '✓ Selected' : 'Select repository'}
                    </button>
                  </article>
                )
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Repository graph */}
      {session ? (
        <section aria-labelledby="repository-graph-heading">
          <div className="section-header">
            <h2 id="repository-graph-heading" className="section-title">Repository Graph</h2>
            <button
              type="button"
              className="btn"
              onClick={onLoadGraph}
              disabled={!selectedRepository || isLoadingGraph}
            >
              {hasLoadedGraph ? 'Refresh graph' : 'Load graph'}
            </button>
          </div>

          {/* Stat pills + auto-refresh */}
          {(graphSync || hasLoadedGraph) ? (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {graphSync ? (
                <>
                  <span className="font-mono text-[0.72rem] text-[#6b7685] bg-surface border border-border px-2.5 py-1.25 rounded-[5px]">
                    Last refreshed {new Date(graphSync.fetched_at).toLocaleString()}
                  </span>
                  {graphSync.rate_limit_remaining !== null && graphSync.rate_limit_remaining !== undefined ? (
                    <span className="font-mono text-[0.72rem] text-[#6b7685] bg-surface border border-border px-2.5 py-1.25 rounded-[5px]">
                      GitHub requests remaining: {graphSync.rate_limit_remaining}
                    </span>
                  ) : null}
                </>
              ) : null}
              <label className="flex items-center gap-1.5 font-mono text-[0.72rem] text-[#6b7685] bg-surface border border-border px-2.5 py-1.25 rounded-[5px] cursor-pointer hover:border-[rgba(255,255,255,0.15)] transition-colors">
                <input
                  type="checkbox"
                  className="accent-accent size-3.25"
                  checked={isAutoRefreshEnabled}
                  disabled={!hasLoadedGraph}
                  onChange={(e) => onSetAutoRefresh(e.target.checked)}
                />
                <span className="text-muted text-[0.78rem]">Auto-refresh</span>
              </label>
              {lastRefreshError ? (
                <span className="text-danger text-[0.78rem] font-medium">
                  Refresh failed: {lastRefreshError}
                </span>
              ) : null}
            </div>
          ) : null}

          {isLoadingGraph ? (
            <p className="text-[#6b7685] text-[0.85rem]">Loading graph…</p>
          ) : null}
          {graphError ? (
            <p className="text-danger text-[0.85rem] font-medium">{graphError}</p>
          ) : null}

          {/* Graph canvas */}
          <div className="bg-surface border border-border rounded-lg min-h-90 h-136 max-[720px]:h-112 overflow-hidden relative">
            {!selectedRepository && !isLoadingGraph ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-8">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(107,118,133,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="5" cy="5" r="2" />
                  <circle cx="19" cy="5" r="2" />
                  <circle cx="5" cy="19" r="2" />
                  <line x1="7" y1="7" x2="10" y2="10" />
                  <line x1="17" y1="7" x2="14" y2="10" />
                  <line x1="7" y1="17" x2="10" y2="14" />
                </svg>
                <p className="text-[#6b7685] text-[0.85rem] m-0">Select a repository to load its graph</p>
              </div>
            ) : null}

            {selectedRepository && !hasLoadedGraph && !isLoadingGraph ? (
              <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                <p className="text-[#6b7685] text-[0.85rem] m-0">
                  Press 'Load graph' to visualise{' '}
                  <span className="font-mono text-accent">{selectedRepository.full_name}</span>
                </p>
              </div>
            ) : null}

            {hasLoadedGraph && !isLoadingGraph && graphNodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[#6b7685] text-[0.85rem] m-0">No graph data returned for this repository.</p>
              </div>
            ) : null}

            {graphNodes.length > 0 ? (
              <ReactFlow
                nodes={graphNodes}
                edges={graphEdges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                onInit={(instance) => { rfInstance.current = instance }}
                onNodeClick={(_, node: Node<CommitGraphNode>) => onSelectCommit(node.data)}
              >
                <Background />
                <Controls />
              </ReactFlow>
            ) : null}
          </div>

          {/* Commit details */}
          <div className="mt-4">
            <div className="section-header">
              <h3 className="section-title">Commit Details</h3>
              {selectedCommit ? (
                <span className="font-mono text-[0.72rem] text-accent">{selectedCommit.sha.slice(0, 7)}</span>
              ) : null}
            </div>

            {!selectedCommit ? (
              <p className="text-[#6b7685] text-[0.85rem]">
                Click a commit node in the graph above to inspect it.
              </p>
            ) : (
              <div className="grid gap-2.5 grid-cols-[repeat(2,1fr)] max-[600px]:grid-cols-1">
                {[
                  {
                    label: 'Commit',
                    content: (
                      <>
                        <p className="font-mono text-[0.78rem] text-muted leading-normal m-0 wrap-anywhere">
                          {selectedCommit.sha}
                        </p>
                        <p className="text-[0.78rem] text-muted leading-normal mt-1 mb-0 wrap-anywhere">
                          {selectedCommit.message}
                        </p>
                      </>
                    ),
                  },
                  {
                    label: 'Author',
                    content: (
                      <>
                        <p className="font-mono text-[0.78rem] text-muted leading-normal m-0">
                          {selectedCommit.author_name || selectedCommit.author_login || 'Unknown'}
                        </p>
                        <p className="font-mono text-[0.78rem] text-[#6b7685] leading-normal mt-1 mb-0">
                          {selectedCommit.authored_at ?? '—'}
                        </p>
                      </>
                    ),
                  },
                  {
                    label: 'Parents',
                    content: (
                      <p className="font-mono text-[0.78rem] text-muted leading-normal m-0 wrap-anywhere">
                        {selectedCommit.parents.length > 0
                          ? selectedCommit.parents.join(', ')
                          : <em className="text-[#6b7685]">No fetched parents</em>}
                      </p>
                    ),
                  },
                  {
                    label: 'Branches',
                    content: selectedCommit.branch_labels.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedCommit.branch_labels.map((b) => (
                          <span key={b} className="badge">{b}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-[0.78rem] text-[#6b7685] italic m-0">No branch labels</p>
                    ),
                  },
                  {
                    label: 'Pull Requests',
                    content: selectedCommit.pull_requests.length > 0 ? (
                      <ul className="grid gap-1 list-none m-0 p-0">
                        {selectedCommit.pull_requests.map((pr) => (
                          <li key={pr.number} className="min-w-0 wrap-anywhere">
                            <a href={pr.html_url} target="_blank" rel="noreferrer" className="font-mono text-[0.78rem]">
                              #{pr.number} {pr.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-mono text-[0.78rem] text-[#6b7685] italic m-0">No pull request context</p>
                    ),
                  },
                  {
                    label: 'GitHub',
                    content: (
                      <a
                        href={selectedCommit.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[0.78rem] text-accent"
                      >
                        Open commit on GitHub ↗
                      </a>
                    ),
                  },
                ].map(({ label, content }) => (
                  <div
                    key={label}
                    className="bg-surface border border-border rounded-[5px] p-3.5"
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[#6b7685] mb-1.5">
                      {label}
                    </p>
                    {content}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default App
