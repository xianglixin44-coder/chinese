"""种子数据 — 语法病句 + 写作表达（从 CSV 导入 exercises 表）。

数据源：
  工具包/练习表格/语法病句_9题.csv
  工具包/练习表格/写作表达_9题.csv
"""
import csv, json
from pathlib import Path

CSV_DIR = Path(__file__).parent.parent / "工具包" / "练习表格"

SEEDS = [
    ("语法病句_9题.csv", "grammar"),
    ("写作表达_9题.csv", "writing"),
]


def seed_grammar_writing(conn):
    """仅在对应模块无题目时导入。"""
    for filename, module in SEEDS:
        existing = conn.execute(
            "SELECT COUNT(*) FROM exercises WHERE module = ?", [module]
        ).fetchone()
        if existing and existing[0] > 0:
            continue  # 已有数据，跳过

        csv_path = CSV_DIR / filename
        if not csv_path.exists():
            print(f"  ⚠ seed_grammar_writing: {csv_path} 不存在，跳过")
            continue

        count = 0
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                etype = row.get("type", "").strip()
                content = row.get("content", "").strip()
                question = row.get("question", "").strip()
                options_json = row.get("options_json", "[]").strip()
                answer = row.get("answer", "").strip()
                explanation = row.get("explanation", "").strip()

                # 标准化 module（CSV 中可能写 grammar/writing，直接信任）
                mod = row.get("module", module).strip() or module

                if not content:
                    continue

                # 确保 options_json 是合法 JSON
                try:
                    parsed = json.loads(options_json)
                    options_json = json.dumps(parsed, ensure_ascii=False)
                except (json.JSONDecodeError, TypeError):
                    # 裸字符串 → 包装为数组
                    if options_json:
                        options_json = json.dumps([options_json], ensure_ascii=False)
                    else:
                        options_json = "[]"

                conn.execute(
                    "INSERT INTO exercises (module, type, content, question, options_json, answer, explanation) "
                    "VALUES (?,?,?,?,?,?,?)",
                    [mod, etype, content, question, options_json, answer, explanation],
                )
                count += 1

        conn.commit()
        print(f"  ✅ seed_grammar_writing: {module} 导入 {count} 题 ({filename})")
