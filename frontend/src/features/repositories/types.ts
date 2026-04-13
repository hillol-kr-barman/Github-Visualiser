export type RepositorySummary = {
  id: number | null
  name: string
  full_name: string
  owner: string
  html_url: string
  private: boolean
  visibility: string
  default_branch: string
  description: string | null
  pushed_at: string | null
  updated_at: string | null
}
