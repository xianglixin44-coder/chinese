"""Routes: grammar log, grammar stats."""
from fastapi import APIRouter
from ..database import get_db
from ..models import GrammarLog

router = APIRouter(prefix="/api", tags=["grammar"])


@router.post("/grammar/log")
def log_grammar(body: GrammarLog):
    conn = get_db()
    try:
        conn.execute("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, ?)",
                     [body.sentence, body.example_idx, body.module])
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
