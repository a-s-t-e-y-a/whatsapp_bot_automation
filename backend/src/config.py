import os

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB = os.getenv("MONGO_DB", "whatsapp_bot")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET")
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    WA_GROUP_ID = os.getenv("WA_GROUP_ID")
