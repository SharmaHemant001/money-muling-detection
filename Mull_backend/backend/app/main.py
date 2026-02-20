from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router

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