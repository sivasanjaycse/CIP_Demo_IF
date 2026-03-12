from fastapi import APIRouter, HTTPException
from app.models.job_model import jobs_db

router = APIRouter()

@router.get("/result/{job_id}")
async def get_result(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    
    if job.status == "failed":
        return {"status": "failed", "error": "Pipeline failed during execution"}
    
    if job.status != "completed" or not job.result:
        raise HTTPException(status_code=400, detail="Job is not yet complete")
        
    return job.result