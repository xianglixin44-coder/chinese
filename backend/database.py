"""SQLite database connection and schema initialization."""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "trainer.db"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS streak (id INTEGER PRIMARY KEY CHECK(id=1), count INTEGER DEFAULT 0, last_active TEXT);
        INSERT OR IGNORE INTO streak VALUES (1,0,'');

        CREATE TABLE IF NOT EXISTS flashcard_log (id INTEGER PRIMARY KEY AUTOINCREMENT, deck TEXT, card_word TEXT, rating TEXT, reviewed_at TEXT DEFAULT (datetime('now','localtime')));

        CREATE TABLE IF NOT EXISTS template_log (id INTEGER PRIMARY KEY AUTOINCREMENT, combo_a TEXT, combo_b TEXT, combo_c TEXT, topic TEXT, created_at TEXT DEFAULT (datetime('now','localtime')));

        CREATE TABLE IF NOT EXISTS grammar_log (id INTEGER PRIMARY KEY AUTOINCREMENT, sentence TEXT, example_idx INTEGER, module TEXT, created_at TEXT DEFAULT (datetime('now','localtime')));

        CREATE TABLE IF NOT EXISTS assessments (item TEXT, week INTEGER, score INTEGER DEFAULT 0, updated_at TEXT DEFAULT (datetime('now','localtime')), PRIMARY KEY(item, week));

        CREATE TABLE IF NOT EXISTS training_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, module TEXT, duration_min INTEGER, created_at TEXT DEFAULT (datetime('now','localtime')));

        CREATE TABLE IF NOT EXISTS imported_exercises (id INTEGER PRIMARY KEY AUTOINCREMENT, module TEXT, ex_type TEXT, question TEXT, options_json TEXT, answer TEXT, explanation TEXT, created_at TEXT DEFAULT (datetime('now','localtime')));

        CREATE TABLE IF NOT EXISTS card_srs (deck TEXT, card_idx INTEGER, interval_days INTEGER DEFAULT 0, repetitions INTEGER DEFAULT 0, next_review TEXT, mastered INTEGER DEFAULT 0, PRIMARY KEY(deck, card_idx));

        CREATE TABLE IF NOT EXISTS daily_tasks (date TEXT, task TEXT, PRIMARY KEY(date, task));

        -- ====== 题库表 ======
        CREATE TABLE IF NOT EXISTS flashcard_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            front TEXT NOT NULL,
            hl TEXT NOT NULL,
            word TEXT NOT NULL,
            meaning TEXT NOT NULL,
            analogy TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS modern_reading (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            passage_type TEXT NOT NULL,
            title TEXT DEFAULT '',
            passage TEXT NOT NULL,
            question TEXT NOT NULL,
            options_json TEXT NOT NULL,
            answer_idx INTEGER NOT NULL,
            explanation TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS classical_reading (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_type TEXT NOT NULL,
            passage TEXT DEFAULT '',
            question TEXT NOT NULL,
            options_json TEXT DEFAULT '[]',
            answer TEXT NOT NULL,
            explanation TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS writing_prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT NOT NULL,
            template_hint TEXT DEFAULT '',
            sample_answer TEXT DEFAULT '',
            scoring_guide TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS grammar_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_type TEXT NOT NULL,
            sentence TEXT NOT NULL,
            options_json TEXT DEFAULT '[]',
            answer TEXT NOT NULL,
            explanation TEXT DEFAULT '',
            points TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );
    """)
    conn.commit()
    conn.close()
