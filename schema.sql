-- 语文提高训练 · 共享数据库 Schema
-- 用于 backend/database.py 和 frontend sql.js 双端

CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL REFERENCES modules(id),
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

CREATE TABLE IF NOT EXISTS training_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL REFERENCES modules(id),
    exercise_id INTEGER DEFAULT 0,
    question TEXT DEFAULT '',
    user_answer TEXT DEFAULT '',
    correct_answer TEXT DEFAULT '',
    is_correct INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    correction_note TEXT DEFAULT '',
    reviewed INTEGER DEFAULT 0,
    attempt_count INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_tlog_module ON training_log(module);
CREATE INDEX IF NOT EXISTS idx_tlog_correct ON training_log(is_correct);
CREATE INDEX IF NOT EXISTS idx_tlog_date ON training_log(created_at);

CREATE TABLE IF NOT EXISTS wrong_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER,
    module TEXT DEFAULT '',
    question_type TEXT DEFAULT '',
    question TEXT DEFAULT '',
    user_answer TEXT DEFAULT '',
    correct_answer TEXT DEFAULT '',
    explanation TEXT DEFAULT '',
    wrong_count INTEGER DEFAULT 1,
    wrong_at TEXT DEFAULT (datetime('now','localtime')),
    reviewed INTEGER DEFAULT 0
);
