from fastapi import APIRouter
from backend.database import get_db
from backend.models import StreakUpdate
router = APIRouter(prefix="/api", tags=["tasks"])

@router.get("/streak")
def get_streak():
    conn = get_db()
    try:
        r = conn.execute("SELECT count, last_active FROM streak WHERE id=1").fetchone()
        return {"count": r["count"] if r else 0, "last_active": r["last_active"] if r else ""}
    finally:
        conn.close()

@router.post("/streak")
def set_streak(body: StreakUpdate):
    conn = get_db()
    try:
        conn.execute("UPDATE streak SET count=?, last_active=? WHERE id=1", [body.count, body.last_active])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()
