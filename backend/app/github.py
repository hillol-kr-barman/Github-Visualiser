from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import HTTPException, status

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


def _github_headers(token: str) -> dict[str, str]:
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _rate_limit_reset_iso(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return datetime.fromtimestamp(int(value), tz=timezone.utc).isoformat().replace(
            "+00:00",
            "Z",
        )
    except ValueError:
        return None


def _graph_sync_metadata(response: httpx.Response) -> dict[str, Any]:
    remaining = response.headers.get("X-RateLimit-Remaining")
    return {
        "fetched_at": _utc_now_iso(),
        "rate_limit_remaining": int(remaining) if remaining and remaining.isdigit() else None,
        "rate_limit_reset": _rate_limit_reset_iso(response.headers.get("X-RateLimit-Reset")),
    }


def _split_full_name(full_name: str) -> tuple[str, str]:
    owner, repo = full_name.split("/", 1)
    return owner, repo


def _commit_subject(message: str) -> str:
    return message.splitlines()[0] if message else "(no commit message)"


def _commit_node(commit: dict[str, Any], branch_labels: list[str]) -> dict[str, Any]:
    commit_data = commit.get("commit") or {}
    author_data = commit_data.get("author") or {}
    author = commit.get("author") or {}
    sha = commit.get("sha", "")
    parents = [parent.get("sha", "") for parent in commit.get("parents", []) if parent.get("sha")]
    return {
        "sha": sha,
        "short_sha": sha[:7],
        "message": _commit_subject(commit_data.get("message", "")),
        "author_name": author_data.get("name", ""),
        "author_login": author.get("login", ""),
        "authored_at": author_data.get("date"),
        "html_url": commit.get("html_url", ""),
        "parents": parents,
        "branch_labels": branch_labels,
        "pull_requests": [],
    }


async def list_repositories(token: str) -> list[dict[str, Any]]:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub access token is required.",
        )

    params = {
        "visibility": "all",
        "affiliation": "owner,collaborator,organization_member",
        "sort": "pushed",
        "direction": "desc",
        "per_page": "50",
    }

    try:
        async with httpx.AsyncClient(base_url=GITHUB_API_URL, timeout=10.0) as client:
            response = await client.get("/user/repos", headers=_github_headers(token), params=params)
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


async def get_repository_graph(owner: str, repo: str, token: str) -> dict[str, Any]:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub access token is required.",
        )

    try:
        async with httpx.AsyncClient(base_url=GITHUB_API_URL, timeout=10.0) as client:
            commits_response = await client.get(
                f"/repos/{owner}/{repo}/commits",
                headers=_github_headers(token),
                params={"per_page": "50"},
            )
            branches_response = await client.get(
                f"/repos/{owner}/{repo}/branches",
                headers=_github_headers(token),
                params={"per_page": "100"},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub repository graph could not be loaded.",
        ) from exc

    for response in (commits_response, branches_response):
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
        if response.status_code == status.HTTP_404_NOT_FOUND:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GitHub repository was not found or is not accessible.",
            )
        if response.is_error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub repository graph could not be loaded.",
            )

    branch_by_sha: dict[str, list[str]] = {}
    for branch in branches_response.json():
        commit = branch.get("commit") or {}
        sha = commit.get("sha")
        name = branch.get("name")
        if sha and name:
            branch_by_sha.setdefault(sha, []).append(name)

    commits = commits_response.json()
    fetched_shas = {commit.get("sha") for commit in commits if commit.get("sha")}
    nodes = [
        _commit_node(commit, branch_by_sha.get(commit.get("sha", ""), []))
        for commit in commits
        if commit.get("sha")
    ]
    edges = [
        {
            "id": f"{parent_sha}-{child_sha}",
            "source": parent_sha,
            "target": child_sha,
        }
        for commit in nodes
        for child_sha in [commit["sha"]]
        for parent_sha in commit["parents"]
        if parent_sha in fetched_shas
    ]

    return {
        "repository": {"owner": owner, "name": repo, "full_name": f"{owner}/{repo}"},
        "nodes": nodes,
        "edges": edges,
        "sync": _graph_sync_metadata(commits_response),
    }
