# 语文提高训练 · 开发文档

> 面向高考语文的每日训练系统，覆盖现代文阅读、古诗文阅读、语言文字运用、写作表达四大模块。

---

## 1. 功能概览

### 1.1 每日训练 (Daily Training)

根据 `DAILY_PLAN` 配置，每天自动生成 19 道题目：

| 模块 | 子类型 | 题量 | 说明 |
|---|---|---|---|
| 现代文阅读 | 论述类 (discourse) | 3 | 单选，覆盖理解分析/论证分析/推断 |
| 语言文字运用 | 混合 (chengyu/bingju/biaodian/buxie/yasuo) | 5 | 选择+填空+压缩 |
| 古诗文阅读 | 断句 (duanju) | 2 | 文本输入 |
| 古诗文阅读 | 文化常识 (wenhua) | 2 | 单选 |
| 古诗文阅读 | 理解性默写 (moxie) | 2 | 文本输入 |
| 古诗文阅读 | 翻译 (translation) | 2 | 文本输入 |
| 古诗文阅读 | 内容理解 (neirong) | 2 | 单选 |
| 写作表达 | 作文 (essay) | 1 | 材料作文/任务驱动 |

**选题策略**: 按 `practice_count ASC, last_practiced_at ASC` 排序，优先出练习次数少、久未练习的题目，同方法/同来源题目集中出题以加深理解。

### 1.2 分模块独立训练

每个模块支持独立进入，不限于每日计划。配置：

| 模块 | 单次题量 |
|---|---|
| 现代文阅读 | 3 |
| 古诗文阅读 | 10 |
| 语言文字运用 | 5 |
| 写作表达 | 1 |

### 1.3 闪卡系统 (Flashcard)

- 1090 张古汉语实词/虚词/诗词/文学常识卡片
- SRS 间隔重复算法，支持评分 (again/hard/good/easy)
- 前端 SQLite (sql.js) 本地存储 SRS 状态

### 1.4 错题本 (Wrong Items)

- 答题错误自动收录
- 支持按模块筛选回顾
- 记录错误次数、用户答案、正确答案、解析

### 1.5 训练记录 (Training Log)

- 每题作答结果记录 (is_correct, score, user_answer)
- 训练时长追踪 (training_sessions)
- 连续打卡 (streak)

### 1.6 数据导入/导出

