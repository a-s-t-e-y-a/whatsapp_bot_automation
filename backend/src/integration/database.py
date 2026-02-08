from motor.motor_asyncio import AsyncIOMotorClient
import os
from src.config import Config

class Database:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._client = AsyncIOMotorClient(Config.MONGO_URI)
            cls._db = cls._client[Config.MONGO_DB]
        return cls._instance

    def get_collection(self, name: str):
        return self._db[name]

    async def create_indexes(self):
        await self._db["repositories"].create_index("url", unique=True)
        await self._db["commits"].create_index("hash", unique=True)
        await self._db["commits"].create_index("timestamp")
