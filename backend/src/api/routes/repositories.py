from fastapi import APIRouter, HTTPException
from src.api.models.repository import RepositoryCreate, RepositoryResponse
from src.integration.repositories import RepositoryDAO

router = APIRouter()
repo_dao = RepositoryDAO()

@router.post("/repositories", response_model=RepositoryResponse)
async def add_repository(repo: RepositoryCreate):
    result = await repo_dao.add_repository(repo.url, repo.owner, repo.repo, repo.secret)
    return {
        "url": repo.url,
        "owner": repo.owner,
        "repo": repo.repo,
        "id": str(result.upserted_id or repo.url)
    }

@router.get("/repositories")
async def list_repositories():
    repos = await repo_dao.get_all_repositories()
    return [{
        "url": r["url"],
        "owner": r["owner"],
        "repo": r["repo"],
        "id": str(r["_id"])
    } for r in repos]

@router.delete("/repositories/{repo_id}")
async def delete_repository(repo_id: str):
    result = await repo_dao.delete_repository(repo_id)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Repository not found")
    return {"status": "deleted"}

@router.put("/repositories/{repo_id}", response_model=RepositoryResponse)
async def update_repository(repo_id: str, repo: RepositoryCreate):
    result = await repo_dao.update_repository(repo_id, repo.url, repo.owner, repo.repo, repo.secret)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Repository not found")
    return {
        "url": repo.url,
        "owner": repo.owner,
        "repo": repo.repo,
        "id": repo_id
    }
