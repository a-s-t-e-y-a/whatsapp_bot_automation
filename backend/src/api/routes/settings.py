from fastapi import APIRouter
from src.integration.settings import SettingsDAO

router = APIRouter()

@router.get("/settings")
async def get_settings():
    settings_dao = SettingsDAO()
    github_token = await settings_dao.get_github_token()
    wa_group_id = await settings_dao.get_setting("wa_group_id")
    google_chat_webhook_url = await settings_dao.get_setting("google_chat_webhook_url")
    slack_webhook_url = await settings_dao.get_setting("slack_webhook_url")
    return {
        "github_token": github_token,
        "wa_group_id": wa_group_id,
        "google_chat_webhook_url": google_chat_webhook_url,
        "slack_webhook_url": slack_webhook_url
    }

import httpx
import os

@router.get("/settings/whatsapp/status")
async def get_whatsapp_status():
    bridge_url = os.getenv("WHATSAPP_BRIDGE_URL", "http://localhost:8001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{bridge_url}/api/whatsapp/status")
            return response.json()
    except Exception:
        return {"status": "DISCONNECTED", "error": "Bridge offline"}

@router.get("/settings/whatsapp/qr")
async def get_whatsapp_qr():
    bridge_url = os.getenv("WHATSAPP_BRIDGE_URL", "http://localhost:8001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{bridge_url}/api/whatsapp/qr")
            return response.json()
    except Exception:
        return {"error": "Bridge offline or QR not available"}

@router.get("/settings/whatsapp/groups")
async def get_whatsapp_groups():
    bridge_url = os.getenv("WHATSAPP_BRIDGE_URL", "http://localhost:8001")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{bridge_url}/api/whatsapp/groups")
            return response.json()
    except Exception:
        return {"groups": [], "error": "Bridge offline"}

@router.put("/settings")
async def update_settings(settings: dict):
    settings_dao = SettingsDAO()
    
    if "github_token" in settings:
        await settings_dao.set_github_token(settings["github_token"])
    if "wa_group_id" in settings:
        await settings_dao.set_setting("wa_group_id", settings["wa_group_id"])
    if "google_chat_webhook_url" in settings:
        await settings_dao.set_setting("google_chat_webhook_url", settings["google_chat_webhook_url"])
    if "slack_webhook_url" in settings:
        await settings_dao.set_setting("slack_webhook_url", settings["slack_webhook_url"])
    
    return {"status": "updated"}
