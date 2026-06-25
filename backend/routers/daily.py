"""每日选题路由 — 批量session + 逐题作答"""
import random, uuid
from datetime import date, timedelta
from fastapi import APIRouter, Query
from backend.database import get_db
from backend.models import DailyAssign

router = APIRouter(prefix="/api/daily", tags=["daily"])

# 每日各题型题量配置
DAILY_PLAN = [
    ("classical_reading", "duanju", 2),
    ("classical_reading", "wenhua", 2),
    ("classical_reading", "moxie", 3),
    ("classical_reading", "translation", 2),
    ("classical_reading", "neirong", 1),
]
TOTAL_PER_DAY = sum(p[2] for p in DAILY_PLAN)


def _pick_for_type(conn, module: str, etype: str, n: int, today: str, exclude_ids: list):
    """按间隔重复 + 同方法集中 选题。优先同方法的题连续出。"""
    import json
    rows = conn.execute(
        """SELECT * FROM exercises
           WHERE module=? AND type=? AND status='active'
           ORDER BY practice_count ASC, last_practiced_at ASC
           LIMIT ?""",
        [module, etype, n * 5]
    ).fetchall()

    candidates = [dict(r) for r in rows if r["id"] not in exclude_ids]
    candidates.sort(key=lambda x: (x["practice_count"] or 0, x["last_practiced_at"] or ""))

    if n <= 1 or len(candidates) <= 1:
        return candidates[:n]

    # 找出最主要的method，优先同方法题目
    method_counts = {}
    for c in candidates:
        try:
            extra = json.loads(c.get("extra_json", "{}") or "{}")
            m = extra.get("method", "")
        except:
            m = ""
        if m:
            method_counts[m] = method_counts.get(m, 0) + 1

    # 选题目最多的方法，从中取n道
    if method_counts:
        best_method = max(method_counts, key=method_counts.get)
        same_method = [c for c in candidates if best_method in (c.get("extra_json", "") or "{}")]
        if len(same_method) >= n:
            # 从同方法中选
            same_method.sort(key=lambda x: (x["practice_count"] or 0, x["last_practiced_at"] or ""))
            return same_method[:n]
        else:
            # 同方法不够 → 同方法在前，剩余从其他补
            result = list(same_method)
            others = [c for c in candidates if c not in same_method]
            others.sort(key=lambda x: (x["practice_count"] or 0, x["last_practiced_at"] or ""))
            result.extend(others[:n - len(result)])
            return result[:n]

    return candidates[:n]


@router.get("/session")
def get_daily_session(
    check_only: int = Query(0, description="仅检查不创建"),
    count: int = Query(TOTAL_PER_DAY, description="每日题量，默认10"),
):
    """获取或创建今日训练session — 返回题目列表 + session_id"""
    today = date.today().isoformat()
    conn = get_db()
    try:
        # 今天是否已有未完成的session？
        existing = conn.execute(
            "SELECT DISTINCT session_id FROM daily_assignments WHERE date=? AND session_id!='' AND completed=0",
            [today]
        ).fetchone()

        if existing:
            # 返回已有session
            sid = existing["session_id"]
            items = conn.execute(
                """SELECT da.*, e.question, e.content, e.answer, e.explanation, e.options_json, e.extra_json, e.module, e.type
                   FROM daily_assignments da
                   JOIN exercises e ON e.id = da.exercise_id
                   WHERE da.session_id=? ORDER BY da.position""",
                [sid]
            ).fetchall()
            return {
                "session_id": sid,
                "date": today,
                "items": [dict(r) for r in items],
                "total": len(items),
                "completed_count": sum(1 for r in items if r["is_correct"] >= 0),
                "is_new": False,
            }

        # check_only 模式：已有session则返回，无则返回空（不创建）
        if check_only:
            return {"session_id": "", "date": today, "items": [], "total": 0, "completed_count": 0, "is_new": False}

        # 新建session
        sid = f"{today}-{uuid.uuid4().hex[:6]}"
        all_picked = []
        exclude_ids = set()

        for module, etype, n in DAILY_PLAN[:]:
            if n <= 0:
                continue
            picked = _pick_for_type(conn, module, etype, n, today, list(exclude_ids))
            if len(picked) < n:
                # 不够 → 从其他题型补
                extra = conn.execute(
                    """SELECT * FROM exercises WHERE status='active' AND id NOT IN ({})
                       ORDER BY practice_count ASC, last_practiced_at ASC LIMIT ?""".format(
                        ",".join("?" * len(exclude_ids)) if exclude_ids else "1"
                    ),
                    list(exclude_ids) if exclude_ids else [0] + [n - len(picked)]
                ).fetchall()
                for e in extra:
                    if e["id"] not in exclude_ids:
                        picked.append(dict(e))
                        exclude_ids.add(e["id"])
                        if len(picked) >= n:
                            break

            for e in picked:
                exclude_ids.add(e["id"])
            all_picked.extend(picked[:n])

        # 打乱顺序（同一题型内保持顺序，不同题型间随机穿插）
        random.shuffle(all_picked)

        # 插入 daily_assignments
        for i, ex in enumerate(all_picked):
            conn.execute(
                "INSERT INTO daily_assignments (date, module, exercise_id, session_id, position, is_correct) VALUES (?,?,?,?,?, -1)",
                [today, ex["module"], ex["id"], sid, i]
            )

        conn.commit()

        # 返回
        items = conn.execute(
            """SELECT da.*, e.question, e.content, e.answer, e.explanation, e.options_json, e.extra_json, e.module, e.type
               FROM daily_assignments da
               JOIN exercises e ON e.id = da.exercise_id
               WHERE da.session_id=? ORDER BY da.position""",
            [sid]
        ).fetchall()

        return {
            "session_id": sid,
            "date": today,
            "items": [dict(r) for r in items],
            "total": len(all_picked),
            "completed_count": 0,
            "is_new": True,
        }
    finally:
        conn.close()


