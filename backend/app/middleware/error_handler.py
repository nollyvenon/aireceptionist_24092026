"""Global error handling middleware"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
import logging
import traceback
from datetime import datetime

logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException as exc:
            logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail}")
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail, "timestamp": datetime.utcnow().isoformat()}
            )
        except ValueError as exc:
            logger.warning(f"Validation Error: {str(exc)}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": str(exc), "timestamp": datetime.utcnow().isoformat()}
            )
        except Exception as exc:
            logger.error(f"Unhandled Exception: {str(exc)}\n{traceback.format_exc()}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "Internal server error",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