- `POST /api/exercises` — 单题 JSON 导入
- `POST /api/import` — 批量 CSV 导入
- `POST /api/export` — 全库 JSON 导出

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (SPA)                    │
│  index.html + js/*.js + css/style.css               │
│  ┌──────────────────────────────────────────────┐   │
│  │  app.js      导航/计时/每日训练调度           │   │
│  │  exercises.js  题目渲染/作答判定              │   │
│  │  flashcard.js  SRS 闪卡逻辑                   │   │
│  │  api.js       HTTP 客户端 + sql.js 本地存储   │   │
│  │  config.js    模块/页面常量配置               │   │
│  │  utils.js     工具函数                        │   │
│  │  data.js      内置数据 (旧版兼容)             │   │
│  └──────────────────────────────────────────────┘   │
│  前端本地 DB: sql.js (WebAssembly)                   │
│  - streak / flashcard_log / card_srs               │
│  - grammar_log / training_sessions                 │
│  - daily_tasks / wrong_items / training_log        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST
                       ▼
┌─────────────────────────────────────────────────────┐
│                 Backend (FastAPI)                     │
│  main.py — 入口 + 中间件 + 静态文件挂载              │
│  ┌──────────────────────────────────────────────┐   │
│  │  AuthMiddleware   Token 认证 (写操作保护)     │   │
│  │  CORSMiddleware   跨域开放                    │   │
│  └──────────────────────────────────────────────┘   │
│  backend/routers/                                    │
│  ┌───────────────┬────────────────────────────────┐  │
│  │ daily.py      │ 每日选题/作答/分模块训练      │  │
│  │ exercises.py  │ 题库 CRUD / 统计              │  │
│  │ cards.py      │ 闪卡 CRUD / SRS 更新          │  │
│  │ tasks.py      │ 每日任务/闪卡记录             │  │
│  │ grammar.py    │ 语法日志 / 统计               │  │
│  │ generic.py    │ 受限 SQL 执行 (白名单)        │  │
│  │ records.py    │ 训练记录 / 打卡               │  │
│  │ wrong.py      │ 错题本 CRUD                   │  │
│  │ training_log.py│ 统一训练日志                  │  │
│  │ methods.py    │ 学习方法管理                  │  │
│  │ export.py     │ 数据导出                     │  │
│  │ books.py      │ 书目/素材管理                │  │
│  └───────────────┴────────────────────────────────┘  │
│  backend/database.py — SQLite 连接 + Schema 初始化    │
│  backend/models.py  — Pydantic 请求/响应模型         │
│  backend/seed_*.py  — 种子数据脚本 (9个)             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              SQLite (trainer.db)                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  exercises     统一题库 (module + type 区分)   │  │
│  │  modules       模块注册                        │  │
│  │  daily_assignments  每日选题分配               │  │
│  │  training_log  统一训练记录                    │  │
│  │  wrong_items   错题本                          │  │
│  │  card_srs      闪卡 SRS 状态                   │  │
│  │  flashcard_log 闪卡记录                        │  │
│  │  grammar_log   语法练习记录                    │  │
│  │  template_log  写作模板记录                    │  │
│  │  training_sessions  训练时长                   │  │
│  │  daily_tasks   每日完成标记                    │  │
│  │  methods       学习方法                        │  │
│  │  assessments   评估记录                        │  │
│  │  streak        连续打卡                        │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. 技术栈

| 层级 | 技术 | 说明 |
|---|---|---|
| 后端框架 | FastAPI (Python 3) | 异步 REST API |
| 服务器 | Uvicorn | ASGI, port 3200 |
| 数据库 | SQLite | WAL 模式, 外键约束 |
| 前端 | Vanilla JS + HTML + CSS | 零框架, 约 6000 行 JS |
| 本地存储 | sql.js (WebAssembly) | 前端离线 SQLite |
| 打包 | build.sh (cat 拼接) | 零依赖合并 8 个 JS 文件为 bundle.js |
| 部署 | Docker / macOS LaunchAgent | 两种部署方式 |

---

## 4. 数据库设计

### 4.1 核心表: `exercises` (统一题库)

```sql
CREATE TABLE exercises (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    module     TEXT NOT NULL,        -- flashcard|modern_reading|classical_reading|grammar|writing
    type       TEXT DEFAULT '',      -- 子类型: discourse|literary|practical|chengyu|bingju|...
    title      TEXT DEFAULT '',
    content    TEXT NOT NULL,        -- 主体文本
    question   TEXT DEFAULT '',      -- 具体问题/题干
    options_json TEXT DEFAULT '[]',  -- JSON 数组: ["A.xx","B.xx",...]
    answer     TEXT DEFAULT '',      -- 答案 (选项索引或文本)
    explanation TEXT DEFAULT '',     -- 解析
    extra_json TEXT DEFAULT '{}',    -- 扩展字段 (如 flashcard: {hl,word,meaning})
    status     TEXT DEFAULT 'active',
    last_practiced_at TEXT,
    practice_count INTEGER DEFAULT 0,
    source     TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
```

**设计原则**: 单一表统一管理所有题型，`module` + `type` 区分题型，`extra_json` 存题型特有字段，避免多表维护。

### 4.2 模块注册

```sql
INSERT INTO modules VALUES
  ('flashcard',        '闪卡',       '🃏', 1),
  ('modern_reading',   '现代文阅读', '📖', 2),
  ('classical_reading','古诗文阅读', '🏛️', 3),
  ('grammar',          '语言文字运用','✍️', 4),
  ('writing',          '写作表达',   '📝', 5);
```

### 4.3 训练日志

`training_log` 记录每道题的作答结果 (is_correct, score, user_answer, correction_note)，支持 statistics 统计和错题回顾。

---

## 5. API 路由

### 5.1 每日训练

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/daily/session` | 生成当日选题 session |
| POST | `/api/daily/submit` | 提交单题作答 |
| POST | `/api/daily/complete` | 标记模块完成 |

### 5.2 题库管理

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/exercises?module=&type=&limit=&offset=` | 分页列表 |
| GET | `/api/exercises/counts` | 各模块/类型题量统计 |
| POST | `/api/exercises` | 新增题目 |
| PUT | `/api/exercises/{id}` | 更新题目 |
| DELETE | `/api/exercises/{id}` | 删除题目 |

### 5.3 闪卡

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/cards?deck=&limit=&offset=` | 闪卡列表 |
| POST | `/api/cards/srs` | 更新 SRS 状态 |
| POST | `/api/flashcard/log` | 记录闪卡评分 |

### 5.4 训练数据

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/streak` | 连续打卡天数 |
| POST | `/api/streak` | 更新打卡 |
| GET | `/api/stats/grammar` | 语法练习次数 |
| GET | `/api/stats/cards` | 闪卡复习统计 |
| GET | `/api/wrong?module=` | 错题列表 |
| POST | `/api/wrong` | 添加错题 |
| PUT | `/api/wrong/{id}/review` | 标记已复习 |
| POST | `/api/log` | 写训练日志 |
| GET | `/api/log/stats?module=&days=` | 训练统计 |

---

## 6. 部署

### 6.1 macOS LaunchAgent (开机自启)

```bash
cp com.chinese.trainer.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.chinese.trainer.plist
```

### 6.2 Docker

```bash
docker compose up -d
```

端口映射 `3200:3200`，数据库卷挂载 `./trainer.db:/app/trainer.db`。

### 6.3 手动启动

```bash
cd ~/Documents/chinese
.venv/bin/python main.py
# → http://localhost:3200
```

### 6.4 生产构建

```bash
./build.sh           # 合并 JS 为 bundle.js
```

---

## 7. 种子数据

启动时 `init_db()` 自动检查空表并填充。种子脚本位于 `backend/seed_*.py`：

| 脚本 | 模块 | 内容 |
|---|---|---|
| `seed_data.py` | flashcard | 古汉语实词/虚词/诗词/文学常识 (1090) |
| `seed_modern_reading.py` | modern_reading | 论述类/文学类/实用类阅读 (77) |
| `seed_moxie.py` | classical_reading | 理解性默写 (91) |
| `seed_translation.py` | classical_reading | 文言翻译 (104) |
| `seed_neirong_supplement.py` | classical_reading | 内容理解 (60) |
| `seed_duanju_wangli.py` | classical_reading | 文言断句 (42) |
| `seed_grammar_writing.py` | grammar + writing | 语言文字运用 (25) + 写作 (24) |
| `seed_fenci_chapter2.py` | — | 分词素材 (备用) |

---

## 8. 题库统计 (2026-06-30)

```
flashcard          guhanyu      1030
flashcard          shici          20
flashcard          wenxue         20
flashcard          xuci           20
                                   ─── 1090

modern_reading     discourse      55
modern_reading     literary       12
modern_reading     practical      10
                                   ─── 77

classical_reading  duanju         42
classical_reading  moxie          91
classical_reading  neirong        60
classical_reading  translation   104
classical_reading  wenhua         53
                                   ─── 350

grammar            biaodian        5
grammar            bingju          5
grammar            buxie           5
grammar            chengyu         5
grammar            yasuo           5
                                   ─── 25

writing            essay          18
writing            scaffold        3
writing            semi_open       3
                                   ─── 24
                           TOTAL: 1566
```

---

## 9. 已知问题

1. **语言文字运用标点题**: 5 道破折号题选项完全相同 (A/B/C/D 不变)，答案都是 B，重复度过高。
2. **语言文字运用病句题**: 5 道全部为"由于……使"介词淹没主语，缺乏病因多样性。
3. **语法题量不足**: 25 题 → 每天 5 题 → 5 天循环，建议扩至 30-40 题。
4. **写作文体偏集**: 18 篇 essay 中发言稿/演讲稿占 ~10 篇，书信/短评/读后感比例偏低。
5. **旧写作题 929-931**: 要求 200-300 字，与高考 800 字标准不一致。
6. **文学类/实用类阅读**: 共 22 题 (~3 篇短文)，轮换空间有限。
7. **GitHub 推送需手动**: sandbox 环境无 SSH 凭据，需用户终端手动 `git push`。
