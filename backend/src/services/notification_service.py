import abc
import httpx
import logging
import os
from typing import Dict, Any

logger = logging.getLogger(__name__)

class NotificationAdapter(abc.ABC):
    @abc.abstractmethod
    async def send_report(self, repo_name: str, report_text: str) -> bool:
        pass

from src.integration.settings import SettingsDAO

class GoogleChatAdapter(NotificationAdapter):
    def __init__(self, webhook_url: str = None):
        self.manual_url = webhook_url
        self.settings_dao = SettingsDAO()

    async def send_report(self, repo_name: str, report_text: str) -> bool:
        # Priority: 1. Manual passed URL, 2. Database setting, 3. Environment variable
        webhook_url = self.manual_url
        if not webhook_url:
            webhook_url = await self.settings_dao.get_setting("google_chat_webhook_url")
        if not webhook_url:
            webhook_url = os.getenv("GOOGLE_CHAT_WEBHOOK_URL")

        if not webhook_url:
            logger.error("Google Chat Webhook URL not configured")
            return False
        
        # Format the message for Google Chat
        message = {
            "text": f"*Daily Report: {repo_name}*\n\n{report_text}"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.webhook_url, json=message)
                response.raise_for_status()
                return True
        except Exception as e:
            logger.error(f"Failed to send report to Google Chat: {e}")
            return False

class SlackAdapter(NotificationAdapter):
    def __init__(self, webhook_url: str = None):
        self.manual_url = webhook_url
        self.settings_dao = SettingsDAO()

    async def send_report(self, repo_name: str, report_text: str) -> bool:
        webhook_url = self.manual_url
        if not webhook_url:
            webhook_url = await self.settings_dao.get_setting("slack_webhook_url")
        if not webhook_url:
            webhook_url = os.getenv("SLACK_WEBHOOK_URL")

        if not webhook_url:
            logger.error("Slack Webhook URL not configured")
            return False
        
        # Format the message for Slack (Markdown)
        message = {
            "text": f"*Daily Report: {repo_name}*\n\n{report_text}"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(webhook_url, json=message)
                response.raise_for_status()
                return True
        except Exception as e:
            logger.error(f"Failed to send report to Slack: {e}")
            return False

class WhatsAppAdapter(NotificationAdapter):
    """Future implementation for WhatsApp using a specific API/Provider"""
    def __init__(self):
        self.settings_dao = SettingsDAO()

    async def send_report(self, repo_name: str, report_text: str) -> bool:
        wa_group_id = await self.settings_dao.get_setting("wa_group_id")
        if not wa_group_id:
            logger.error("WhatsApp Group ID not configured")
            return False
            
        logger.info(f"WhatsApp target requested for {repo_name} (Group: {wa_group_id}). Integration pending.")
        # In the future, this would call a WhatsApp API service
        return False

class NotificationService:
    def __init__(self):
        self.adapters = {
            "google": GoogleChatAdapter(),
            "slack": SlackAdapter(),
            "whatsapp": WhatsAppAdapter()
        }

    async def send_report(self, repo_name: str, report_text: str, target: str = "google") -> bool:
        if target == "all":
            results = []
            for name, adapter in self.adapters.items():
                results.append(await adapter.send_report(repo_name, report_text))
            return any(results) # True if at least one succeeded
        
        adapter = self.adapters.get(target)
        if not adapter:
            logger.error(f"Unknown notification target: {target}")
            return False
            
        return await adapter.send_report(repo_name, report_text)
