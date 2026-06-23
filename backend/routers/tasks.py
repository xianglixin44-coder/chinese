"""Routes: streak, training sessions, template, calendar, assessment, import."""
from fastapi import APIRouter
from ..database import get_db
from ..models import StreakUpdate, TemplateLog, TrainingSession, Assessment, ImportExercises

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


@router.post("/template/log")
def log_template(body: TemplateLog):
    conn = get_db()
    try:
        conn.execute("INSERT INTO template_log (combo_a, combo_b, combo_c, topic) VALUES (?, ?, ?, ?)",
                     [body.combo_a, body.combo_b, body.combo_c, body.topic[:200]])
        conn.execute("INSERT OR IGNORE INTO training_sessions (date, module, duration_min) VALUES (date('now','localtime'), '模板', 10)")
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.get("/stats/template")
def get_template_count():
    conn = get_db()
    try:
        r = conn.execute("SELECT COUNT(*) FROM template_log").fetchone()
        return {"count": r[0] if r else 0}
    finally:
        conn.close()


@router.post("/training/session")
def log_session(body: TrainingSession):
    conn = get_db()
    try:
        conn.execute("INSERT OR IGNORE INTO training_sessions (date, module, duration_min) VALUES (?, ?, ?)",
                     [body.date, body.module, body.duration_min])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.get("/calendar")
def get_calendar_dates(start: str, end: str):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT DISTINCT date FROM training_sessions WHERE date >= ? AND date <= ?",
            [start, end]).fetchall()
        return {"dates": [r["date"] for r in rows]}
    finally:
        conn.close()


@router.get("/calendar/day")
def get_day_detail(date: str):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT module, duration_min FROM training_sessions WHERE date = ?",
            [date]).fetchall()
        return {"sessions": [{"module": r["module"], "duration_min": r["duration_min"]} for r in rows]}
    finally:
        conn.close()


@router.post("/assessment")
def save_assessment(body: Assessment):
    conn = get_db()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO assessments (item, week, score, updated_at) VALUES (?, ?, ?, datetime('now','localtime'))",
            [body.item, body.week, body.score])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.post("/import/exercises")
def import_exercises(body: ImportExercises):
    conn = get_db()
    try:
        count = 0
        for row in body.rows:
            if len(row) >= 6:
                conn.execute(
                    "INSERT INTO exercises (module, type, question, options_json, answer, explanation, content) VALUES (?, ?, ?, ?, ?, ?, '')",
                    [row[0] or '', row[1] or '', row[2] or '', row[3] or '', row[4] or '', row[5] or ''])
                count += 1
        conn.commit()
        return {"ok": True, "count": count}
    finally:
        conn.close()
