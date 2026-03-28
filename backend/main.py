from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router

app = FastAPI()

# Add CORS middleware
# Allow all origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router from auth.py
app.include_router(auth_router)

# Root route
@app.get("/")
def read_root():
    return {
        "message": "HackVote Backend Running"
    }