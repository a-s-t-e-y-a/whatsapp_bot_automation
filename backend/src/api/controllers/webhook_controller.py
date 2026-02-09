from fastapi import HTTPException, Request
from src.api.services.webhook_service import WebhookService
import hmac
import hashlib
import json
from typing import Dict, Any

class WebhookController:
    def __init__(self):
        self.webhook_service = WebhookService()

    def verify_signature(
        self, 
        body: bytes, 
        signature: str, 
        secret: str
    ) -> bool:
        hash_object = hmac.new(secret.encode(), msg=body, digestmod=hashlib.sha256)
        expected_signature = "sha256=" + hash_object.hexdigest()
        return hmac.compare_digest(signature, expected_signature)

    async def handle_github_webhook(self, request: Request) -> Dict[str, Any]:
        signature = request.headers.get("X-Hub-Signature-256")
        if not signature:
            raise HTTPException(status_code=400, detail="Signature missing")

        body = await request.body()
        payload = json.loads(body)

        repo_url = payload.get("repository", {}).get("html_url")
        if not repo_url:
            raise HTTPException(status_code=400, detail="Repository URL missing")

        repo_data = await self.webhook_service.verify_repository(repo_url)
        if not repo_data:
            raise HTTPException(status_code=404, detail="Repository not registered")

        webhook_secret = repo_data.get("secret")
        if webhook_secret:
            if not self.verify_signature(body, signature, webhook_secret):
                raise HTTPException(status_code=401, detail="Invalid signature")

        commits = payload.get("commits", [])
        if not commits:
            return {"status": "ok", "message": "No commits to process"}

        repo_owner = repo_data.get("owner")
        result = await self.webhook_service.process_commits(commits, repo_owner, repo_url)

        return {
            "status": "ok",
            "message": "Webhook processed successfully",
            "processed": len(result["processed"]),
            "skipped": len(result["skipped"]),
            "analyzed": len(result["analyzed"]),
            "commits_analyzed": result["analyzed"],
            "skipped_commits": result["skipped"]
        }

