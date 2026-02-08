from datetime import datetime
from src.integration.database import Database

class CommitDAO:
    def __init__(self):
        self.collection = Database().get_collection("commits")

    async def save_summary(self, commit_data: dict):
        commit_data["created_at"] = datetime.utcnow()
        if "timestamp" not in commit_data:
            commit_data["timestamp"] = datetime.utcnow()
        return await self.collection.update_one(
            {"hash": commit_data["hash"]},
            {"$set": commit_data},
            upsert=True
        )

    async def get_daily_summaries(self, date_str: str = None):
        if not date_str:
            date_str = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_date = datetime.strptime(date_str, "%Y-%m-%d")
        end_date = start_date.replace(hour=23, minute=59, second=59)
        
        return await self.collection.find({
            "timestamp": {"$gte": start_date, "$lte": end_date}
        }).to_list(length=1000)
