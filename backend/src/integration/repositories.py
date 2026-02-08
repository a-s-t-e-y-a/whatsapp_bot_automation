from datetime import datetime
from src.integration.database import Database

class RepositoryDAO:
    def __init__(self):
        self.collection = Database().get_collection("repositories")

    async def add_repository(self, url: str, owner: str, repo: str, secret: str = None):
        return await self.collection.update_one(
            {"url": url},
            {"$set": {
                "owner": owner,
                "repo": repo,
                "secret": secret,
                "updated_at": datetime.utcnow()
            }, "$setOnInsert": {"created_at": datetime.utcnow()}},
            upsert=True
        )

    async def get_all_repositories(self):
        return await self.collection.find().to_list(length=100)

    async def delete_repository(self, repo_id: str):
        from bson import ObjectId
        return await self.collection.delete_one({"_id": ObjectId(repo_id)})

    async def update_repository(self, repo_id: str, url: str, owner: str, repo: str, secret: str = None):
        from bson import ObjectId
        return await self.collection.update_one(
            {"_id": ObjectId(repo_id)},
            {"$set": {
                "url": url,
                "owner": owner,
                "repo": repo,
                "secret": secret,
                "updated_at": datetime.utcnow()
            }}
        )
