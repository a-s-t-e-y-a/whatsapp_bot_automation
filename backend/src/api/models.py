from pydantic import BaseModel
from typing import Optional

class RepositoryCreate(BaseModel):
    url: str
    owner: str
    repo: str
    secret: Optional[str] = None

class RepositoryResponse(BaseModel):
    url: str
    owner: str
    repo: str
    id: str
