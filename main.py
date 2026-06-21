"""语文提高训练 · FastAPI 入口"""
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

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
