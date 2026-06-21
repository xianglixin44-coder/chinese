"""每日选题路由 — 轮换调度 + 完成标记"""
import random
from datetime import date, timedelta
from fastapi import APIRouter, Query
from backend.database import get_db
from backend.models import DailyAssign

router = APIRouter(prefix="/api/daily", tags=["daily"])


def _pick_exercise(conn, module: str, today: str):
    """选题引擎：排除7天已做 → 体裁轮换 → 随机选1。返回 exercise dict 或 None。"""
    # 昨天做过的 type，今天优先避开
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    yesterday_type = None
    yt = conn.execute(
        "SELECT e.type FROM daily_assignments da JOIN exercises e ON e.id=da.exercise_id "
        "WHERE da.date=? AND da.module=?", [yesterday, module]
    ).fetchone()
    if yt:
        yesterday_type = yt[0]

    # 候选池：排除最近7天已做
    cutoff = (date.today() - timedelta(days=7)).isoformat()
    candidates = conn.execute(
        """SELECT * FROM exercises
           WHERE module = ? AND status = 'active'
             AND id NOT IN (
               SELECT exercise_id FROM daily_assignments
               WHERE module = ? AND date >= ?
             )
           ORDER BY last_practiced_at ASC, practice_count ASC
           LIMIT 10""",
        [module, module, cutoff]
    ).fetchall()

    # 如果7天排除后为空，放宽为3天
    if not candidates:
        cutoff = (date.today() - timedelta(days=3)).isoformat()
        candidates = conn.execute(
            """SELECT * FROM exercises
               WHERE module = ? AND status = 'active'
                 AND id NOT IN (
                   SELECT exercise_id FROM daily_assignments
                   WHERE module = ? AND date >= ?
                 )
               ORDER BY last_practiced_at ASC
               LIMIT 10""",
            [module, module, cutoff]
        ).fetchall()

    # 全部做过 → 不限日期
    if not candidates:
        candidates = conn.execute(
            "SELECT * FROM exercises WHERE module=? AND status='active' ORDER BY last_practiced_at ASC LIMIT 10",
            [module]
        ).fetchall()

    if not candidates:
        return None

    # 体裁轮换：如果有与昨天不同 type 的题，只在其中选
    if yesterday_type and len(candidates) > 1:
        rotated = [c for c in candidates if c["type"] != yesterday_type]
        if rotated:
            candidates = rotated

    picked = random.choice(candidates)
    return dict(picked)


@router.get("")
def get_daily(
    module: str = Query(..., description="题型模块"),
    date: str = Query("", description="日期 YYYY-MM-DD，默认今天"),
):
    """获取今日题目 — 无分配则自动选题"""
    today = date or date.today().isoformat()
    conn = get_db()
    try:
        # 已有分配 → 直接返回
        existing = conn.execute(
            "SELECT * FROM daily_assignments WHERE date=? AND module=?", [today, module]
        ).fetchone()
        if existing:
            ex = conn.execute(
                "SELECT * FROM exercises WHERE id=?", [existing["exercise_id"]]
            ).fetchone()
            return {
                "exercise": dict(ex) if ex else None,
                "is_new": False,
                "completed": existing["completed"],
                "total_available": conn.execute(
                    "SELECT COUNT(*) FROM exercises WHERE module=? AND status='active'", [module]
                ).fetchone()[0],
            }

        # 选题
        picked = _pick_exercise(conn, module, today)
        if not picked:
            return {"exercise": None, "is_new": False, "error": "no exercises available"}

        conn.execute(
            "INSERT INTO daily_assignments (date, module, exercise_id) VALUES (?,?,?)",
            [today, module, picked["id"]],
        )
        conn.execute(
            "UPDATE exercises SET last_practiced_at=?, practice_count=practice_count+1 WHERE id=?",
            [today, picked["id"]],
        )
        conn.commit()

        total = conn.execute(
            "SELECT COUNT(*) FROM exercises WHERE module=? AND status='active'", [module]
        ).fetchone()[0]

        return {"exercise": picked, "is_new": True, "completed": 0, "total_available": total}
    finally:
        conn.close()


@router.post("/complete")
def complete_daily(body: DailyAssign):
    """标记今日题目完成"""
    today = body.date or date.today().isoformat()
    conn = get_db()
    try:
        conn.execute(
            "UPDATE daily_assignments SET completed=1, score=? WHERE date=? AND module=?",
            [body.score, today, body.module],
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()
