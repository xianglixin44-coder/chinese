"""语文提高训练 · FastAPI 入口"""
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
import os

AUTH_TOKEN = os.environ.get("TRAINER_TOKEN", "chinese-trainer-2026")

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for safe endpoints
        if request.method == "GET" or request.url.path == "/api/health":
            return await call_next(request)
        # Check token for write operations
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            token = request.query_params.get("token", "")
        if token != AUTH_TOKEN:
            return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
        return await call_next(request)

from fastapi.responses import JSONResponse

from backend.database import init_db
from backend.routers import register_routes

BASE = Path(__file__).parent
STATIC_DIR = BASE / "frontend"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print(f"DB ready: {BASE / 'trainer.db'}")
    yield


app = FastAPI(title="语文提高训练 API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

register_routes(app)

app.add_middleware(AuthMiddleware)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/sql-wasm.wasm")
async def sql_wasm():
    return FileResponse(STATIC_DIR / "sql-wasm.wasm", media_type="application/wasm")


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")


# Static files — mount AFTER route definitions (routes take precedence)
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    print("Starting: http://0.0.0.0:3200")
    uvicorn.run("main:app", host="0.0.0.0", port=3200, log_level="info")
