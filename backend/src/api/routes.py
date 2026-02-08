from fastapi import APIRouter, HTTPException, Request
from src.api.models import RepositoryCreate, RepositoryResponse
from src.integration.repositories import RepositoryDAO
import hmac
import hashlib
import json
from src.config import Config

router = APIRouter()
repo_dao = RepositoryDAO()

@router.post("/repositories", response_model=RepositoryResponse)
async def add_repository(repo: RepositoryCreate):
    result = await repo_dao.add_repository(repo.url, repo.owner, repo.repo, repo.secret, repo.github_token)
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
    result = await repo_dao.update_repository(repo_id, repo.url, repo.owner, repo.repo, repo.secret, repo.github_token)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Repository not found")
    return {
        "url": repo.url,
        "owner": repo.owner,
        "repo": repo.repo,
        "id": repo_id
    }

@router.get("/settings")
async def get_settings():
    from src.integration.settings import SettingsDAO
    settings_dao = SettingsDAO()
    github_token = await settings_dao.get_github_token()
    wa_group_id = await settings_dao.get_setting("wa_group_id")
    return {
        "github_token": github_token,
        "wa_group_id": wa_group_id
    }

@router.put("/settings")
async def update_settings(settings: dict):
    from src.integration.settings import SettingsDAO
    settings_dao = SettingsDAO()
    
    if "github_token" in settings:
        await settings_dao.set_github_token(settings["github_token"])
    if "wa_group_id" in settings:
        await settings_dao.set_setting("wa_group_id", settings["wa_group_id"])
    
    return {"status": "updated"}

@router.post("/webhooks/github")
async def github_webhook(request: Request):
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        raise HTTPException(status_code=400, detail="Signature missing")

    body = await request.body()
    
    # Optional: Verify signature if secret is configured
    if Config.GITHUB_WEBHOOK_SECRET:
        hash_object = hmac.new(Config.GITHUB_WEBHOOK_SECRET.encode(), msg=body, digestmod=hashlib.sha256)
        expected_signature = "sha256=" + hash_object.hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

    payload = json.loads(body)
    # TODO: Trigger commit analysis logic
    return {"status": "ok"}
