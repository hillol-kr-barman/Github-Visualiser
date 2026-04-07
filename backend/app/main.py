from fastapi import FastAPI
from app.settings import settings

app = FastAPI(title="Git Visualiser API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/config/public")
def public_config() -> dict[str, str]:
    return {
        "frontend_url": settings.frontend_url,
        "github_app_client_id_configured": str(bool(settings.github_app_client_id)).lower(),
    }
