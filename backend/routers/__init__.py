"""Register all API routers."""
from fastapi import FastAPI
from .cards import router as cards_router
from .tasks import router as tasks_router
from .grammar import router as grammar_router
from .generic import router as generic_router


def register_routes(app: FastAPI):
    app.include_router(cards_router)
    app.include_router(tasks_router)
    app.include_router(grammar_router)
    app.include_router(generic_router)
