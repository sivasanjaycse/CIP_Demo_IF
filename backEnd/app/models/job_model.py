from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# In-memory database for development
jobs_db = {}

class JobStatus(BaseModel):
    job_id: str
    status: str
    stage: str
    progress: int

class JobResult(BaseModel):
    prediction: str
    confidence: str
    packetsAnalyzed: str
    threatLevel: str
    actionTaken: str

class JobData(BaseModel):
    job_id: str
    status: str
    stage: str
    progress: int
    logs: List[str]
    result: Optional[dict] = None
    created_at: datetime