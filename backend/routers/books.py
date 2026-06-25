"""参考书阅读 — 书架 + 分页阅读器"""
import os, re
from fastapi import APIRouter, Query
from fastapi.responses import PlainTextResponse

router = APIRouter(prefix="/api/books", tags=["books"])

EPUB_DIR = "/Users/xianglixin/Documents/epub/markdown_output"
EPUB2_DIR = "/Users/xianglixin/Documents/epub"
PDF_DIR = "/Users/xianglixin/Documents/所有PDF备份"

BOOKS = [
    {"id": "wangli", "title": "古代汉语", "author": "王力", "icon": "📗",
     "path": os.path.join(EPUB2_DIR, "古代汉语_王力.md"),
     "lines": 40873, "desc": "大学经典教材 · 文选+常用词+通论"},
    {"id": "24shi", "title": "二十四史全集", "author": "司马迁等", "icon": "📚",
     "path": os.path.join(EPUB_DIR, "二十四史（全集）.md"),
     "lines": 485011, "desc": "史记·汉书·后汉书·三国志…"},
    {"id": "bx1", "title": "语文 必修上册", "author": "统编教材", "icon": "📕",
     "path": os.path.join(PDF_DIR, "【人教版】高中必修 上册语文电子课本.pdf"),
     "lines": 0, "desc": "劝学·师说·赤壁赋·登泰山记·诗词"},
    {"id": "bx2", "title": "语文 必修下册", "author": "统编教材", "icon": "📕",
     "path": os.path.join(PDF_DIR, "【人教版】高中必修 下册语文电子课本.pdf"),
     "lines": 0, "desc": "论语·孟子·庄子·左传·史记·阿房宫赋"},
    {"id": "xx1", "title": "语文 选择性必修上册", "author": "统编教材", "icon": "📙",
     "path": os.path.join(PDF_DIR, "【人教版】高中选择性必修 上册语文电子课本.pdf"),
     "lines": 0, "desc": "论语十二章·大学·老子·庄子·墨子"},
    {"id": "xx2", "title": "语文 选择性必修中册", "author": "统编教材", "icon": "📙",
     "path": os.path.join(PDF_DIR, "【人教版】高中选择性必修 中册语文电子课本.pdf"),
     "lines": 0, "desc": "屈原·苏武·过秦论·五代史伶官传序"},
    {"id": "xx3", "title": "语文 选择性必修下册", "author": "统编教材", "icon": "📙",
     "path": os.path.join(PDF_DIR, "【人教版】高中选择性必修 下册语文电子课本.pdf"),
     "lines": 0, "desc": "氓·离骚·蜀道难·陈情表·兰亭集序"},
]

# Cache: pre-computed line offsets for each book
_line_offsets = {}

def _get_offsets(book_id):
    if book_id in _line_offsets:
        return _line_offsets[book_id]
    book = next((b for b in BOOKS if b["id"] == book_id), None)
    if not book or not os.path.exists(book["path"]):
        return []
    offsets = [0]
    with open(book["path"], "r", encoding="utf-8", errors="replace") as f:
        while True:
            line = f.readline()
            if not line:
                break
            offsets.append(f.tell())
    _line_offsets[book_id] = offsets
    return offsets


@router.get("")
def list_books():
    """书架列表"""
    result = []
    for b in BOOKS:
        exists = os.path.exists(b["path"])
        result.append({
            "id": b["id"], "title": b["title"], "author": b["author"],
            "icon": b["icon"], "desc": b["desc"],
            "lines": b["lines"], "exists": exists
        })
    return {"books": result}


@router.get("/{book_id}", response_class=PlainTextResponse)
def read_book(
    book_id: str,
    page: int = Query(1, ge=1, description="页码，从1开始"),
    size: int = Query(300, ge=50, le=1000, description="每页行数"),
):
    """分页阅读 — 返回纯文本"""
    book = next((b for b in BOOKS if b["id"] == book_id), None)
    if not book:
        return "书未找到"

    # For PDF textbooks, try to extract text
    path = book["path"]
    if path.endswith(".pdf"):
        txt_path = f"/tmp/{book_id}.txt"
        if not os.path.exists(txt_path):
            import subprocess
            subprocess.run(["pdftotext", "-layout", path, txt_path], capture_output=True)
        if os.path.exists(txt_path):
            path = txt_path
        else:
            return "PDF提取失败，请确保 pdftotext 已安装"

    if not os.path.exists(path):
        return "文件不存在"

    offsets = _get_offsets(book_id)
    if not offsets:
        offsets = _get_offsets_direct(path, book_id)

    total_lines = len(offsets) - 1
    total_pages = max(1, (total_lines + size - 1) // size)

    start_line = (page - 1) * size
    if start_line >= total_lines:
        return f"--- 已到末尾，共 {total_pages} 页 ---"

    end_line = min(start_line + size, total_lines)

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        f.seek(offsets[start_line])
        lines = []
        for _ in range(end_line - start_line):
            line = f.readline()
            if not line:
                break
            lines.append(line.rstrip())

    header = f"📖 {book['title']} — {book['author']}\n"
    header += f"第 {page}/{total_pages} 页 · 共 {total_lines} 行\n"
    header += "─" * 50 + "\n\n"

    footer = f"\n\n{'─' * 50}\n"
    footer += f"第 {page}/{total_pages} 页"
    if page < total_pages:
        footer += f"  |  下一页: ?page={page+1}"
    if page > 1:
        footer += f"  |  上一页: ?page={page-1}"

    return header + "\n".join(lines) + footer


def _get_offsets_direct(path, book_id):
    """Fallback offset calculation"""
    offsets = [0]
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        while True:
            line = f.readline()
            if not line:
                break
            offsets.append(f.tell())
    _line_offsets[book_id] = offsets
    return offsets
