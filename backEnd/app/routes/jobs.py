from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form
import uuid
import os
from datetime import datetime
from app.models.job_model import jobs_db, JobData, JobStatus
from app.services.idps_inference import run_idps_pipeline

router = APIRouter()

# Create a temporary folder to store uploaded CSVs
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/start-job")
async def start_job(
    background_tasks: BackgroundTasks,
    job_type: str = Form("live"),
    file: UploadFile = File(None)
):
    job_id = f"job_{uuid.uuid4().hex[:6]}"
    
    jobs_db[job_id] = JobData(
        job_id=job_id,
        status="running",
        stage="Initializing...",
        progress=0,
        logs=["System boot sequence initiated", f"Mode selected: {job_type.upper()}"],
        created_at=datetime.now()
    )
    
    file_path = None
    if job_type == "file" and file:
        # Save the uploaded file temporarily
        file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
    # Send the job_type and file_path to the pipeline
    background_tasks.add_task(run_idps_pipeline, job_id, job_type, file_path)
    
    return {"job_id": job_id}

# ... KEEP your existing get_job_status and get_job_logs functions here ...
@router.get("/job-status/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs_db[job_id]
    return {"job_id": job.job_id, "status": job.status, "stage": job.stage, "progress": job.progress}

@router.get("/job-logs/{job_id}")
async def get_job_logs(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"logs": jobs_db[job_id].logs}