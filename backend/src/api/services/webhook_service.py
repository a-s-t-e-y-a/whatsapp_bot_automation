from src.integration.repositories import RepositoryDAO
from src.services.analysis_service import AnalysisService
from typing import Dict, List, Any
import logging
import asyncio

logger = logging.getLogger(__name__)

class WebhookService:
    def __init__(self):
        self.repo_dao = RepositoryDAO()
        self.analysis_service = AnalysisService()

    async def verify_repository(self, repo_url: str) -> Dict[str, Any]:
        repo_data = await self.repo_dao.collection.find_one({"url": repo_url})
        if not repo_data:
            return None
        return repo_data

    def verify_author(self, commit_author: str, repo_owner: str) -> bool:
        return commit_author == repo_owner

    def extract_commit_data(self, commit: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "sha": commit.get("id"),
            "message": commit.get("message"),
            "author": commit.get("author", {}).get("username"),
            "timestamp": commit.get("timestamp"),
            "url": commit.get("url"),
            "added": commit.get("added", []),
            "modified": commit.get("modified", []),
            "removed": commit.get("removed", [])
        }

    async def process_commits(
        self, 
        commits: List[Dict[str, Any]], 
        repo_owner: str,
        repo_url: str
    ) -> Dict[str, Any]:
        processed_commits = []
        skipped_commits = []
        analyzed_commits = []

        for commit in commits:
            commit_author = commit.get("author", {}).get("username")
            commit_sha = commit.get("id")

            if not self.verify_author(commit_author, repo_owner):
                skipped_commits.append({
                    "sha": commit_sha,
                    "author": commit_author,
                    "reason": "Author does not match repository owner"
                })
                continue

            commit_data = self.extract_commit_data(commit)
            processed_commits.append(commit_data)
            
            analysis_result = await self.analysis_service.analyze_commit(
                commit_data, 
                repo_url
            )
            analyzed_commits.append(analysis_result)

        return {
            "processed": processed_commits,
            "skipped": skipped_commits,
            "analyzed": analyzed_commits
        }
    
    def process_commits_background(
        self,
        commits: List[Dict[str, Any]],
        repo_owner: str,
        repo_url: str
    ):
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                self.process_commits(commits, repo_owner, repo_url)
            )
            loop.close()
            
            logger.info(
                f"Background analysis completed: {len(result['analyzed'])} analyzed, "
                f"{len(result['skipped'])} skipped for {repo_url}"
            )
        except Exception as e:
            logger.error(f"Background analysis failed for {repo_url}: {e}")
