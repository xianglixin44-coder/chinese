-- 语文提高训练 · 共享数据库 Schema
-- 用于 backend/database.py 和 frontend sql.js 双端

CREATE TABLE IF NOT EXISTS streak (
    id INTEGER PRIMARY KEY CHECK(id=1),
    count INTEGER DEFAULT 0,
    last_active TEXT
);

CREATE TABLE IF NOT EXISTS flashcard_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck TEXT,
    card_word TEXT,
    rating TEXT,
    reviewed_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS template_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    combo_a TEXT,
    combo_b TEXT,
    combo_c TEXT,
    topic TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS grammar_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sentence TEXT,
    example_idx INTEGER,
    module TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS assessments (
    item TEXT,
    week INTEGER,
    score INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now','localtime')),
    PRIMARY KEY(item, week)
);

CREATE TABLE IF NOT EXISTS training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    module TEXT,
    duration_min INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS imported_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT,
    ex_type TEXT,
    question TEXT,
    options_json TEXT,
    answer TEXT,
    explanation TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS card_srs (
    deck TEXT,
    card_idx INTEGER,
    interval_days INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    next_review TEXT,
    mastered INTEGER DEFAULT 0,
    PRIMARY KEY(deck, card_idx)
);

CREATE TABLE IF NOT EXISTS daily_tasks (
    date TEXT,
    task TEXT,
    PRIMARY KEY(date, task)
);

CREATE TABLE IF NOT EXISTS daily_assignments (
    date TEXT,
    module TEXT,
    exercise_id INTEGER,
    completed INTEGER DEFAULT 0,
    PRIMARY KEY(date, module)
);

CREATE TABLE IF NOT EXISTS methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT '',
    content_html TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    category TEXT DEFAULT '',
    question_type TEXT DEFAULT '',
    title TEXT DEFAULT '',
    content TEXT NOT NULL,
    options_json TEXT DEFAULT '[]',
    answer TEXT DEFAULT '',
    explanation TEXT DEFAULT '',
    meta_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
