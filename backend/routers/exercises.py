"""题库 CRUD 路由 — 闪卡/现代文/古诗文/写作/语法"""
from fastapi import APIRouter
from backend.database import get_db
from backend.models import (
    FlashcardItem, ModernReadingItem, ClassicalReadingItem,
    WritingPromptItem, GrammarExerciseItem, ExerciseQuery
)

router = APIRouter(prefix="/api/exercises", tags=["exercises"])

# ====== 闪卡题库 ======
@router.get("/flashcard")
def list_flashcards(category: str = "", limit: int = 100, offset: int = 0):
    conn = get_db()
    try:
        if category:
            rows = conn.execute(
                "SELECT * FROM flashcard_items WHERE category=? ORDER BY id LIMIT ? OFFSET ?",
                [category, limit, offset]).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM flashcard_items ORDER BY category, id LIMIT ? OFFSET ?",
                [limit, offset]).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()

@router.post("/flashcard")
def add_flashcard(body: FlashcardItem):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO flashcard_items (category, front, hl, word, meaning, analogy) VALUES (?,?,?,?,?,?)",
            [body.category, body.front, body.hl, body.word, body.meaning, body.analogy])
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()

# ====== 现代文阅读题库 ======
@router.get("/modern")
def list_modern(passage_type: str = "", limit: int = 50, offset: int = 0):
    conn = get_db()
    try:
        if passage_type:
            rows = conn.execute(
                "SELECT * FROM modern_reading WHERE passage_type=? ORDER BY id LIMIT ? OFFSET ?",
                [passage_type, limit, offset]).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM modern_reading ORDER BY passage_type, id LIMIT ? OFFSET ?",
                [limit, offset]).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()

@router.post("/modern")
def add_modern(body: ModernReadingItem):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO modern_reading (passage_type, title, passage, question, options_json, answer_idx, explanation) VALUES (?,?,?,?,?,?,?)",
            [body.passage_type, body.title, body.passage, body.question, body.options_json, body.answer_idx, body.explanation])
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()

# ====== 古诗文阅读题库 ======
@router.get("/classical")
def list_classical(question_type: str = "", limit: int = 50, offset: int = 0):
    conn = get_db()
    try:
        if question_type:
            rows = conn.execute(
                "SELECT * FROM classical_reading WHERE question_type=? ORDER BY id LIMIT ? OFFSET ?",
                [question_type, limit, offset]).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM classical_reading ORDER BY question_type, id LIMIT ? OFFSET ?",
                [limit, offset]).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()

@router.post("/classical")
def add_classical(body: ClassicalReadingItem):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO classical_reading (question_type, passage, question, options_json, answer, explanation) VALUES (?,?,?,?,?,?)",
            [body.question_type, body.passage, body.question, body.options_json, body.answer, body.explanation])
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()

# ====== 写作题库 ======
@router.get("/writing")
def list_writing(limit: int = 50, offset: int = 0):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM writing_prompts ORDER BY id LIMIT ? OFFSET ?",
            [limit, offset]).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()

@router.post("/writing")
def add_writing(body: WritingPromptItem):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO writing_prompts (prompt, template_hint, sample_answer, scoring_guide) VALUES (?,?,?,?)",
            [body.prompt, body.template_hint, body.sample_answer, body.scoring_guide])
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()

# ====== 语法练习题库 ======
@router.get("/grammar")
def list_grammar(question_type: str = "", limit: int = 50, offset: int = 0):
    conn = get_db()
    try:
        if question_type:
            rows = conn.execute(
                "SELECT * FROM grammar_exercises WHERE question_type=? ORDER BY id LIMIT ? OFFSET ?",
                [question_type, limit, offset]).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM grammar_exercises ORDER BY question_type, id LIMIT ? OFFSET ?",
                [limit, offset]).fetchall()
        return {"items": [dict(r) for r in rows]}
    finally:
        conn.close()

@router.post("/grammar")
def add_grammar(body: GrammarExerciseItem):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO grammar_exercises (question_type, sentence, options_json, answer, explanation, points) VALUES (?,?,?,?,?,?)",
            [body.question_type, body.sentence, body.options_json, body.answer, body.explanation, body.points])
        conn.commit()
        return {"ok": True, "id": conn.execute("SELECT last_insert_rowid()").fetchone()[0]}
    finally:
        conn.close()
