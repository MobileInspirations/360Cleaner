from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import contacts
from .core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Summit Customer Compass API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(contacts.router, prefix="/api/contacts", tags=["contacts"])

@app.get("/")
async def root():
    return {"message": "Welcome to Summit Customer Compass API"} 