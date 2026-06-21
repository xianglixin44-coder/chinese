# 模块化拆分方案

> 当前 `index.html` (~800 行单体) 和 `app.js` (~770 行单体) 已达到维护瓶颈。
> 以下方案将二者拆分为独立片段，通过零依赖构建脚本合并为生产文件。

---

## 一、当前状态

| 文件 | 行数 | 包含内容 |
|------|------|----------|
| `index.html` | 812 | 10 个页面全部内联 + 侧边栏 + 计时器 |
| `app.js` | 774 | 数据(闪卡/书单/计划/模板/示例) + 12 个业务函数 + UI 渲染 |
| `api.js` | 378 | API 通信 + 本地 DB + 题库函数 |
| `style.css` | 218 | 全部样式 |

**问题：**
- 修改一个页面需要定位到 HTML 中对应片段，易误改其他页面
- JS 中数据定义和业务逻辑混在一起，无法独立测试
- 新增练习题型需要同时编辑 HTML（插入页面 div）和 JS（添加渲染函数）
- CSS 无层级组织，全局样式和组件样式混杂

---

## 二、拆分方案

### 2.1 HTML：按页面拆 10 个片段

```
frontend/
├── index.html              ← 骨架：header + sidebar + <div id="mainContent"> + 计时器
└── pages/
    ├── overview.html       ← 训练模块主页 + 进度 + 阅读理解选择题
    ├── reading.html        ← 现代文阅读（35分）
    ├── classical.html      ← 古诗文阅读（35分）
    ├── language.html       ← 语言文字运用（20分）
    ├── writing.html        ← 写作表达（60分）
    ├── books.html          ← 推荐书单
    ├── plan.html           ← 训练计划
    ├── methodology.html    ← 水平四方法论
    ├── calendar.html       ← 训练日历
    └── import.html         ← 导入数据
```

每个页面片段是 `<div class="page" id="page-xxx">...</div>` 的完整内容。

**构建合并：**
```bash
# build.sh — 零依赖合并
cat frontend/pages/*.html > /tmp/pages.html
# 用 sed/awk 将 index.html 中的占位符 <!-- PAGES --> 替换为合并内容
```

或更简单：构建时 `cat` 拼接，`index.html` 中保留占位注释。

### 2.2 JS：按职责拆 6 个模块

```
frontend/js/
├── app.js                  ← 入口：DOMContentLoaded + 全局状态 + navigate/toggle 等
├── data/
│   ├── decks.js            ← DECKS (shici/xuci/wenxue 硬编码数据)
│   ├── templates.js        ← TEMPLATES (A/B/C 写作模板)
│   ├── examples.js         ← GRAMMAR/SYNTAX/RHETORIC/TRANSLATION/NOVEL 示例
│   ├── books.js            ← BOOKS 书单数据
│   └── plan.js             ← PLAN_WEEKS 训练计划 + SYMBOLS
├── api.js                  ← API 通信 + 本地 DB（不变，已经独立）
├── ui/
│   ├── flashcards.js       ← initDeck / showCard / flipCard / rateCard
│   ├── exercises.js        ← analyzeGrammar / analyzeSyntax / analyzeNovel 等
│   ├── writing.js          ← renderTemplates / applyTemplate
│   ├── import.js           ← handleImportFile / executeImport
│   ├── calendar.js         ← renderCalendar / showDayDetail
│   └── timer.js            ← startTimer / resetTimer
└── utils.js                ← htmlesc / sanitizeHTML / shuffle / toggleAnswer 等
```

**构建合并：**
```bash
# 零依赖：按依赖顺序 concat
cat frontend/js/data/*.js \
    frontend/js/utils.js \
    frontend/js/api.js \
    frontend/js/ui/*.js \
    frontend/js/app.js \
    > frontend/js/bundle.js
```

`index.html` 中的 `<script src="/js/bundle.js">` 替代原来的两个 script 标签。

