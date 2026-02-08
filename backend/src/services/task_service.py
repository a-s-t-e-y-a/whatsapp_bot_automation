from src.integration.task_repository import TaskRepository

class TaskService:
    def __init__(self):
        self.repository = TaskRepository()

    async def update_task(self, task_id: str, status: str):
        return await self.repository.update_status(task_id, status)
