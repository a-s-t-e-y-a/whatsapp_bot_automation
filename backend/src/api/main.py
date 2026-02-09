from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import repositories, settings, webhooks
from src.integration.database import Database
import uvicorn
import logging

# Configure logging at the root level
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repositories.router, prefix="/api", tags=["repositories"])
app.include_router(settings.router, prefix="/api", tags=["settings"])
app.include_router(webhooks.router, prefix="/api", tags=["webhooks"])

@app.on_event("startup")
async def startup_db_client():
    await Database().create_indexes()

if __name__ == "__main__":
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True)
