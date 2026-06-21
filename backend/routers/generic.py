"""Generic SQL fallback endpoints (for daily_tasks and internal ops)."""
from fastapi import APIRouter
from ..database import get_db

router = APIRouter(prefix="/api", tags=["generic"])

_FORBIDDEN_SQL = ['DROP', 'ALTER', 'CREATE', 'TRUNCATE']


@router.post("/run")
async def run_sql(body: dict):
    sql = body.get("sql", "").strip()
    params = body.get("params", [])
    sql_upper = sql.upper()
    for keyword in _FORBIDDEN_SQL:
        if sql_upper.startswith(keyword) or f' {keyword} ' in sql_upper:
            return {"ok": False, "error": f"Operation not allowed: {keyword}"}
    conn = get_db()
    try:
        conn.execute(sql, params)
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}


@router.post("/query")
async def query_sql(body: dict):
    sql = body.get("sql", "")
    params = body.get("params", [])
    conn = get_db()
    try:
        rows = conn.execute(sql, params).fetchall()
    finally:
        conn.close()
    return {"rows": [list(r) for r in rows]}
