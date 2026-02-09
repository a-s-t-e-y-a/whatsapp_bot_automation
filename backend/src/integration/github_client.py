import httpx
from typing import Optional, Dict, Any
from urllib.parse import urlparse
from src.integration.settings import SettingsDAO

class GitHubClient:
    def __init__(self):
        self.settings_dao = SettingsDAO()
        self.base_url = "https://api.github.com"
        self._token = None
    
    async def _get_token(self) -> str:
        if not self._token:
            self._token = await self.settings_dao.get_github_token()
        return self._token
    
    async def _get_headers(self) -> Dict[str, str]:
        token = await self._get_token()
        return {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {token}" if token else ""
        }
    
    def _parse_repo_url(self, repo_url: str) -> tuple[str, str]:
        parsed = urlparse(repo_url)
        path_parts = parsed.path.strip("/").split("/")
        if len(path_parts) >= 2:
            return path_parts[0], path_parts[1]
        raise ValueError(f"Invalid repository URL: {repo_url}")
    
    async def get_commit_details(
        self, 
        repo_url: str, 
        commit_sha: str
    ) -> Dict[str, Any]:
        owner, repo = self._parse_repo_url(repo_url)
        url = f"{self.base_url}/repos/{owner}/{repo}/commits/{commit_sha}"
        headers = await self._get_headers()
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    
    async def get_commit_diff(
        self, 
        repo_url: str, 
        commit_sha: str
    ) -> str:
        owner, repo = self._parse_repo_url(repo_url)
        url = f"{self.base_url}/repos/{owner}/{repo}/commits/{commit_sha}"
        
        base_headers = await self._get_headers()
        headers = {
            **base_headers,
            "Accept": "application/vnd.github.v3.diff"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.text
    
    async def get_commit_files(
        self, 
        repo_url: str, 
        commit_sha: str
    ) -> list[Dict[str, Any]]:
        commit_data = await self.get_commit_details(repo_url, commit_sha)
        return commit_data.get("files", [])

