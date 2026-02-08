from datetime import datetime
from src.integration.database import Database

class TaskRepository:
    def __init__(self):
        self.db = Database()
        self.collection = self.db.get_collection("tasks")

    async def update_status(self, task_id: str, status: str):
        await self.collection.update_one(
            {"_id": task_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
