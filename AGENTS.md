<!-- GSD:project-start source:PROJECT.md -->
## Project

**Git Visualiser**

Git Visualiser is a standalone web app that lets a user sign in with GitHub, select a repository they can access, and visualise that repository's Git workflow. The first version focuses on a clear repository graph and workflow view rather than trying to recreate GitKraken's full feature set.

The project is primarily a portfolio-quality product: it should be polished enough to link from the user's portfolio and useful enough to demonstrate practical frontend, backend, GitHub API, authentication, and data visualisation skills.

**Core Value:** A user can connect a GitHub repository and quickly understand its branch, commit, and workflow activity through a clear visual graph.

### Constraints

- **Scope**: Start with a focused GitHub repository visualiser, not a full GitKraken clone - this keeps the first portfolio project achievable.
- **Deployment**: Build local-first, then deploy after v1 works - avoids premature hosting/domain complexity.
- **Domain**: Do not require buying a new domain - the app can be deployed separately and linked from the existing portfolio later.
- **Hosting**: Existing familiarity includes Vercel for frontend and Railway for backend - prefer these if they remain suitable.
- **Stack**: Prefer React, FastAPI, and Supabase where appropriate - reuse known tools unless research shows a better fit for GitHub OAuth or graph visualisation.
- **Data storage**: Store lightweight user project/history data, not complete repository mirrors - keeps storage and privacy risk manageable.
- **Repository access**: Support both public and private repositories when GitHub permissions allow - requires careful GitHub OAuth scope design.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommendation
- **Frontend**: React + Vite + TypeScript.
- **Graph UI**: React Flow for interactive graph rendering, with a simple custom layout layer first.
- **Backend**: FastAPI for GitHub API orchestration, token-safe refresh, cache control, and repo data shaping.
- **Auth/data**: Supabase for user auth/session persistence and lightweight saved repository history, unless GitHub App/OAuth token handling requires moving more responsibility into FastAPI.
- **Database**: Supabase Postgres for saved user repositories, refresh preferences, cached graph snapshots, and sync metadata.
- **Deployment**: local-first; later Vercel for frontend and Railway for FastAPI if those remain enough.
## GitHub Integration
- Use GitHub login.
- Request only the permissions needed to list repositories and read branch/commit/pull request data.
- Do not implement write operations against repositories in v1.
- Treat private repository support as permission-gated and user-consented.
- Authenticated user's repositories.
- Repository branches.
- Repository commits.
- Pull requests for workflow context.
- Rate limit handling and error states.
## Graph Visualisation
- Commit nodes with SHA, message summary, author, timestamp, branch labels.
- Edges for parent-child commit relationships.
- Branch labels attached to latest relevant commit nodes.
- Optional PR annotations after the base graph works.
## What Not To Use First
- Do not build a desktop Git client in v1.
- Do not clone full repositories to the backend unless GitHub API data proves insufficient.
- Do not add real-time collaboration or WebSockets until manual refresh and polling are working.
- Do not build custom graph layout from scratch before validating React Flow is insufficient.
## Sources Checked
- GitHub Docs: OAuth apps and token scopes, REST API repositories/branches/commits/pulls.
- GitHub Docs: GitHub Apps and fine-grained repository permissions.
- React Flow official documentation.
- Supabase Auth GitHub provider documentation.
- Vercel official Vite/React deployment documentation.
- Railway official Python/FastAPI deployment documentation.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
