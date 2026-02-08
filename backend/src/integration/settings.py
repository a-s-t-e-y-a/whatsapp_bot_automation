from datetime import datetime
from src.integration.database import Database

class SettingsDAO:
    def __init__(self):
        self.collection = Database().get_collection("settings")

    async def get_setting(self, key: str):
        result = await self.collection.find_one({"key": key})
        return result["value"] if result else None

    async def set_setting(self, key: str, value: str):
        return await self.collection.update_one(
            {"key": key},
            {"$set": {
                "value": value,
                "updated_at": datetime.utcnow()
            }, "$setOnInsert": {"created_at": datetime.utcnow()}},
            upsert=True
        )

    async def get_github_token(self):
        return await self.get_setting("github_token")

    async def set_github_token(self, token: str):
        return await self.set_setting("github_token", token)
