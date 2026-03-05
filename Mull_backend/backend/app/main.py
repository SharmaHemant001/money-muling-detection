import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

if __package__ in (None, ""):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)

    if sys.path and os.path.abspath(sys.path[0]) == script_dir:
        sys.path.pop(0)

    sys.path.insert(0, backend_dir)
    from app.routes.upload import router as upload_router
else:
    from .routes.upload import router as upload_router

app = FastAPI(title="Money Muling Detection Engine")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your upload route
app.include_router(upload_router)

# Root endpoint (so / does not show Not Found)
@app.get("/")
def root():
    return {
        "message": "Money Muling Detection API is running successfully 🚀"
    }
