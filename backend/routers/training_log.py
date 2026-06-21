"""Routes: training_log — 统一训练记录 (题目 + 解答 + 纠错)."""
from typing import Optional
from fastapi import APIRouter
from ..database import get_db
from ..models import TrainingLogEntry

router = APIRouter(prefix="/api", tags=["training_log"])


@router.post("/training-log")
def add_log(body: TrainingLogEntry):
    """记录一次训练答题"""
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO training_log (module, exercise_id, question, user_answer, correct_answer, is_correct, score) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [body.module, body.exercise_id, body.question, body.user_answer, body.correct_answer, body.is_correct, body.score])
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()


@router.get("/training-log")
def list_log(module: str = "", is_correct: Optional[int] = None, reviewed: Optional[int] = None, limit: int = 100):
    """列出训练记录，可按模块/对错/复习状态筛选"""
    conn = get_db()
    try:
        sql = "SELECT * FROM training_log WHERE 1=1"
        params = []
        if module:
            sql += " AND module=?"
            params.append(module)
        if is_correct is not None:
            sql += " AND is_correct=?"
            params.append(is_correct)
        if reviewed is not None:
            sql += " AND reviewed=?"
            params.append(reviewed)
        sql += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(sql, params).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()


@router.get("/training-log/stats")
def log_stats(module: str = ""):
    """训练统计：总数/正确/错误/待复习"""
    conn = get_db()
    try:
        where = "WHERE module=?" if module else ""
        params = [module] if module else []
        total = conn.execute(f"SELECT COUNT(*) FROM training_log {where}", params).fetchone()[0]
        correct = conn.execute(f"SELECT COUNT(*) FROM training_log {where + ' AND is_correct=1' if where else 'WHERE is_correct=1'}", params).fetchone()[0]
        wrong = conn.execute(f"SELECT COUNT(*) FROM training_log {where + ' AND is_correct=0' if where else 'WHERE is_correct=0'}", params).fetchone()[0]
        to_review = conn.execute(f"SELECT COUNT(*) FROM training_log {where + ' AND is_correct=0 AND reviewed=0' if where else 'WHERE is_correct=0 AND reviewed=0'}", params).fetchone()[0]
        return {"total": total, "correct": correct, "wrong": wrong, "to_review": to_review}
    finally:
        conn.close()


@router.put("/training-log/{log_id}/note")
def update_note(log_id: int, body: dict):
    """更新纠错笔记"""
    conn = get_db()
    try:
        conn.execute("UPDATE training_log SET correction_note=? WHERE id=?", [body.get("note", ""), log_id])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.put("/training-log/{log_id}/review")
def mark_log_reviewed(log_id: int):
    """标记为已复习"""
    conn = get_db()
    try:
        conn.execute("UPDATE training_log SET reviewed=1 WHERE id=?", [log_id])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()