@router.post("/answer")
def answer_daily(body: dict):
    """记录单题作答结果"""
    today = date.today().isoformat()
    conn = get_db()
    try:
        conn.execute(
            "UPDATE daily_assignments SET is_correct=?, score=CASE WHEN ? THEN 1 ELSE 0 END WHERE exercise_id=? AND session_id=?",
            [1 if body.get("is_correct") else 0, body.get("is_correct"), body["exercise_id"], body.get("session_id", "")]
        )
        conn.execute(
            "UPDATE exercises SET last_practiced_at=?, practice_count=practice_count+1 WHERE id=?",
            [today, body["exercise_id"]]
        )
        conn.commit()

        # 返回session进度
        sid = body.get("session_id", "")
        total = conn.execute("SELECT COUNT(*) FROM daily_assignments WHERE session_id=?", [sid]).fetchone()[0]
        done = conn.execute("SELECT COUNT(*) FROM daily_assignments WHERE session_id=? AND is_correct>=0", [sid]).fetchone()[0]
        return {"ok": True, "total": total, "done": done}
    finally:
        conn.close()




@router.post("/complete")
def complete_daily_endpoint(body: dict = None):
    """完成标记 — 支持新旧两种格式"""
    conn = get_db()
    try:
        sid = body.get("session_id", "") if body else ""
        if sid:
            # 新格式：session-based
            conn.execute(
                "UPDATE daily_assignments SET completed=1 WHERE session_id=?",
                [sid]
            )
            conn.commit()
            total = conn.execute("SELECT COUNT(*) FROM daily_assignments WHERE session_id=?", [sid]).fetchone()[0]
            correct = conn.execute("SELECT COUNT(*) FROM daily_assignments WHERE session_id=? AND is_correct=1", [sid]).fetchone()[0]
            return {"ok": True, "total": total, "correct": correct, "accuracy": round(correct / total * 100, 1) if total > 0 else 0}
        else:
            # 旧格式：DailyAssign
            today = body.get("date") or date.today().isoformat()
            conn.execute(
                "UPDATE daily_assignments SET completed=1, score=? WHERE date=? AND module=? AND session_id=''",
                [body.get("score"), today, body.get("module", "")]
            )
            conn.commit()
            return {"ok": True}
    finally:
        conn.close()


# ---- 保留旧版单题接口兼容 ----
def _pick_exercise(conn, module: str, today: str):
    """旧版单题引擎"""
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    yesterday_type = None
    yt = conn.execute(
        "SELECT e.type FROM daily_assignments da JOIN exercises e ON e.id=da.exercise_id WHERE da.date=? AND da.module=?",
        [yesterday, module]
    ).fetchone()
    if yt:
        yesterday_type = yt[0]

    cutoff = (date.today() - timedelta(days=7)).isoformat()
    candidates = conn.execute(
        """SELECT * FROM exercises WHERE module=? AND status='active' AND id NOT IN (
               SELECT exercise_id FROM daily_assignments WHERE module=? AND date>=?)
           ORDER BY last_practiced_at ASC, practice_count ASC LIMIT 10""",
        [module, module, cutoff]
    ).fetchall()

    if not candidates:
        cutoff = (date.today() - timedelta(days=3)).isoformat()
        candidates = conn.execute(
            """SELECT * FROM exercises WHERE module=? AND status='active' AND id NOT IN (
               SELECT exercise_id FROM daily_assignments WHERE module=? AND date>=?)
           ORDER BY last_practiced_at ASC LIMIT 10""",
            [module, module, cutoff]
        ).fetchall()

    if not candidates:
        candidates = conn.execute(
            "SELECT * FROM exercises WHERE module=? AND status='active' ORDER BY last_practiced_at ASC LIMIT 10",
            [module]
        ).fetchall()

    if not candidates:
        return None

    if yesterday_type and len(candidates) > 1:
        rotated = [c for c in candidates if c["type"] != yesterday_type]
        if rotated:
            candidates = rotated

    return dict(random.choice(candidates))


@router.get("")
def get_daily(
    module: str = Query(..., description="题型模块"),
    date: str = Query("", description="日期 YYYY-MM-DD，默认今天"),
):
    """旧版单题接口（兼容）"""
    today = date or date.today().isoformat()
    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT * FROM daily_assignments WHERE date=? AND module=? AND session_id=''",
            [today, module]
        ).fetchone()
        if existing:
            ex = conn.execute("SELECT * FROM exercises WHERE id=?", [existing["exercise_id"]]).fetchone()
            return {
                "exercise": dict(ex) if ex else None,
                "is_new": False,
                "completed": existing["completed"],
                "total_available": conn.execute(
                    "SELECT COUNT(*) FROM exercises WHERE module=? AND status='active'", [module]
                ).fetchone()[0],
            }

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



