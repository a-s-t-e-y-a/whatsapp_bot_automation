from fastapi import APIRouter, Request
from src.api.controllers.webhook_controller import WebhookController

router = APIRouter()
webhook_controller = WebhookController()

@router.post("/webhooks/github")
async def github_webhook(request: Request):
    return await webhook_controller.handle_github_webhook(request)
