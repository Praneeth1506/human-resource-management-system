from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HRMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # add Vercel URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "HRMS API running"}

# Person 1 mounts auth/employee/attendance/leave/payroll routers here
# Person 4 mounts dashboard router here