import { apiBaseUrl } from '../../lib/api'
import type { RepositorySummary } from './types'

export async function fetchRepositories(githubToken: string): Promise<RepositorySummary[]> {
  const response = await fetch(`${apiBaseUrl}/github/repositories`, {
    headers: { 'X-GitHub-Token': githubToken },
  })

  if (!response.ok) {
    const fallback = 'Repositories could not be loaded.'
    const data = (await response.json().catch(() => null)) as { detail?: string } | null
    throw new Error(data?.detail ?? fallback)
  }

  const data = (await response.json()) as { repositories: RepositorySummary[] }
  return data.repositories
}
