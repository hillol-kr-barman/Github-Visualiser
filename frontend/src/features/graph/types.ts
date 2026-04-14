export type GraphRepository = {
  owner: string
  name: string
  full_name: string
}

export type CommitGraphNode = Record<string, unknown> & {
  sha: string
  short_sha: string
  message: string
  author_name: string
  author_login: string
  authored_at: string | null
  html_url: string
  parents: string[]
  branch_labels: string[]
  pull_requests: { number: number; title: string; html_url: string }[]
}

export type CommitGraphEdge = {
  id: string
  source: string
  target: string
}

export type CommitGraph = {
  repository: GraphRepository
  nodes: CommitGraphNode[]
  edges: CommitGraphEdge[]
}
