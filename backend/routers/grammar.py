from fastapi import APIRouter
from backend.database import get_db
from backend.models import GrammarLog, TrainingSession

router = APIRouter(prefix="/api", tags=["grammar"])

@router.post("/grammar/log")
def log_grammar(body: GrammarLog):
    conn = get_db()
    try:
        conn.execute("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, ?)", [body.sentence, body.example_idx, body.module])
        conn.execute("INSERT OR IGNORE INTO training_sessions (date, module, duration_min) VALUES (date('now','localtime'), '语法', 5)")
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()

@router.get("/stats/grammar")
def get_grammar_count():
    conn = get_db()
    try:
        r = conn.execute("SELECT COUNT(*) FROM grammar_log").fetchone()
        return {"count": r[0] if r else 0}
    finally:
        conn.close()

@router.post("/training/session")
def log_session(body: TrainingSession):
    conn = get_db()
    try:
        conn.execute("INSERT OR IGNORE INTO training_sessions (date, module, duration_min) VALUES (?, ?, ?)", [body.date, body.module, body.duration_min])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()

@router.get("/calendar")
def get_calendar(start: str, end: str):
    conn = get_db()
    try:
        rows = conn.execute("SELECT DISTINCT date FROM training_sessions WHERE date >= ? AND date <= ?", [start, end]).fetchall()
        return {"dates": [r["date"] for r in rows]}
    finally:
        conn.close()

@router.get("/calendar/day")
def get_day_detail(date: str):
    conn = get_db()
    try:
        rows = conn.execute("SELECT module, duration_min FROM training_sessions WHERE date = ?", [date]).fetchall()
        return {"sessions": [{"module": r["module"], "duration_min": r["duration_min"]} for r in rows]}
    finally:
        conn.close()
