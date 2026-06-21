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

    allowed = False
    if upper.startswith("INSERT") or upper.startswith("UPDATE"):
        if "DAILY_TASKS" in upper:
            allowed = True
        elif "CARD_SRS" in upper:
            allowed = True

    if not allowed:
        return {"ok": False, "error": "This endpoint only accepts daily_tasks and card_srs operations"}

    if any(kw in upper for kw in ['DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'DELETE']):
        return {"ok": False, "error": "Destructive operations not allowed"}

    conn = get_db()
    try:
        conn.execute(sql, params)
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}
