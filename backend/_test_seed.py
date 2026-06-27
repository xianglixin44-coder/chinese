# -*- coding: utf-8 -*-
import sqlite3, json
from datetime import datetime, timezone

DB = 'trainer.db'
now = datetime.now(timezone.utc).isoformat()
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Fix seed q 6855
cur.execute('UPDATE exercises SET content=?, extra_json=? WHERE id=?', (
    open('backend/seed_data.py', encoding='utf-8').read()[:10],
    json.dumps({'source': '宋史·苏轼传'}),
    6855))
print('checked seed_data access')

# Count neirong
cur.execute("SELECT COUNT(*) FROM exercises WHERE module='classical_reading' AND type='neirong'")
print('Current neirong:', cur.fetchone()[0])
conn.close()
