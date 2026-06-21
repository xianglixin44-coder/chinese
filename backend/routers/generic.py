from fastapi import APIRouter
from backend.database import get_db
router = APIRouter(prefix="/api", tags=["generic"])

@router.post("/run")
async def run_sql(body: dict):
    conn = get_db()
    try:
        conn.execute(body.get("sql",""), body.get("params",[]))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}

@router.post("/query")
async def query_sql(body: dict):
    conn = get_db()
    try:
        rows = conn.execute(body.get("sql",""), body.get("params",[])).fetchall()
    finally:
        conn.close()
    return {"rows": [list(r) for r in rows]}
