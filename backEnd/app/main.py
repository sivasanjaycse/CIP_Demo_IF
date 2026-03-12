from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import jobs, results

app = FastAPI(title="IDPS Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(results.router)

@app.get("/")
async def root():
    return {"message": "IDPS Backend is running and ready for ML artifacts."}