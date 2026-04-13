from typing import Any

import httpx
from fastapi import HTTPException, status

from app.settings import settings

GITHUB_API_URL = "https://api.github.com"


def _repo_summary(repo: dict[str, Any]) -> dict[str, Any]:
    owner = repo.get("owner") or {}
    return {
        "id": repo.get("id"),
        "name": repo.get("name", ""),
        "full_name": repo.get("full_name", ""),
        "owner": owner.get("login", ""),
        "html_url": repo.get("html_url", ""),
        "private": bool(repo.get("private", False)),
        "visibility": repo.get("visibility", "private" if repo.get("private") else "public"),
        "default_branch": repo.get("default_branch", ""),
        "description": repo.get("description"),
        "pushed_at": repo.get("pushed_at"),
        "updated_at": repo.get("updated_at"),
    }


async def list_repositories() -> list[dict[str, Any]]:
    if not settings.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub repository access is not configured.",
        )

    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.github_access_token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    params = {
        "visibility": "all",
        "affiliation": "owner,collaborator,organization_member",
        "sort": "pushed",
        "direction": "desc",
        "per_page": "50",
    }

    try:
        async with httpx.AsyncClient(base_url=GITHUB_API_URL, timeout=10.0) as client:
            response = await client.get("/user/repos", headers=headers, params=params)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub repository list could not be loaded.",
        ) from exc

    if response.status_code == status.HTTP_401_UNAUTHORIZED:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub rejected the configured repository access token.",
        )
    if response.status_code == status.HTTP_403_FORBIDDEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="GitHub repository access is forbidden or rate-limited.",
        )
    if response.is_error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub repository list could not be loaded.",
        )

    return [_repo_summary(repo) for repo in response.json()]
