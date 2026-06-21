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

        CREATE TABLE IF NOT EXISTS daily_assignments (
            date TEXT NOT NULL,
            module TEXT NOT NULL,
            exercise_id INTEGER NOT NULL,
            completed INTEGER DEFAULT 0,
            score INTEGER,
            PRIMARY KEY(date, module)
        );

        CREATE TABLE IF NOT EXISTS methods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sort_order INTEGER DEFAULT 0,
            icon TEXT DEFAULT '',
            title TEXT NOT NULL,
            source TEXT DEFAULT '',
            description TEXT DEFAULT '',
            target_module TEXT DEFAULT '',
            target_page TEXT DEFAULT '',
            extra_json TEXT DEFAULT '{}',
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        -- ====== 统一题库表（module + type 区分题型，extra_json 存类型特有字段）======
        CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module TEXT NOT NULL,
            type TEXT DEFAULT '',
            title TEXT DEFAULT '',
            content TEXT NOT NULL,
            question TEXT DEFAULT '',
            options_json TEXT DEFAULT '[]',
            answer TEXT DEFAULT '',
            explanation TEXT DEFAULT '',
            extra_json TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now','localtime'))
        );
        CREATE INDEX IF NOT EXISTS idx_exercises_module ON exercises(module);
        CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type);
    """)
    conn.commit()
    # 从旧 5 表迁移数据到统一 exercises 表（仅首次执行）
    _migrate_old_tables(conn)
    # 为 exercises 表补充新增字段（兼容旧版本 DB）
    _migrate_exercises_columns(conn)
    # 首次启动时填充种子闪卡数据
    from .seed_data import seed_flashcard_items, seed_methods
    seed_flashcard_items(conn)
    seed_methods(conn)
    conn.close()


def _migrate_exercises_columns(conn):
    """为 exercises 表补充后续新增字段（幂等，已存在则跳过）。"""
    cols = {r[1] for r in conn.execute("PRAGMA table_info(exercises)").fetchall()}
    additions = [
        ("last_practiced_at", "TEXT DEFAULT ''"),
        ("practice_count", "INTEGER DEFAULT 0"),
        ("source", "TEXT DEFAULT 'seed'"),
        ("status", "TEXT DEFAULT 'active'"),
        ("method_id", "INTEGER DEFAULT 0"),
    ]
    for name, typedef in additions:
        if name not in cols:
            conn.execute(f"ALTER TABLE exercises ADD COLUMN {name} {typedef}")
    conn.commit()


def _migrate_old_tables(conn):
    """将旧版 5 张题库表数据迁移到统一 exercises 表，完成后删除旧表。"""
    import json

    # 检查旧表是否存在
    old_tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN "
        "('flashcard_items','modern_reading','classical_reading','writing_prompts','grammar_exercises')"
    ).fetchall()
    if not old_tables:
        return  # 已是新版 schema，无需迁移

    # 仅在 exercises 表为空时执行迁移（避免重复）
    existing = conn.execute("SELECT COUNT(*) FROM exercises").fetchone()
    if existing and existing[0] > 0:
        # exercises 已有数据，直接删除旧表
        for (tname,) in old_tables:
            conn.execute(f"DROP TABLE IF EXISTS {tname}")
        conn.commit()
        return

    table_names = {r[0] for r in old_tables}

    # 1) flashcard_items → exercises
    if "flashcard_items" in table_names:
        rows = conn.execute("SELECT * FROM flashcard_items").fetchall()
        for r in rows:
            extra = json.dumps({
                "hl": r["hl"], "word": r["word"],
                "meaning": r["meaning"], "analogy": r["analogy"] or ""
            }, ensure_ascii=False)
            conn.execute(
                "INSERT INTO exercises (module, type, content, extra_json) VALUES (?,?,?,?)",
                ["flashcard", r["category"], r["front"], extra]
            )

    # 2) modern_reading → exercises
    if "modern_reading" in table_names:
        rows = conn.execute("SELECT * FROM modern_reading").fetchall()
        for r in rows:
            extra = json.dumps({"answer_idx": r["answer_idx"]}, ensure_ascii=False)
            conn.execute(
                "INSERT INTO exercises (module, type, title, content, question, options_json, answer, explanation, extra_json) VALUES (?,?,?,?,?,?,?,?,?)",
                ["modern_reading", r["passage_type"], r["title"] or "", r["passage"],
                 r["question"], r["options_json"], str(r["answer_idx"]), r["explanation"] or "", extra]
            )

    # 3) classical_reading → exercises
    if "classical_reading" in table_names:
        rows = conn.execute("SELECT * FROM classical_reading").fetchall()
        for r in rows:
            conn.execute(
                "INSERT INTO exercises (module, type, content, question, options_json, answer, explanation) VALUES (?,?,?,?,?,?,?)",
                ["classical_reading", r["question_type"], r["passage"] or "",
                 r["question"], r["options_json"], r["answer"], r["explanation"] or ""]
            )

    # 4) writing_prompts → exercises
    if "writing_prompts" in table_names:
        rows = conn.execute("SELECT * FROM writing_prompts").fetchall()
        for r in rows:
            extra = json.dumps({
                "template_hint": r["template_hint"] or "",
                "sample_answer": r["sample_answer"] or "",
                "scoring_guide": r["scoring_guide"] or ""
            }, ensure_ascii=False)
            conn.execute(
                "INSERT INTO exercises (module, content, extra_json) VALUES (?,?,?)",
                ["writing", r["prompt"], extra]
            )

    # 5) grammar_exercises → exercises
    if "grammar_exercises" in table_names:
        rows = conn.execute("SELECT * FROM grammar_exercises").fetchall()
        for r in rows:
            extra = json.dumps({"points": r["points"] or ""}, ensure_ascii=False)
            conn.execute(
                "INSERT INTO exercises (module, type, content, options_json, answer, explanation, extra_json) VALUES (?,?,?,?,?,?,?)",
                ["grammar", r["question_type"], r["sentence"],
                 r["options_json"], r["answer"], r["explanation"] or "", extra]
            )

    conn.commit()

    # 删除旧表
    for (tname,) in old_tables:
        conn.execute(f"DROP TABLE IF EXISTS {tname}")
    conn.commit()
    print(f"Migrated {len(old_tables)} old exercise tables → unified exercises table")
