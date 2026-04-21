# Git Visualiser

Git Visualiser is a standalone web app for exploring GitHub repository activity through a clear visual workflow graph.

## What It Does

- Sign in with GitHub via Supabase OAuth.
- Choose a repository you have access to.
- View recent commits, branch labels, and commit details in a readable graph.
- Refresh repository data manually or with opt-in auto-refresh every 5 minutes.
- Entirely read-only — the app never writes to GitHub.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Flow |
| Backend | FastAPI (Python 3.12), uvicorn |
| Auth | Supabase GitHub OAuth |
| GitHub data | GitHub REST API (read-only, via backend token) |
| Local serving | nginx (Docker frontend image) |

---

## Running Locally (Development)

This is the fastest way to work on the project. Both services use hot reload.

### Prerequisites

- Node 20+
- Python 3.11+

### 1. Install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .
```

### 2. Set up environment files

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill in values in `frontend/.env` and `backend/.env` — see the [Environment Variables](#environment-variables) section below.

### 3. Start the services

```bash
# Terminal 1 — backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
# Runs at http://localhost:8000

# Terminal 2 — frontend
cd frontend
npm run dev
# Runs at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Running with Docker

Docker builds both services into self-contained images and runs them together. Use this to test the production build or to share the app with someone who doesn't have Node or Python installed.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Set up environment files

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

- Fill in `backend/.env` with your secrets (GitHub token, etc.).
- Fill in the root `.env` with your Supabase values and API URL.

The root `.env` is read by docker-compose and passed into the frontend build. The `frontend/.env` file is **not** used by Docker — only by the local dev server.

### 2. Build and start

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:8000 |

### 3. Stop

```bash
docker-compose down
```

### Rebuilding after changes

Docker bakes your source code into the image at build time. Any change to source files or environment variables requires a rebuild:

```bash
docker-compose up --build
```

For active development, use the local dev setup above — it has hot reload and is much faster to iterate with.

---

## Environment Variables

### How the files are used

| File | Used by |
|---|---|
| `frontend/.env` | Vite dev server (`npm run dev`) only |
| `backend/.env` | FastAPI at runtime (local and Docker) |
| `.env` (root) | docker-compose only — passes values into the frontend Docker build |

### Frontend variables (`frontend/.env` and root `.env`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_API_BASE_URL` | Backend URL the browser calls. Default: `http://localhost:8000` |

`VITE_*` variables are **baked into the JavaScript bundle at build time**. They are not secret — anyone can read them in the browser. Never put tokens or private keys here.

### Backend variables (`backend/.env`)

| Variable | Description |
|---|---|
| `GITHUB_ACCESS_TOKEN` | A GitHub personal access token with repo read scope |
| `FRONTEND_URL` | The frontend origin used for CORS. Must match exactly where the frontend is served |
| `SUPABASE_URL` | Supabase project URL (optional, reserved for future use) |
| `SUPABASE_ANON_KEY` | Supabase anon key (optional, reserved for future use) |
| `GITHUB_APP_CLIENT_ID` | GitHub OAuth App client ID (optional) |
| `GITHUB_APP_CLIENT_SECRET` | GitHub OAuth App client secret (optional) |

### `FRONTEND_URL` must match your environment

| How you run the app | Correct value |
|---|---|
| Local dev (`npm run dev`) | `http://localhost:5173` |
| Docker (local) | `http://localhost:8080` |
| EC2 | `http://<EC2_PUBLIC_IP>:8080` |

If this is wrong, the backend will reject every API call from the frontend with a CORS error.

---

## Deployment (AWS EC2)

The app runs on a single AWS EC2 t2.micro instance (free tier) using Docker Compose. Both frontend and backend containers run on the same instance.

### Prerequisites

- AWS EC2 t2.micro instance (Amazon Linux 2023 or Ubuntu 22.04)
- Security group with inbound ports: `22` (SSH), `8000` (API), `8080` (Web)
- A `.pem` key pair for SSH access

See [`deploy/STEPS.txt`](deploy/STEPS.txt) for the full step-by-step guide.

### First-time setup

1. SSH into the instance and run the bootstrap script to install Docker:
   ```bash
   bash deploy/setup.sh
   ```
2. Clone the repo, create `.env` files from the templates in `deploy/`, and fill in your secrets.
3. Build and start:
   ```bash
   docker compose up -d --build
   ```

The app will be available at `http://<EC2_PUBLIC_IP>:8080`.

### Deploying updates

From your local machine:

```bash
bash deploy/deploy.sh
```

This SSHs into EC2, pulls the latest code, rebuilds the images, and restarts the containers.

### Environment variables for EC2

- Root `.env`: set `VITE_API_BASE_URL=http://<EC2_PUBLIC_IP>:8000`
- `backend/.env`: set `FRONTEND_URL=http://<EC2_PUBLIC_IP>:8080`
- In Supabase → Authentication → URL Configuration:
  - **Site URL**: `http://<EC2_PUBLIC_IP>:8080`
  - **Redirect URLs**: `http://<EC2_PUBLIC_IP>:8080/**`

> **Note:** EC2 public IPs change on stop/start. Assign an Elastic IP in the AWS console to keep the address stable.

---

## How It Works

```
Browser
  │
  ├─ Loads static React app from nginx (Docker) or Vite dev server
  │
  ├─ Supabase handles GitHub OAuth sign-in
  │
  └─ Authenticated API calls go to FastAPI backend
       │
       └─ Backend calls GitHub REST API using GITHUB_ACCESS_TOKEN
            └─ Returns commits, branches, and graph edges
```

The backend token is a server-side read-only GitHub token — it never reaches the browser. Supabase handles user identity separately.

---

## Project Structure

```
.
├── docker-compose.yml       # Runs frontend + backend together
├── .env                     # Root env — docker-compose reads this for frontend build args
├── .env.example             # Template for root .env
├── deploy/
│   ├── setup.sh             # Bootstraps Docker on a fresh EC2 instance
│   ├── deploy.sh            # One-command deploy from local machine to EC2
│   ├── .env.template        # Root .env template for EC2
│   ├── backend.env.template # backend/.env template for EC2
│   └── STEPS.txt            # Full EC2 deployment walkthrough
│
├── frontend/
│   ├── Dockerfile           # Builds React app, serves with nginx
│   ├── .dockerignore
│   ├── .env                 # Frontend env for local dev only (not used by Docker)
│   ├── .env.example
│   └── src/
│       ├── features/
│       │   ├── auth/        # Supabase sign-in
│       │   ├── graph/       # React Flow graph rendering and data fetching
│       │   └── repositories/
│       └── lib/
│           ├── api.ts       # API base URL config
│           └── supabase.ts  # Supabase client
│
└── backend/
    ├── Dockerfile           # Python FastAPI app
    ├── .dockerignore
    ├── .env                 # Backend secrets — never committed
    ├── .env.example
    ├── pyproject.toml
    └── app/
        ├── main.py          # FastAPI routes and CORS config
        ├── github.py        # GitHub API calls
        └── settings.py      # Env var loading via pydantic-settings
```

---

## v1 Limitations

- Graph shows recent commits only, not full repository history.
- Read-only — no branch creation, commits, or pull requests.
- Pull request context is fetched but display is reserved for a future version.
- Repository visibility depends on the configured backend token's permissions.
- Auto-refresh uses a conservative 5-minute interval to avoid GitHub rate limits.
