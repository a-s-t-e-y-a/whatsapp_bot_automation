from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    github_token: Optional[str] = None
    wa_group_id: Optional[str] = None

class SettingsResponse(BaseModel):
    github_token: Optional[str] = None
    wa_group_id: Optional[str] = None
