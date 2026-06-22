"""Routes: data export — CSV 导出."""
import csv, io
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from ..database import get_db

router = APIRouter(prefix="/api", tags=["export"])

EXPORT_TABLES = {
    "flashcards": {
        "table": "exercises",
        "where": "module='flashcard'",
        "columns": ["type", "content", "extra_json"],
        "headers": ["牌组", "front", "hl", "word", "meaning", "analogy"],
        "transform": lambda r: [
            r["type"],
            r["content"],
            _json_val(r["extra_json"], "hl"),
            _json_val(r["extra_json"], "word"),
            _json_val(r["extra_json"], "meaning"),
            _json_val(r["extra_json"], "analogy"),
        ],
    },
    "training_log": {
        "table": "training_log",
        "where": "1=1",
        "columns": ["module", "question", "user_answer", "correct_answer", "is_correct", "correction_note", "created_at"],
        "headers": ["模块", "题目", "用户答案", "正确答案", "对错", "纠错笔记", "时间"],
        "transform": lambda r: [
            r["module"], r["question"], r["user_answer"],
            r["correct_answer"], "正确" if r["is_correct"] else "错误",
            r["correction_note"], r["created_at"],
        ],
    },
    "methods": {
        "table": "methods",
        "where": "1=1",
        "columns": ["sort_order", "icon", "title", "source", "description", "target_module", "target_page", "extra_json"],
        "headers": ["排序", "图标", "标题", "来源", "描述", "目标模块", "目标页面", "extra_json"],
        "transform": lambda r: [r[c] for c in ["sort_order", "icon", "title", "source", "description", "target_module", "target_page", "extra_json"]],
    },
    "wrong_items": {
        "table": "wrong_items",
        "where": "1=1",
        "columns": ["module", "question", "user_answer", "correct_answer", "wrong_count", "wrong_at"],
        "headers": ["模块", "题目", "用户答案", "正确答案", "错误次数", "时间"],
        "transform": lambda r: [r["module"], r["question"], r["user_answer"], r["correct_answer"], str(r["wrong_count"]), r["wrong_at"]],
    },
}


def _json_val(raw, key):
    import json
    try:
        return json.loads(raw or "{}").get(key, "")
    except Exception:
        return ""


@router.get("/export/{dataset}")
def export_csv(dataset: str):
    """导出指定数据集为 CSV 文件"""
    cfg = EXPORT_TABLES.get(dataset)
    if not cfg:
        return {"error": f"unknown dataset: {dataset}"}

    conn = get_db()
    try:
        sql = f"SELECT {', '.join(cfg['columns'])} FROM {cfg['table']} WHERE {cfg['where']}"
        rows = conn.execute(sql).fetchall()
    finally:
        conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(cfg["headers"])
    for row in rows:
        writer.writerow(cfg["transform"](dict(row)))

    output.seek(0)
    filename = f"{dataset}_{_today()}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _today():
    from datetime import date
    return date.today().isoformat()
