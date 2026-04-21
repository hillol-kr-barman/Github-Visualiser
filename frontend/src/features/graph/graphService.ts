import { apiBaseUrl } from '../../lib/api'
import type { CommitGraph } from './types'

export async function fetchRepositoryGraph(fullName: string, githubToken: string): Promise<CommitGraph> {
  const [owner, repo] = fullName.split('/')
  const response = await fetch(`${apiBaseUrl}/github/repositories/${owner}/${repo}/graph`, {
    headers: { 'X-GitHub-Token': githubToken },
  })

  if (!response.ok) {
    const fallback = 'Repository graph could not be loaded.'
    const data = (await response.json().catch(() => null)) as { detail?: string } | null
    throw new Error(data?.detail ?? fallback)
  }

  return (await response.json()) as CommitGraph
}
