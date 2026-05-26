"""Global error handling middleware"""
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.logging_config import get_logger

logger = get_logger("middleware.error_handler")


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catches unhandled exceptions and returns structured error responses"""

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error(
                f"Unhandled exception on {request.method} {request.url.path}: {exc}",
                exc_info=True,
            )
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal Server Error",
                    "detail": str(exc) if hasattr(exc, "__str__") else "Unknown error",
                    "suggestion": "请稍后重试，或联系管理员查看日志",
                },
            )
