"""
GLACIER AI Receptionist - FastAPI Application
Main entry point for the backend API
"""

from fastapi import FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import LoggingMiddleware

# Import route routers
from app.api import auth_routes, customer_routes, appointment_routes, payment_routes, ai_routes
from app.api import organization_routes, settings_routes, automation_routes, activity_routes, analytics_routes

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup")
    yield
    logger.info("Application shutdown")

# Create FastAPI app
app = FastAPI(
    title="GLACIER AI Receptionist API",
    description="Enterprise AI Receptionist & Appointment Booking + CRM API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware (order matters - first added is last executed)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=120)
app.add_middleware(ErrorHandlerMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
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

# Include all API route routers
app.include_router(auth_routes.router)
app.include_router(customer_routes.router)
app.include_router(appointment_routes.router)
app.include_router(payment_routes.router)
app.include_router(ai_routes.router)
app.include_router(organization_routes.router)
app.include_router(settings_routes.router)
app.include_router(automation_routes.router)
app.include_router(activity_routes.router)
app.include_router(analytics_routes.router)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
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
