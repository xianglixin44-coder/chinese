"""seed_data.py — 一键初始化方法库数据
Usage: python3 seed_data.py          # 全部重新 seed
       python3 seed_data.py --check  # 仅检查当前数据
"""
import sqlite3, sys
from pathlib import Path

DB = Path(__file__).parent / "trainer.db"

METHODS = [
    dict(id=1, sort_order=1, icon="🏷️", title="主动标记阅读法",
         source="《如何阅读一本书》分析阅读法", description="8种符号标注 + 批注三层法 + 三遍阅读流程",
         target_module="modern_reading", target_page="现代文阅读页",
         extra_json='{"steps":["通读5min:用/分层用[]圈核心词","细读15min:用★标主旨用~~~画论据用?标费解处","整合5min:用→画逻辑链文末写3句批注"],"symbols":["[]核心词","/层次线","?困惑","★主旨","~~~论据","→逻辑","▲品味","×漏洞"]}'),
    dict(id=2, sort_order=2, icon="🃏", title="费曼闪卡法",
         source="Spaced Repetition + 费曼学习法", description="间隔重复算法：1→2→4→8→16→32→64→128天",
         target_module="flashcard", target_page="古诗文阅读页·闪卡区",
         extra_json='{"tips":["每日新卡上限20张","答对升级答错重置为1天","间隔≥32天=已掌握","费曼类比:背面用现代汉语对照解释"],"intervals":[1,2,4,8,16,32,64,128]}'),
    dict(id=3, sort_order=3, icon="🧩", title="语法成分解构图",
         source="结构主义语法（索绪尔→朱德熙）", description="三步法：提主干→配逻辑→画结构",
         target_module="grammar", target_page="语言文字运用页",
         extra_json='{"steps":["提主干:剥离修饰提取S+V+O","配逻辑:检查搭配/残缺/杂糅","画结构:还原完整修饰关系"]}'),
    dict(id=4, sort_order=4, icon="🗣️", title="他们说/我说模板",
         source="《They Say / I Say》Gerald Graff", description="A引入对立+B推进己方+C升华收束 = 一个完整段落",
         target_module="writing", target_page="写作表达页", extra_json="{}"),
    dict(id=5, sort_order=5, icon="🕵️\u200d♂️", title="小说叙事密码拆解",
         source="热奈特叙事学", description="三维度：叙事视角 + 时空结构 + 核心物象",
         target_module="modern_reading", target_page="现代文阅读页",
         extra_json='{"steps":["判视角:第几人称?全知/限制?","析时空:插叙/倒叙/双线?","解物象:反复出现的物品意象及其象征"]}'),
    dict(id=6, sort_order=6, icon="🎭", title="修辞效果三步拆解法",
         source="高考阅卷标准", description="明手法(1分) → 析具体(2分) → 阐效果(2分)",
         target_module="grammar", target_page="语言文字运用页",
         extra_json='{"formula":"手法(1分)+具体分析(2分)+效果情感(2分)=5分","steps":["明手法:运用了___修辞","析具体:通过将___比作/对仗___表现了___","阐效果:深化了___主旨/表达了___情感"]}'),
    dict(id=7, sort_order=7, icon="🗣️", title="言外之意解码法",
         source="格莱斯会话含义理论", description="字面意义 + 被违反的语用准则 + 真实意图",
         target_module="grammar", target_page="语言文字运用页",
         extra_json='{"formula":"字面意义+违反准则+真实意图","rules":["量准则(信息足)","质准则(说真话)","关系准则(相关)","方式准则(清楚)"]}'),
    dict(id=8, sort_order=8, icon="🔗", title="连贯衔接速查",
         source="语篇语言学", description="6类逻辑连词：并列/转折/因果/递进/举例/总结",
         target_module="grammar", target_page="语言文字运用页",
         extra_json='{"formula":"6类逻辑连词速查","rules":["并列:首先/其次/一方面/另一方面","转折:然而/但是/不过/尽管如此","因果:因此/所以/由此可见/究其原因","递进:不仅如此/更重要的是/甚至","举例:例如/以...为例/比如","总结:总之/综上所述/归根结底"]}'),
    dict(id=9, sort_order=9, icon="🎯", title="文言文双语对齐翻译法",
         source="对比语言学", description="字字落实 + 句法还原 + 规范译文",
         target_module="classical_reading", target_page="古诗文阅读页",
         extra_json='{"steps":["字字落实:逐字标注现代汉语对应义 采分点用【N】标出","句法还原:识别特殊句式→还原现代语序","规范译文:字字落实 补充省略 避免意译"]}'),
]


def seed():
    conn = sqlite3.connect(str(DB))
    conn.execute("PRAGMA journal_mode=WAL")
    for m in METHODS:
        conn.execute(
            "INSERT OR REPLACE INTO methods (id, sort_order, icon, title, source, description, target_module, target_page, extra_json, status) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')",
            [m["id"], m["sort_order"], m["icon"], m["title"], m["source"],
             m["description"], m["target_module"], m["target_page"], m["extra_json"]])
    conn.commit()
    count = conn.execute("SELECT COUNT(*) FROM methods").fetchone()[0]
    print(f"✅ Seeded {count} methods into {DB}")
    conn.close()


def check():
    conn = sqlite3.connect(str(DB))
    rows = conn.execute("SELECT id, icon, title, status FROM methods ORDER BY sort_order").fetchall()
    conn.close()
    print(f"📋 {len(rows)} methods in DB:")
    for r in rows:
        print(f"  {r[0]:>2} {r[1]} {r[2]} [{r[3]}]")


if __name__ == "__main__":
    if "--check" in sys.argv:
        check()
    else:
        seed()
