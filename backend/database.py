"""SQLite database connection and schema initialization."""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "trainer.db"
SCHEMA_PATH = Path(__file__).parent.parent / "schema.sql"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    conn.executescript(schema)
    conn.execute("INSERT OR IGNORE INTO streak VALUES (1,0,'')")
    conn.execute("INSERT OR IGNORE INTO modules VALUES ('flashcard','闪卡','🃏',1)")
    conn.execute("INSERT OR IGNORE INTO modules VALUES ('modern_reading','现代文阅读','📖',2)")
    conn.execute("INSERT OR IGNORE INTO modules VALUES ('classical_reading','古诗文阅读','🏛️',3)")
    conn.execute("INSERT OR IGNORE INTO modules VALUES ('grammar','语言文字运用','✍️',4)")
    conn.execute("INSERT OR IGNORE INTO modules VALUES ('writing','写作表达','📝',5)")
    conn.commit()

    # 种子数据（仅在表为空时填充）
    from backend.seed_data import seed_flashcard_items, seed_methods, seed_wenhua
    from backend.seed_grammar_writing import seed_grammar_writing
    from backend.seed_modern_reading import seed_modern_reading
    from backend.seed_moxie import seed_moxie
    from backend.seed_translation import seed_translation
    from backend.seed_neirong_supplement import seed_neirong
    from backend.seed_duanju_wangli import seed_duanju
    seed_flashcard_items(conn)
    seed_methods(conn)
    seed_wenhua(conn)
    seed_grammar_writing(conn)
    seed_modern_reading(conn)
    seed_moxie(conn)
    seed_translation(conn)
    seed_neirong(conn)
    seed_duanju(conn)
    conn.commit()
    conn.close()
