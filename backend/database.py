"""SQLite database connection and schema initialization."""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "trainer.db"
SCHEMA_PATH = Path(__file__).parent.parent / "schema.sql"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    conn.executescript(schema)
    conn.execute("INSERT OR IGNORE INTO streak VALUES (1,0,'')")
    conn.commit()
    conn.close()