### 2.3 CSS：按区域拆 5 个层

```
frontend/css/
├── reset.css               ← * 盒模型 + body 基础
├── variables.css            ← :root 自定义属性
├── layout.css               ← header / sidebar / main / page 布局
├── components.css           ← card / tab / flashcard / timer / 按钮 / 表格
└── pages.css                ← 各页面特有样式（celebration / score-map 等）
```

构建同 JS：`cat frontend/css/*.css > frontend/css/bundle.css`

---

## 三、迁移路径

### 阶段 1：仅拆分 JS 数据层（风险最低，收益最高）

1. 创建 `frontend/js/data/` 目录
2. 将 `DECK_SHIPIN`、`DECK_XUCI`、`DECK_WENXUE` 移至 `data/decks.js`
3. 将 `TEMPLATES` 移至 `data/templates.js`
4. 将 `BOOKS` 移至 `data/books.js`
5. 将 `PLAN_WEEKS`、`SYMBOLS` 移至 `data/plan.js`
6. 将各 `*_EXAMPLES` 数组移至 `data/examples.js`
7. 构建脚本生成 `bundle.js`

**预计时间：** 30 分钟，零回归风险（数据是纯定义，无副作用）

### 阶段 2：拆分 JS UI 层

1. 创建 `frontend/js/ui/` 目录
2. 将 `initDeck`、`showCard`、`flipCard`、`rateCard` 移至 `ui/flashcards.js`
3. 将各 `analyze*`、`load*Example` 函数移至 `ui/exercises.js`
4. 将 `applyTemplate`、`renderTemplates` 移至 `ui/writing.js`
5. 将导入相关移至 `ui/import.js`
6. 将日历相关移至 `ui/calendar.js`
7. 将计时器相关移至 `ui/timer.js`

**预计时间：** 1 小时，需确保函数间依赖（如 `checkStreak()`、`updateHomeStats()` 仍在 app.js）不破坏。

### 阶段 3：拆分 HTML

1. 将每个 `<div class="page" id="page-xxx">...</div>` 剪切到独立文件
2. `index.html` 中替换为 `<!-- PAGES -->` 占位
3. 构建脚本拼接

**预计时间：** 45 分钟，需要仔细检查各页面内的 `<script>` 行内函数引用。

### 阶段 4：拆分 CSS

按上述 5 层拆分，构建后合并。

**预计时间：** 20 分钟。

---

## 四、构建脚本示例

```bash
#!/bin/bash
# build.sh — 零外部依赖，仅需 bash + cat

cd "$(dirname "$0")/frontend"

# JS 打包
mkdir -p dist
cat js/data/decks.js \
    js/data/templates.js \
    js/data/books.js \
    js/data/plan.js \
    js/data/examples.js \
    js/utils.js \
    js/api.js \
    js/ui/flashcards.js \
    js/ui/exercises.js \
    js/ui/writing.js \
    js/ui/import.js \
    js/ui/calendar.js \
    js/ui/timer.js \
    js/app.js \
    > dist/bundle.js

# CSS 打包
cat css/reset.css \
    css/variables.css \
    css/layout.css \
    css/components.css \
    css/pages.css \
    > dist/bundle.css

# HTML 页面拼合
sed '/<!-- PAGES -->/r '<(cat pages/*.html) index.html | sed '/<!-- PAGES -->/d' > dist/index.html

echo "✅ Build complete → frontend/dist/"
```

开发时直接加载拆分文件（`index.html` 中使用多个 `<script>` 和 `<link>`），生产时运行 `build.sh` 合并。

---

## 五、不拆的部分

以下保持原样，拆分收益 < 风险：

- **`api.js`** — 已经独立，职责单一（API + DB），不需要再拆
- **`.venv/`、`backend/`** — 后端代码量不大（~200 行/模块），结构已清晰
- **`main.py`** — 单入口文件，不需要拆
