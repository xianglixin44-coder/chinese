"""方法库 CRUD 路由"""
from fastapi import APIRouter, Query
from backend.database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/api/methods", tags=["methods"])


class MethodItem(BaseModel):
    sort_order: int = 0
    icon: str = ""
    title: str
    source: str = ""
    description: str = ""
    target_module: str = ""
    target_page: str = ""
    extra_json: str = "{}"


@router.get("")
def list_methods(status: str = Query("active", description="active | all")):
    conn = get_db()
    try:
        if status == "all":
            rows = conn.execute("SELECT * FROM methods ORDER BY sort_order, id").fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM methods WHERE status=? ORDER BY sort_order, id", [status]
            ).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()


@router.post("")
def add_method(body: MethodItem):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO methods (sort_order, icon, title, source, description, target_module, target_page, extra_json) "
            "VALUES (?,?,?,?,?,?,?,?)",
            [body.sort_order, body.icon, body.title, body.source,
             body.description, body.target_module, body.target_page, body.extra_json],
        )
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()
