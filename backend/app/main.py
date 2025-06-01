import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from .api import contacts
from .core.database import engine, Base
import os

# Set up logging to file and console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Summit Customer Compass API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For production, specify your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(contacts.router, prefix="/api/contacts", tags=["contacts"])

@app.get("/")
async def root():
    return {"message": "Welcome to Summit Customer Compass API"}

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled error at {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )

# Development only: Endpoint to view the last 100 lines of the error log
@app.get("/logs", response_class=PlainTextResponse)
async def get_logs():
    log_path = "app.log"
    if not os.path.exists(log_path):
        return "No log file found."
    with open(log_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    return "".join(lines[-100:]) 