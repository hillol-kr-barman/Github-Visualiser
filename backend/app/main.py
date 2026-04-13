from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.github import list_repositories
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


@app.get("/github/repositories")
async def github_repositories() -> dict[str, list[dict[str, object]]]:
    return {"repositories": await list_repositories()}
