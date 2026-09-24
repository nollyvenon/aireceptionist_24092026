"""Rate limiting middleware"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware:
    def __init__(self, app, requests_per_minute: int = 60):
        self.app = app
        self.requests_per_minute = requests_per_minute
        self.requests = {}

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        now = datetime.utcnow()
        cutoff_time = now - timedelta(minutes=1)

        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > cutoff_time
        ]

        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"}
            )

        self.requests[client_ip].append(now)
        response = await call_next(request)
        return response
