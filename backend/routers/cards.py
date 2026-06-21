from fastapi import APIRouter
from backend.database import get_db
from backend.models import FlashcardLog, TemplateLog, CardSRS, Assessment, ImportExercises

router = APIRouter(prefix="/api", tags=["cards"])

@router.post("/flashcard/log")
def log_flashcard(body: FlashcardLog):
    conn = get_db()
    try:
        conn.execute("INSERT INTO flashcard_log (deck, card_word, rating) VALUES (?, ?, ?)", [body.deck, body.card_word, body.rating])
        conn.execute("INSERT OR IGNORE INTO training_sessions (date, module, duration_min) VALUES (date('now','localtime'), '闪卡', 5)")
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()

@router.post("/template/log")
def log_template(body: TemplateLog):
    conn = get_db()
    try:
        conn.execute("INSERT INTO template_log (combo_a, combo_b, combo_c, topic) VALUES (?, ?, ?, ?)", [body.combo_a, body.combo_b, body.combo_c, body.topic[:200]])
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

@router.put("/card-srs")
def update_card_srs(body: CardSRS):
    conn = get_db()
    try:
        if body.interval_days is not None:
            conn.execute("INSERT OR REPLACE INTO card_srs (deck, card_idx, interval_days, repetitions, next_review, mastered) VALUES (?, ?, ?, ?, ?, ?)", [body.deck, body.card_idx, body.interval_days, body.repetitions or 0, body.next_review or '', body.mastered or 0])
        elif body.rating == "easy":
            conn.execute("UPDATE card_srs SET repetitions=repetitions+1, interval_days=MAX(interval_days*2,1), next_review=date('now','localtime','+'||MAX(interval_days*2,1)||' days'), mastered=1 WHERE deck=? AND card_idx=?", [body.deck, body.card_idx])
            conn.execute("INSERT OR IGNORE INTO card_srs VALUES (?, ?, 1, 1, date('now','localtime','+1 days'), 1)", [body.deck, body.card_idx])
        elif body.rating == "hard":
            conn.execute("UPDATE card_srs SET repetitions=repetitions+1, next_review=date('now','localtime','+1 days') WHERE deck=? AND card_idx=?", [body.deck, body.card_idx])
            conn.execute("INSERT OR IGNORE INTO card_srs VALUES (?, ?, 0, 1, date('now','localtime','+1 days'), 0)", [body.deck, body.card_idx])
        else:
            conn.execute("INSERT OR IGNORE INTO card_srs VALUES (?, ?, 0, 1, date('now','localtime'), 0)", [body.deck, body.card_idx])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()

@router.post("/assessment")
def save_assessment(body: Assessment):
    conn = get_db()
    try:
        conn.execute("INSERT OR REPLACE INTO assessments (item, week, score, updated_at) VALUES (?, ?, ?, datetime('now','localtime'))", [body.item, body.week, body.score])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()

@router.post("/import/exercises")
def import_exercises(body: ImportExercises):
    conn = get_db()
    try:
        count = 0
        for row in body.rows if hasattr(body, 'rows') else []:
            if len(row) >= 6:
                conn.execute("INSERT INTO imported_exercises (module, ex_type, question, options_json, answer, explanation) VALUES (?, ?, ?, ?, ?, ?)", [row[0] or '', row[1] or '', row[2] or '', row[3] or '', row[4] or '', row[5] or ''])
                count += 1
        conn.commit()
        return {"ok": True, "count": count}
    finally:
        conn.close()
