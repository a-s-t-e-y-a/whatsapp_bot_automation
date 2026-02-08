import os
from langchain.chat_models import init_chat_model
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

TASK_INSTRUCTIONS = """You are a helpful WhatsApp Task Automation Assistant. 
Your job is to help users manage and update their tasks using the tools provided.

Task Rules:
- If a user says "update my task" without a task ID or description, ask for the task ID or a list of recent tasks.
- Always confirm with the user after a successful update.
- Standard statuses are "Pending", "In Progress", and "Completed".
- Use emojis sparingly (e.g., ✅, 📝).

Database Schema:
- tasks collection: _id, description, status, user_id, updated_at.
"""

def update_task_in_db(task_id: str, status: str) -> str:
    return f"Successfully updated task {task_id} to status: {status}"

def get_task_agent():
    checkpointer = MemorySaver()
    model = init_chat_model(
        model="gpt-4o", 
        model_provider="openai",
        temperature=0
    )
    return create_deep_agent(
        model=model,
        tools=[update_task_in_db],
        system_prompt=TASK_INSTRUCTIONS,
        checkpointer=checkpointer
    )

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    agent = get_task_agent()
