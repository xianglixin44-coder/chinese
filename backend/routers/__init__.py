from backend.routers import cards, grammar, tasks, generic
def register_routes(app):
    app.include_router(cards.router)
    app.include_router(grammar.router)
    app.include_router(tasks.router)
    app.include_router(generic.router)
