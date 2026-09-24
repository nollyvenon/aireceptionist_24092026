"""
GLACIER AI Receptionist - FastAPI Application
Main entry point for the backend API
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="GLACIER AI Receptionist API",
    description="Enterprise AI Receptionist & Appointment Booking + CRM API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {
        "status": "healthy",
        "service": "GLACIER AI Receptionist API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to GLACIER AI Receptionist API",
        "docs": "/docs",
        "version": "1.0.0"
    }

# API v1 routes (to be added)
# @app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["Auth"])
# @app.include_router(appointments_routes.router, prefix="/api/v1/appointments", tags=["Appointments"])
# @app.include_router(crm_routes.router, prefix="/api/v1/crm", tags=["CRM"])
# etc.

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
