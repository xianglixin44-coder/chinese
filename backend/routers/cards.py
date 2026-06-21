"""Routes: flashcard, card-srs."""
from fastapi import APIRouter
from ..database import get_db
from ..models import FlashcardLog, CardSRS

router = APIRouter(prefix="/api", tags=["cards"])


@router.post("/flashcard/log")
def log_flashcard(body: FlashcardLog):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO flashcard_log (deck, card_word, rating) VALUES (?, ?, ?)",
            [body.deck, body.card_word, body.rating])
        conn.execute(
            "INSERT OR IGNORE INTO training_sessions (date, module, duration_min) VALUES (date('now','localtime'), '闪卡', 5)")
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@router.put("/card-srs")
def update_card_srs(body: CardSRS):
    conn = get_db()
    try:
        if body.interval_days is not None:
            conn.execute(
                "INSERT OR REPLACE INTO card_srs (deck, card_idx, interval_days, repetitions, next_review, mastered) VALUES (?, ?, ?, ?, ?, ?)",
                [body.deck, body.card_idx, body.interval_days, body.repetitions or 0, body.next_review or '', body.mastered or 0])
        elif body.rating == "easy":
            conn.execute(
                "UPDATE card_srs SET repetitions=repetitions+1, interval_days=MAX(interval_days*2,1), next_review=date('now','localtime','+'||MAX(interval_days*2,1)||' days'), mastered=1 WHERE deck=? AND card_idx=?",
                [body.deck, body.card_idx])
            conn.execute(
                "INSERT OR IGNORE INTO card_srs (deck, card_idx, interval_days, repetitions, next_review, mastered) VALUES (?, ?, 1, 1, date('now','localtime','+1 days'), 1)",
                [body.deck, body.card_idx])
        elif body.rating == "hard":
            conn.execute(
                "UPDATE card_srs SET repetitions=repetitions+1, next_review=date('now','localtime','+1 days') WHERE deck=? AND card_idx=?",
                [body.deck, body.card_idx])
            conn.execute(
                "INSERT OR IGNORE INTO card_srs (deck, card_idx, interval_days, repetitions, next_review, mastered) VALUES (?, ?, 0, 1, date('now','localtime','+1 days'), 0)",
                [body.deck, body.card_idx])
        else:
            conn.execute(
                "INSERT OR IGNORE INTO card_srs (deck, card_idx, interval_days, repetitions, next_review, mastered) VALUES (?, ?, 0, 1, date('now','localtime'), 0)",
                [body.deck, body.card_idx])
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()
