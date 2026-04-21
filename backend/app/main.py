from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.github import get_repository_graph, list_repositories
from app.settings import settings

app = FastAPI(title="Git Visualiser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/config/public")
def public_config() -> dict[str, str]:
    return {
        "frontend_url": settings.frontend_url,
        "github_app_client_id_configured": str(bool(settings.github_app_client_id)).lower(),
    }


def _require_github_token(x_github_token: str | None = Header(default=None)) -> str:
    if not x_github_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub access token is required. Sign in with GitHub first.",
        )
    return x_github_token


@app.get("/github/repositories")
async def github_repositories(token: str = Depends(_require_github_token)) -> dict[str, list[dict[str, object]]]:
    return {"repositories": await list_repositories(token)}


@app.get("/github/repositories/{owner}/{repo}/graph")
async def github_repository_graph(owner: str, repo: str, token: str = Depends(_require_github_token)) -> dict[str, object]:
    return await get_repository_graph(owner, repo, token)
