from fastapi import APIRouter, HTTPException
from src.integration.commits import CommitDAO
from typing import List, Any

router = APIRouter()
commit_dao = CommitDAO()

@router.get("/repositories/{repo_id:path}/commits")
async def get_repository_commits(
    repo_id: str, 
    date: str = None, 
    page: int = 1, 
    limit: int = 20
):
    skip = (page - 1) * limit
    commits = await commit_dao.get_by_repository(repo_id, date_str=date, skip=skip, limit=limit)
    
    # Format MongoDB results (convert ObjectId to str)
    for commit in commits:
        commit["id"] = str(commit.pop("_id"))
        if "created_at" in commit and not isinstance(commit["created_at"], str):
            commit["created_at"] = commit["created_at"].isoformat()
        if "timestamp" in commit and not isinstance(commit["timestamp"], str):
            commit["timestamp"] = commit["timestamp"].isoformat()
                
    return commits
