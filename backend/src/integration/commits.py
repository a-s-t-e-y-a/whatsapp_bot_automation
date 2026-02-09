from datetime import datetime
from src.integration.database import Database

class CommitDAO:
    def __init__(self):
        self.collection = Database().get_collection("commits")

    async def save_summary(self, commit_data: dict):
        commit_data["created_at"] = datetime.utcnow()
        if "timestamp" in commit_data and isinstance(commit_data["timestamp"], str):
            try:
                # ISO 8601 can have 'Z' or offset. datetime.fromisoformat handles offsets in 3.7+
                # but might need 'Z' replaced with +00:00 depending on Python version.
                ts_str = commit_data["timestamp"].replace('Z', '+00:00')
                commit_data["timestamp"] = datetime.fromisoformat(ts_str)
            except (ValueError, TypeError):
                pass

        if "timestamp" not in commit_data or commit_data["timestamp"] is None:
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
            "$or": [
                {"timestamp": {"$gte": start_date, "$lte": end_date}},
                {"timestamp": {"$regex": f"^{date_str}"}}
            ]
        }).to_list(length=1000)

    async def get_by_repository(self, repo_url: str, date_str: str = None, skip: int = 0, limit: int = 20):
        query = {"repository": repo_url}
        if date_str:
            try:
                start_date = datetime.strptime(date_str, "%Y-%m-%d")
                end_date = start_date.replace(hour=23, minute=59, second=59)
                query["$or"] = [
                    {"timestamp": {"$gte": start_date, "$lte": end_date}},
                    {"timestamp": {"$regex": f"^{date_str}"}}
                ]
            except ValueError:
                pass
        
        return await self.collection.find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(length=limit)
