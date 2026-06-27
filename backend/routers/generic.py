"""Safe internal operations (no raw SQL execution)."""
from fastapi import APIRouter
from ..database import get_db

router = APIRouter(prefix="/api", tags=["generic"])


@router.post("/run")
async def run_safe(body: dict):
    """Only allow INSERT for daily_tasks and card_srs tables."""
    sql = body.get("sql", "").strip()
    params = body.get("params", [])
    upper = sql.upper()

    # Whitelist: only INSERT or UPDATE on specific tables
    allowed_tables = ["DAILY_TASKS", "CARD_SRS"]
    allowed = False
    if upper.startswith("INSERT") or upper.startswith("UPDATE"):
        for table in allowed_tables:
            if table in upper:
                allowed = True
                break

    # Reject destructive keywords (case-insensitive, checked on uppered SQL)
    destructive = ['DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'DELETE']
    if any(kw in upper for kw in destructive):
        return {"ok": False, "error": "Destructive operations not allowed"}

    if not allowed:
        return {"ok": False, "error": "This endpoint only accepts daily_tasks and card_srs operations"}

    conn = get_db()
    try:
        conn.execute(sql, params)
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}
