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

## GitHub Sign-In Setup

1. Create or open the Supabase project.
2. Enable the GitHub auth provider in Supabase Auth.
3. Configure the GitHub OAuth callback URL required by Supabase.
4. Copy the Supabase URL and anon key into `frontend/.env`.
5. Start the backend and frontend.
6. Click `Sign in with GitHub`.
7. Confirm the app shows signed-in state after redirect.
8. Click `Sign out`.
