from fastapi import APIRouter, Request, BackgroundTasks
from src.api.controllers.webhook_controller import WebhookController

router = APIRouter()
webhook_controller = WebhookController()

@router.post("/webhooks/github")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
    return await webhook_controller.handle_github_webhook(request, background_tasks)
