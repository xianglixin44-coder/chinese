'''语文提高训练 2.0 · FastAPI 模块化入口'"'''
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.routers import register_routes

BASE = Path(__file__).parent
STATIC_DIR = BASE / 'frontend'

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title='语文提高训练 2.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])
register_routes(app)

@app.get('/api/health')
async def health():
    return {'status': 'ok'}

@app.get('/')
async def index():
    return FileResponse(STATIC_DIR / 'index.html')

app.mount('/', StaticFiles(directory=str(STATIC_DIR), html=True), name='static')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=3200, reload=True, log_level='info')
