"""Register all API routers."""
from fastapi import FastAPI
from .cards import router as cards_router
from .tasks import router as tasks_router
from .grammar import router as grammar_router
from .generic import router as generic_router
from .exercises import router as exercises_router
from .daily import router as daily_router
from .records import router as records_router
from .methods import router as methods_router
from .wrong import router as wrong_router
from .training_log import router as tlog_router
from .export import router as export_router


def register_routes(app: FastAPI):
    app.include_router(methods_router)
    app.include_router(cards_router)
    app.include_router(tasks_router)
    app.include_router(grammar_router)
    app.include_router(generic_router)
    app.include_router(exercises_router)
    app.include_router(daily_router)
    app.include_router(records_router)
    app.include_router(wrong_router)
    app.include_router(tlog_router)
    app.include_router(export_router)
