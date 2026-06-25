"""Routes: wrong items (错题本)."""
from typing import Optional
from fastapi import APIRouter, Query
from ..database import get_db
from ..models import WrongItem

router = APIRouter(prefix="/api", tags=["wrong"])


@router.post("/wrong")
def add_wrong(body: WrongItem):
    """记录错题 — 如果已存在则增加 wrong_count"""
    conn = get_db()
    try:
        r = conn.execute(
            "SELECT id, wrong_count FROM wrong_items WHERE exercise_id=? AND question=?",
            [body.exercise_id, body.question]).fetchone()
        if r:
            conn.execute(
                "UPDATE wrong_items SET wrong_count=wrong_count+1, user_answer=?, wrong_at=datetime('now','localtime'), reviewed=0 WHERE id=?",
                [body.user_answer, r["id"]])
        else:
            conn.execute(
                "INSERT INTO wrong_items (exercise_id, module, question_type, question, user_answer, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [body.exercise_id, body.module, body.question_type, body.question, body.user_answer, body.correct_answer, body.explanation])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.get("/wrong")
def list_wrong(module: str = "", reviewed: Optional[int] = None):
    """列出错题，可按模块筛选"""
    conn = get_db()
    try:
        sql = "SELECT * FROM wrong_items WHERE 1=1"
        params = []
        if module:
            sql += " AND module=?"
            params.append(module)
        if reviewed is not None:
            sql += " AND reviewed=?"
            params.append(reviewed)
        sql += " ORDER BY wrong_at DESC"
        rows = conn.execute(sql, params).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()


@router.delete("/wrong/{item_id}")
def remove_wrong(item_id: int):
    """掌握后移除错题"""
    conn = get_db()
    try:
        conn.execute("DELETE FROM wrong_items WHERE id=?", [item_id])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.put("/wrong/{item_id}/review")
def mark_reviewed(item_id: int):
    """标记为已复习"""
    conn = get_db()
    try:
        conn.execute("UPDATE wrong_items SET reviewed=1 WHERE id=?", [item_id])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.get("/wrong/analysis")
def wrong_analysis():
    """错题分析 — 按日期、方法、类型聚合"""
    import json
    conn = get_db()
    try:
        # 按日期统计
        by_date = conn.execute("""
            SELECT DATE(wrong_at) as date, COUNT(*) as count
            FROM wrong_items
            GROUP BY DATE(wrong_at)
            ORDER BY date DESC
            LIMIT 30
        """).fetchall()

        # 按类型统计
        by_type = conn.execute("""
            SELECT question_type, COUNT(*) as count
            FROM wrong_items
            WHERE question_type != ''
            GROUP BY question_type
            ORDER BY count DESC
        """).fetchall()

        # 按方法统计（从exercises关联）
        by_method_rows = conn.execute("""
            SELECT e.extra_json, COUNT(*) as count
            FROM wrong_items w
            JOIN exercises e ON e.id = w.exercise_id
            WHERE w.exercise_id > 0
            GROUP BY e.extra_json
            ORDER BY count DESC
        """).fetchall()

        by_method = []
        for r in by_method_rows:
            try:
                extra = json.loads(r["extra_json"] or "{}")
                method = extra.get("method", "")
                if method:
                    by_method.append({"method": method, "count": r["count"]})
            except:
                pass

        # 总览
        total = conn.execute("SELECT COUNT(*) FROM wrong_items").fetchone()[0]
        unreviewed = conn.execute("SELECT COUNT(*) FROM wrong_items WHERE reviewed=0").fetchone()[0]
        today_count = conn.execute(
            "SELECT COUNT(*) FROM wrong_items WHERE DATE(wrong_at)=DATE('now','localtime')"
        ).fetchone()[0]

        return {
            "total": total,
            "unreviewed": unreviewed,
            "today": today_count,
            "by_date": [{"date": r["date"], "count": r["count"]} for r in by_date],
            "by_type": [{"type": r["question_type"], "count": r["count"]} for r in by_type],
            "by_method": by_method
        }
    finally:
        conn.close()
