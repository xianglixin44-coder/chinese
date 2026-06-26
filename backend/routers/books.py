"""参考书阅读 — 书架 + 分页阅读器（流式跳行，无预扫描）"""
import os, itertools, json, subprocess
from fastapi import APIRouter, Query
from fastapi.responses import PlainTextResponse, FileResponse

router = APIRouter(prefix="/api/books", tags=["books"])

EPUB_DIR = "/Users/xianglixin/Documents/epub/markdown_output"
EPUB2_DIR = "/Users/xianglixin/Documents/epub"
PDF_DIR = "/Users/xianglixin/Documents/所有PDF备份"
CACHE_DIR = "/Users/xianglixin/Documents/chinese/.cache"

BOOKS = [
    {"id": "wangli", "title": "古代汉语", "author": "王力", "icon": "📗",
     "path": os.path.join(EPUB2_DIR, "古代汉语_王力.md"),
     "lines": 40873, "format": "md", "desc": "大学经典教材 · 文选+常用词+通论"},
    {"id": "24shi", "title": "二十四史全集", "author": "司马迁等", "icon": "📚",
     "path": os.path.join(EPUB_DIR, "二十四史（全集）.md"),
     "lines": 485011, "format": "md", "desc": "史记·汉书·后汉书·三国志…"},
    {"id": "bx1", "title": "语文 必修上册", "author": "统编教材", "icon": "📕",
     "path": os.path.join(PDF_DIR, "【人教版】高中必修 上册语文电子课本.pdf"),
     "lines": 0, "format": "pdf", "desc": "劝学·师说·赤壁赋·登泰山记·诗词"},
    {"id": "bx2", "title": "语文 必修下册", "author": "统编教材", "icon": "📕",
     "path": os.path.join(PDF_DIR, "【人教版】高中必修 下册语文电子课本.pdf"),
     "lines": 0, "format": "pdf", "desc": "论语·孟子·庄子·左传·史记·阿房宫赋"},
    {"id": "xx1", "title": "语文 选择性必修上册", "author": "统编教材", "icon": "📙",
     "path": os.path.join(PDF_DIR, "【人教版】高中选择性必修 上册语文电子课本.pdf"),
     "lines": 0, "format": "pdf", "desc": "论语十二章·大学·老子·庄子·墨子"},
    {"id": "xx2", "title": "语文 选择性必修中册", "author": "统编教材", "icon": "📙",
     "path": os.path.join(PDF_DIR, "【人教版】高中选择性必修 中册语文电子课本.pdf"),
     "lines": 0, "format": "pdf", "desc": "屈原·苏武·过秦论·五代史伶官传序"},
    {"id": "xx3", "title": "语文 选择性必修下册", "author": "统编教材", "icon": "📙",
     "path": os.path.join(PDF_DIR, "【人教版】高中选择性必修 下册语文电子课本.pdf"),
     "lines": 0, "format": "pdf", "desc": "氓·离骚·蜀道难·陈情表·兰亭集序"},
]

# ── 磁盘缓存：总行数（服务器重启不丢失） ──
os.makedirs(CACHE_DIR, exist_ok=True)

def _load_line_cache():
    """加载磁盘缓存的各书总行数"""
    cache_file = os.path.join(CACHE_DIR, "book_lines.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file) as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_line_cache(cache):
    with open(os.path.join(CACHE_DIR, "book_lines.json"), "w") as f:
        json.dump(cache, f)

_line_cache = _load_line_cache()

def _count_lines(path):
    """快速统计文件行数（仅首次，结果写入磁盘缓存）"""
    count = 0
    with open(path, "rb") as f:
        # 使用二进制模式 + 内存映射风格块读取，比逐行快 10-50x
        while True:
            chunk = f.read(1024 * 1024)  # 1MB chunks
            if not chunk:
                break
            count += chunk.count(b"\n")
    return count

def _resolve_path(book):
    """解析书本的实际读取路径（PDF → 提取 txt）"""
    path = book["path"]
    if path.endswith(".pdf"):
        txt_path = os.path.join(CACHE_DIR, f"{book['id']}.txt")
        if not os.path.exists(txt_path):
            subprocess.run(
                ["pdftotext", "-layout", "-nopgbrk", path, txt_path],
                capture_output=True, timeout=60
            )
        if os.path.exists(txt_path) and os.path.getsize(txt_path) > 100:
            path = txt_path
            # 更新缓存行数
            if book["id"] not in _line_cache:
                _line_cache[book["id"]] = _count_lines(path)
                _save_line_cache(_line_cache)
        else:
            return None
    return path

@router.get("")
def list_books():
    """书架列表"""
    result = []
    for b in BOOKS:
        exists = os.path.exists(b["path"])
        result.append({
            "id": b["id"], "title": b["title"], "author": b["author"],
            "icon": b["icon"], "desc": b["desc"],
            "lines": b["lines"], "format": b.get("format","md"), "exists": exists
        })
    return {"books": result}

@router.get("/{book_id}/file")
def serve_book_file(book_id: str):
    """直接返回书本原始文件（PDF 等）"""
    book = next((b for b in BOOKS if b["id"] == book_id), None)
    if not book:
        return PlainTextResponse("书未找到", status_code=404)
    path = book["path"]
    if not os.path.exists(path):
        return PlainTextResponse("文件不存在", status_code=404)
    media_type = "application/pdf" if path.endswith(".pdf") else "text/plain; charset=utf-8"
    resp = FileResponse(path, media_type=media_type)
    if path.endswith(".pdf"):
        resp.headers["Content-Disposition"] = "inline"
    return resp

@router.get("/{book_id}", response_class=PlainTextResponse)
def read_book(
    book_id: str,
    page: int = Query(1, ge=1, description="页码，从1开始"),
    size: int = Query(300, ge=50, le=1000, description="每页行数"),
):
    """分页阅读 — 流式跳行，无预扫描"""
    book = next((b for b in BOOKS if b["id"] == book_id), None)
    if not book:
        return "书未找到"

    path = _resolve_path(book)
    if not path or not os.path.exists(path):
        return "文件不存在"

    # 获取总行数（优先磁盘缓存）
    total_lines = _line_cache.get(book_id)
    if total_lines is None:
        total_lines = _count_lines(path)
        _line_cache[book_id] = total_lines
        _save_line_cache(_line_cache)

    total_pages = max(1, (total_lines + size - 1) // size)

    start_line = (page - 1) * size
    if start_line >= total_lines:
        return f"--- 已到末尾，共 {total_pages} 页 ---"

    # ── 核心：islice 流式跳行，不预扫描 ──
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        lines = list(itertools.islice(f, start_line, start_line + size))

    header = f"📖 {book['title']} — {book['author']}\n"
    header += f"第 {page}/{total_pages} 页 · 共 {total_lines} 行\n"
    header += "─" * 50 + "\n\n"

    footer = f"\n\n{'─' * 50}\n"
    footer += f"第 {page}/{total_pages} 页"
    if page < total_pages:
        footer += f"  |  下一页: ?page={page+1}"
    if page > 1:
        footer += f"  |  上一页: ?page={page-1}"

    return header + "".join(lines) + footer
