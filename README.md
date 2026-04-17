# Git Visualiser

Git Visualiser is a standalone web app for exploring GitHub repository activity through a clear visual workflow graph.

## What It Does

- Sign in with GitHub.
- Choose a repository you can access.
- View recent commits, branch labels, and commit details in a readable graph.
- Refresh repository data manually or with conservative opt-in auto-refresh.
- Stay read-only: the app does not write to GitHub repositories.

## Tech Stack

- Frontend: React, Vite, TypeScript, React Flow.
- Backend: FastAPI.
- Auth: Supabase GitHub sign-in.
- GitHub data: GitHub REST API through the backend.

## Local Development

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Start the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

The frontend runs on `http://localhost:5173`. The backend runs on `http://localhost:8000`.

## Environment Variables

Create local env files from the examples:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Frontend variables use the `VITE_` prefix because they are exposed to browser code. Backend variables are server-side only. Keep real `.env` files out of git.

Frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

Backend:

- `GITHUB_ACCESS_TOKEN`
- `FRONTEND_URL`

## GitHub Permissions

- GitHub sign-in is used for identity.
- Repository API access is read-only.
- Private repository visibility depends on the configured token permissions.
- Do not request GitHub write permissions.
- Keep `GITHUB_ACCESS_TOKEN` only in backend environment variables.

## Deployment Notes

The app can be deployed without buying a new domain.

- Deploy the frontend from `frontend/` on Vercel.
- Deploy the backend from `backend/` on Railway.
- Set `VITE_API_BASE_URL` in Vercel to the Railway backend URL.
- Set `FRONTEND_URL` in Railway to the Vercel frontend URL.
- Keep `GITHUB_ACCESS_TOKEN` only in Railway backend environment variables.
- Add the deployed frontend URL to Supabase/GitHub OAuth redirect settings.
- Deployment can use the free generated Vercel and Railway URLs; a custom domain can be added later but is not required.

## v1 Limitations

- The graph focuses on recent commits rather than full repository history.
- The app is read-only and does not create branches, commits, or pull requests.
- Pull request context is reserved for a future enhancement.
- Repository visibility depends on the backend token permissions.
- Auto-refresh uses a conservative interval to avoid unnecessary GitHub API requests.

## Final UAT Checklist

- Sign in with GitHub.
- Load repositories.
- Select a repository.
- Load the graph.
- Click a commit and review commit details.
- Click `Refresh graph`.
- Enable and disable `Auto-refresh`.
- Sign out.

Before linking from a portfolio, run the final UAT checklist locally and repeat it once deployed.

## Portfolio Blurb

Git Visualiser is a React and FastAPI app that connects to GitHub and turns repository commit activity into a readable workflow graph with refresh controls.
