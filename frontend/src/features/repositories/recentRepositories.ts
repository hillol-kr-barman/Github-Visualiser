import type { RepositorySummary } from './types'

const RECENT_REPOSITORIES_KEY = 'git-visualiser:recent-repositories'
const MAX_RECENT_REPOSITORIES = 5

export function getRecentRepositories(): RepositorySummary[] {
  const raw = window.localStorage.getItem(RECENT_REPOSITORIES_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as RepositorySummary[]
  } catch {
    return []
  }
}

export function saveRecentRepository(repository: RepositorySummary): RepositorySummary[] {
  const next = [
    repository,
    ...getRecentRepositories().filter((item) => item.full_name !== repository.full_name),
  ].slice(0, MAX_RECENT_REPOSITORIES)

  window.localStorage.setItem(RECENT_REPOSITORIES_KEY, JSON.stringify(next))
  return next
}
