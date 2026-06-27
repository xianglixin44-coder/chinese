"""统一题库 CRUD 路由 — 单一 exercises 表，module + type 区分题型"""
from fastapi import APIRouter, Query
from backend.database import get_db
from backend.models import ExerciseItem

router = APIRouter(prefix="/api/exercises", tags=["exercises"])


@router.get("")
def list_exercises(
    module: str = Query("", description="题型模块: flashcard | modern_reading | classical_reading | writing | grammar"),
    type: str = Query("", description="模块内子类型: shici/xuci/wenxue 等"),
    limit: int = Query(100, ge=1, le=2000),
    offset: int = Query(0, ge=0),
):
    """通用列表接口 — 按 module 和可选的 type 过滤。"""
    conn = get_db()
    try:
        where = []; params = []
        if module:
            where.append("module = ?"); params.append(module)
        if type:
            where.append("type = ?"); params.append(type)
        clause = ("WHERE " + " AND ".join(where)) if where else ""
        sql = f"SELECT * FROM exercises {clause} ORDER BY module, type, id LIMIT ? OFFSET ?"
        rows = conn.execute(sql, params + [limit, offset]).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()


@router.post("")
def add_exercise(body: ExerciseItem):
    """通用新增接口 — module + type 决定题型。"""
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO exercises (module, type, title, content, question, options_json, answer, explanation, extra_json) "
            "VALUES (?,?,?,?,?,?,?,?,?)",
            [body.module, body.type or "", body.title or "", body.content,
             body.question or "", body.options_json or "[]",
             body.answer or "", body.explanation or "", body.extra_json or "{}"]
        )
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()
