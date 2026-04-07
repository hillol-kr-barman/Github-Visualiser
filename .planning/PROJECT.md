# Git Visualiser

## What This Is

Git Visualiser is a standalone web app that lets a user sign in with GitHub, select a repository they can access, and visualise that repository's Git workflow. The first version focuses on a clear repository graph and workflow view rather than trying to recreate GitKraken's full feature set.

The project is primarily a portfolio-quality product: it should be polished enough to link from the user's portfolio and useful enough to demonstrate practical frontend, backend, GitHub API, authentication, and data visualisation skills.

## Core Value

A user can connect a GitHub repository and quickly understand its branch, commit, and workflow activity through a clear visual graph.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] User can sign in with GitHub.
- [ ] User can select a GitHub repository they have permission to access.
- [ ] User can visualise the selected repository's Git workflow, starting with commits, branches, and relevant relationships.
- [ ] User can manually refresh repository data to fetch new changes.
- [ ] User can enable an auto-refresh option to keep the visualisation updated.
- [ ] User can return to previously selected repositories or project history without needing to start from scratch.
- [ ] The app is developed local-first and deployed only after the v1 flow works reliably.
- [ ] The project remains a standalone app that can be linked from the portfolio website, rather than being embedded into the existing portfolio project.

### Out of Scope

- Full GitKraken replacement - v1 should not attempt advanced Git client operations, deep repo management, or every GitKraken feature.
- Buying a new domain - deployment should work without requiring a new domain purchase.
- Embedding into the existing portfolio website - the portfolio should link to this project instead of carrying its frontend/backend load.
- Full repository mirroring - store lightweight metadata/history only unless a later phase proves deeper storage is necessary.
- Local Git write operations - v1 is about visualising GitHub repository state, not changing the repository.

## Context

The user recently completed a resume project using React, Supabase, and FastAPI. Reusing those technologies is preferred where they fit, but the project can introduce new libraries or services if they are directly useful for GitHub authentication, API integration, graph layout, or visualisation.

The intended user flow is:

1. User opens the standalone Git Visualiser app.
2. User logs in with GitHub.
3. User selects a public or private repository they have permission to access.
4. The app fetches repository data from GitHub.
5. The app visualises the repository's workflow/graph.
6. User can refresh manually to fetch new changes.
7. User can optionally enable auto-refresh to update the graph over time.

The app is a portfolio showcase for recruiters first. That means the v1 should be understandable, reliable, and visually strong, with a focused scope that demonstrates the user's ability to build a real application without becoming overwhelming.

## Constraints

- **Scope**: Start with a focused GitHub repository visualiser, not a full GitKraken clone - this keeps the first portfolio project achievable.
- **Deployment**: Build local-first, then deploy after v1 works - avoids premature hosting/domain complexity.
- **Domain**: Do not require buying a new domain - the app can be deployed separately and linked from the existing portfolio later.
- **Hosting**: Existing familiarity includes Vercel for frontend and Railway for backend - prefer these if they remain suitable.
- **Stack**: Prefer React, FastAPI, and Supabase where appropriate - reuse known tools unless research shows a better fit for GitHub OAuth or graph visualisation.
- **Data storage**: Store lightweight user project/history data, not complete repository mirrors - keeps storage and privacy risk manageable.
- **Repository access**: Support both public and private repositories when GitHub permissions allow - requires careful GitHub OAuth scope design.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build a standalone app instead of adding a route to the portfolio site | Keeps this project independent and avoids making the existing portfolio heavier | - Pending |
| Focus v1 on GitHub login, repository selection, graph visualisation, and refresh | Captures the core portfolio value without recreating all of GitKraken | - Pending |
| Develop local-first before deployment | Reduces overwhelm and avoids premature infrastructure work | - Pending |
| Store lightweight history/metadata rather than full repository mirrors | Keeps storage, sync, and privacy complexity controlled | - Pending |
| Prefer React, FastAPI, and Supabase if they fit | Builds on the user's recent project experience while leaving room for better domain-specific tools | - Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after initialization*
