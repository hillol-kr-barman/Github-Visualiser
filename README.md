# Git Visualiser

Git Visualiser is a standalone web app for exploring GitHub repository activity through a clear visual workflow graph.

## What It Does

- Sign in with GitHub.
- Choose a repository you can access.
- View branch, commit, and workflow activity in a visual graph.
- Stay read-only: the app does not write to GitHub repositories.

## Tech Stack

- Frontend: React, Vite, TypeScript.
- Backend: FastAPI.
- Auth: Supabase GitHub sign-in.

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

Keep real `.env` files out of git. Frontend variables use the `VITE_` prefix because they are exposed to browser code. Backend variables are for server-side configuration.

## GitHub Permissions

- GitHub sign-in is used for identity.
- Do not request the broad GitHub OAuth `repo` scope for basic sign-in.
- Private repository access should use read-only GitHub App permissions.
- Do not request GitHub write permissions.
- For local repository listing, `GITHUB_ACCESS_TOKEN` should be read-only and kept in `backend/.env`.

## GitHub Sign-In Setup

1. Create or open the Supabase project.
2. Enable the GitHub auth provider in Supabase Auth.
3. Configure the GitHub OAuth callback URL required by Supabase.
4. Copy the Supabase URL and anon key into `frontend/.env`.
5. Start the backend and frontend.
6. Click `Sign in with GitHub`.
7. Confirm the app shows signed-in state after redirect.
8. Click `Sign out`.

## Repository Listing Setup

1. Add a read-only GitHub token to `backend/.env` as `GITHUB_ACCESS_TOKEN`.
2. Start the backend and frontend.
3. Sign in with GitHub.
4. Click `Load repositories`.
5. Select a repository.
6. Confirm it appears under `Selected repository` and `Recent repositories`.

## Repository Graph API Check

After selecting a repository, the backend graph endpoint can be checked with:

```bash
curl http://localhost:8000/github/repositories/OWNER/REPO/graph
```

The response contains `repository`, `nodes`, and `edges`.

## Repository Graph Check

1. Start the backend and frontend.
2. Sign in with GitHub.
3. Load repositories.
4. Select a repository.
5. Click `Load graph`.
6. Confirm recent commits appear as graph nodes.
7. Click a commit node and confirm `Commit details` appears.

The first graph view is intentionally limited to recent commits so the app does not fetch full repository history.

## Refresh Check

1. Select a repository.
2. Click `Load graph`.
3. Confirm `Last refreshed` appears.
4. Click `Refresh graph`.
5. Confirm the graph stays visible while refresh status updates.
6. Enable `Auto-refresh`.
7. Confirm the UI says `Auto-refresh is on.` and `Every 5 minutes`.
8. Disable `Auto-refresh`.
9. Confirm the UI says `Auto-refresh is off.`
