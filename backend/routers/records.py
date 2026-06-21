"""训练记录聚合路由 — 闪卡 + 选题 + 语法 + 模板"""
from datetime import date, timedelta
from fastapi import APIRouter, Query
from backend.database import get_db

router = APIRouter(prefix="/api/records", tags=["records"])


@router.get("")
def get_records(
    days: int = Query(30, ge=1, le=365, description="回溯天数"),
):
    """聚合最近 N 天的所有训练记录。"""
    conn = get_db()
    try:
        cutoff = (date.today() - timedelta(days=days)).isoformat()

        # 每日选题记录
        da_rows = conn.execute(
            """SELECT da.date, da.module, da.completed, da.score,
                      e.content, e.type, e.answer, e.explanation
               FROM daily_assignments da
               JOIN exercises e ON e.id = da.exercise_id
               WHERE da.date >= ?
               ORDER BY da.date DESC, da.module""",
            [cutoff],
        ).fetchall()

        # 闪卡复习记录
        fc_rows = conn.execute(
            """SELECT reviewed_at, deck, card_word, rating
               FROM flashcard_log
               WHERE reviewed_at >= ?
               ORDER BY reviewed_at DESC""",
            [cutoff],
        ).fetchall()

        # 语法练习记录
        gr_rows = conn.execute(
            """SELECT created_at, sentence, example_idx, module
               FROM grammar_log
               WHERE created_at >= ?
               ORDER BY created_at DESC""",
            [cutoff],
        ).fetchall()

        # 模板练习记录
        tp_rows = conn.execute(
            """SELECT created_at, combo_a, combo_b, combo_c, topic
               FROM template_log
               WHERE created_at >= ?
               ORDER BY created_at DESC""",
            [cutoff],
        ).fetchall()

        # 本周统计
        week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
        week_daily = conn.execute(
            "SELECT module, COUNT(*), SUM(CASE WHEN completed THEN 1 ELSE 0 END) FROM daily_assignments WHERE date >= ? GROUP BY module",
            [week_start],
        ).fetchall()
        week_cards = conn.execute(
            "SELECT COUNT(*) FROM flashcard_log WHERE reviewed_at >= ?", [week_start]
        ).fetchone()

        return {
            "daily": [dict(r) for r in da_rows],
            "flashcards": [dict(r) for r in fc_rows],
            "grammar": [dict(r) for r in gr_rows],
            "templates": [dict(r) for r in tp_rows],
            "week_stats": {
                "daily": [{"module": r[0], "total": r[1], "completed": r[2]} for r in week_daily],
                "cards_reviewed": week_cards[0] if week_cards else 0,
            },
        }
    finally:
        conn.close()
