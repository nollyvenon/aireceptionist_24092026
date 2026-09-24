"""Request logging middleware"""

from fastapi import Request
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"

        logger.info(f"Request: {request.method} {request.url.path} from {client_ip}")

        response = await call_next(request)

        process_time = time.time() - start_time
        logger.info(
            f"Response: {request.method} {request.url.path} - "
            f"Status {response.status_code} - Time {process_time:.3f}s"
        )

        response.headers["X-Process-Time"] = str(process_time)
        return response
