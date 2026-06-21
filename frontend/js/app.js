function checkStreak() {
  const today = new Date().toDateString();
  if (lastActive !== today && lastActive !== '') {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    streak = lastActive === yesterday ? streak + 1 : 0;
  } else if (lastActive === '') { streak = 1; }
  lastActive = today;
  syncStreak(streak, today);
  document.getElementById('streakBadge').textContent = `🔥 ${streak}天`;
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar'), ov = document.getElementById('sidebarOverlay');
  sb.classList.toggle('open');
  if (ov) ov.classList.toggle('show', sb.classList.contains('open'));
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  const ov = document.getElementById('sidebarOverlay');
  if (ov) ov.classList.remove('show');
}

function toggleGroup(name) {
  var body = document.getElementById('group-' + name);
  var arrow = document.querySelector('#group-' + name).parentElement.querySelector('.arrow');
  if (!body) return;
  var collapsed = body.classList.toggle('collapsed');
  if (arrow) {
    arrow.textContent = collapsed ? '▸' : '▾';
    arrow.classList.toggle('open', !collapsed);
  }
}

function navigate(page, keepNav, anchor) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (!keepNav) document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById(`page-${page}`);
  if (pg) pg.classList.add('active');
  if (!keepNav) {
    var nav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (nav) nav.classList.add('active');
  } else {
    var overviewNav = document.querySelector('.nav-item[data-page="overview"]');
    if (overviewNav) overviewNav.classList.add('active');
  }
  currentPage = page;
  document.getElementById('sidebar').classList.remove('open');
  if (page === 'calendar') { renderCalendar(); }
  // 锚点跳转（如闪卡区域）
  if (anchor) {
    setTimeout(function() {
      var el = document.getElementById(anchor);
      if (el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }, 150);
  }
  // 训练页加载每日选题
  if (['reading','classical','language','writing'].includes(page) && !keepNav) {
    loadDailyExercise(page);
  }
  // Update page date/time display
  var dtNow = new Date();
  var dtStr = dtNow.getFullYear() + '年' + (dtNow.getMonth()+1) + '月' + dtNow.getDate() + '日 ' +
              String(dtNow.getHours()).padStart(2,'0') + ':' + String(dtNow.getMinutes()).padStart(2,'0');
  var dtEl = document.getElementById('dt-' + page);
  if (dtEl) dtEl.textContent = '🕐 ' + dtStr;
}

const READING_PASSAGES = [
  {
    id: 'rc1', title: '信息类文本 · 人工智能与教育',
    passage: '人工智能正在重塑教育生态。一方面，个性化学习系统可以根据学生的认知水平定制内容，让每个学生都能以适合自己的节奏前进；另一方面，过度依赖算法推荐可能导致"信息茧房"，使学生只能接触自己舒适区内的知识，失去探索未知领域的机会。因此，技术赋能教育的关键不在于技术本身有多先进，而在于我们如何设计"人机协作"的教育生态。当前，一些学校尝试将AI助教引入课堂，由AI负责知识点的讲解与练习推送，教师则专注于情感互动和创造性思维的引导。这种分工模式既发挥了AI在数据处理和个性化推荐上的优势，又保留了教育中不可替代的"人的温度"。不过，也有学者担忧，如果教师过度依赖AI系统，可能会逐渐丧失课程设计的主导权，使教育沦为"算法驱动"而非"理念驱动"。',
    questions: [
      { q: '1. 根据原文，下列关于"技术赋能教育"的理解，正确的一项是（3分）',
        options: ['A. 技术越先进，教育效果就越好', 'B. 技术赋能的关键在于设计人机协作的生态', 'C. AI可以完全替代教师的全部工作', 'D. 算法推荐必然导致信息茧房'],
        answer: 1 },
      { q: '2. 文中提到的"AI助教+教师"分工模式，下列表述不符合原文的一项是（3分）',
        options: ['A. AI负责知识点讲解与练习推送', 'B. 教师专注于情感互动与创造性思维引导', 'C. 该模式完全消除了AI的局限性', 'D. 保留教育中不可替代的"人的温度"'],
        answer: 2 },
      { q: '3. 关于学者对AI教育的担忧，下列说法正确的一项是（3分）',
        options: ['A. 学者认为AI不应进入课堂', 'B. 教师过度依赖AI可能丧失课程设计主导权', 'C. AI已经使教育沦为算法驱动', 'D. 教育不应该使用任何技术手段'],
        answer: 1 }
    ]
  },
  {
    id: 'rc2', title: '文学类文本 · 巷口的等待',
    passage: '他站在巷口，手里攥着一张对折的纸。风从巷子里灌出来，把纸角吹得一掀一掀的，像一只受伤的鸟在扑棱翅膀。他没有打开它——他已经看了太多遍。那些字像是用针尖划在纸面上的，每一个都扎眼睛。他只是在等，等巷子尽头那扇门打开，或者永远不开。暮色渐渐漫上来，巷子里亮起几盏昏黄的灯，把人影拉得又细又长。远处隐约传来饭菜的香味，和孩子们的嬉闹声。他依然站着，像一棵被遗忘在墙角的枯树。',
    questions: [
      { q: '1. 下列对文中比喻手法的赏析，不正确的一项是（3分）',
        options: ['A. "像一只受伤的鸟在扑棱翅膀"以动作写焦虑', 'B. "像用针尖划在纸面上"以痛觉写视觉冲击', 'C. "像一棵被遗忘在墙角的枯树"暗示人物身份卑微', 'D. 三个比喻均服务于人物心理刻画'],
        answer: 2 },
      { q: '2. 关于文中环境描写的作用，分析正确的一项是（3分）',
        options: ['A. 暮色和灯光渲染了温馨的家庭氛围', 'B. 远处饭菜香与嬉闹声暗示人物已放弃等待', 'C. 环境以"暖"衬"冷"，反衬人物的孤独与坚持', 'D. 环境描写仅作为时间推移的交代'],
        answer: 2 },
      { q: '3. 下列对全文主旨的理解，最准确的一项是（3分）',
        options: ['A. 赞美了民间巷弄的生活气息', 'B. 批评了现代人缺乏耐心的等待', 'C. 通过"等待"这一动作写出了希望与绝望的张力', 'D. 呼吁人们珍惜身边的亲情'],
        answer: 2 }
    ]
  },
  {
    id: 'rc3', title: '论述类文本 · 经典阅读的价值',
    passage: '经典之所以为经典，不在于它完美无瑕，而在于它能够持续地与不同时代的读者对话。一部《论语》，两千年来被无数人解读、质疑、再解读，每一次对话都丰富了文本的生命而非消耗它。这正是卡尔维诺所说的："经典是那些你经常听人家说\'我正在重读……\'而不是\'我正在读……\'的书。"然而，在信息爆炸的今天，浅阅读和碎片化阅读正在侵蚀经典的生存空间。有调查显示，超过六成的受访大学生表示"没有完整读过一部经典名著"。这其中固然有时间碎片化的客观原因，但更深层的问题在于：当"快"成为时代精神，"慢"阅读就成了一种奢侈。值得注意的是，经典阅读的价值恰恰在于它的"慢"——它要求读者放慢节奏，深入思考，与文本展开真正的对话。这种"慢"，不是效率的敌人，而是深度理解的必要条件。',
    questions: [
      { q: '1. 下列关于原文内容的理解和分析，正确的一项是（3分）',
        options: ['A. 经典之所以为经典，是因为它完美无瑕', 'B. 对经典的解读会消耗文本的生命力', 'C. 卡尔维诺认为经典是值得反复重读的书', 'D. 经典阅读是效率的敌人'],
        answer: 2 },
      { q: '2. 下列对原文论证的相关分析，不正确的一项是（3分）',
        options: ['A. 引用卡尔维诺的话是为了定义经典', 'B. 用调查数据论证浅阅读现象的存在', 'C. 将"快"与"慢"对举突出经典阅读的价值', 'D. 文章否定了碎片化阅读的一切价值'],
        answer: 3 },
      { q: '3. 根据原文，"慢"阅读的含义是（3分）',
        options: ['A. 阅读速度缓慢', 'B. 放慢节奏，深入思考，与文本展开对话', 'C. 拒绝一切电子阅读', 'D. 每天只读一页书'],
        answer: 1 }
    ]
  }
];

function checkReadingAnswer(qid, chosen, correct) {
  var resultEl = document.getElementById(qid + '-result');
  if (!resultEl) return;
  resultEl.style.display = 'block';
  if (chosen === correct) {
    resultEl.innerHTML = '<p style="color:#27ae60;font-weight:600">✅ 正确！+3分</p>';
    apiCall('POST', '/api/grammar/log', {sentence: qid, example_idx: -1, module: 'reading'});
    dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'reading')", [qid]);
    checkStreak(); markTaskDone('reading');
  } else {
    var theQ = null;
    READING_PASSAGES.forEach(function(p) {
      p.questions.forEach(function(q, i) { if (p.id + '-q' + i === qid) theQ = q; });
    });
    var correctText = theQ ? theQ.options[correct] : '';
    resultEl.innerHTML = '<p style="color:#c0392b;font-weight:600">❌ 错误。正确答案：' + htmlesc(correctText) + '</p>';
  }
}
function renderReadingTabs() {
  var container = document.getElementById('readingTabs-content');
  if (!container) return;
  var h = '';
  READING_PASSAGES.forEach(function(p) {
    var isActive = p.id === 'rc1' ? ' active' : '';
    h += '<div class="tab-content' + isActive + '" id="tab-' + p.id + '">';
    h += '<div class="ex-passage" style="line-height:2;font-size:14px">' + htmlesc(p.passage) + '</div>';
    p.questions.forEach(function(q, qi) {
      var qid = p.id + '-q' + qi;
      h += '<div class="exercise-item mt-8"><p><strong>' + htmlesc(q.q) + '</strong></p>';
      h += '<div style="display:grid;gap:4px;margin:8px 0;">';
      q.options.forEach(function(o, oi) {
        h += '<label class="ex-option"><input type="radio" name="' + qid + '" value="' + oi + '" onchange="checkReadingAnswer(\'' + qid + '\',' + oi + ',' + q.answer + ')"> ' + htmlesc(o) + '</label>';
      });
      h += '</div>';
      h += '<div class="ex-answer" id="' + qid + '-result" style="display:none"></div></div>';
    });
    h += '</div>';
  });
  container.innerHTML = h;
}

function renderSymbols() {
  const html = SYMBOLS.map(s => `<div class="sym-card"><div class="sym">${s.sym}</div><div class="sym-name">${s.name}</div><div class="sym-desc">${s.desc}</div></div>`).join('');
  var g = document.getElementById('symGrid'); if (g) g.innerHTML = html;
  var m = document.getElementById('methodSymGrid'); if (m) m.innerHTML = html;
}

// ====== 每日选题加载与渲染 ======
async function loadDailyExercise(page) {
  var moduleMap = { reading: 'modern_reading', classical: 'classical_reading', language: 'grammar', writing: 'writing' };
  var module = moduleMap[page];
  if (!module) return;

  var containerId = 'daily-' + page;
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!apiAvailable) { container.innerHTML = ''; return; }

  try {
    var data = await fetchDailyExercise(module);
    if (data && data.exercise) {
      renderDailyExercise(container, data.exercise, data.is_new);
    } else {
      container.innerHTML = '<div class="card" style="text-align:center;color:var(--text-light);padding:24px;">📭 该题型暂无可用题目，请通过导入功能添加。</div>';
    }
  } catch(e) {
    container.innerHTML = ''; // 静默回退到硬编码内容
  }
}

function renderDailyExercise(container, ex, isNew) {
  var badge = isNew ? '<span style="font-size:10px;background:var(--accent2);color:#fff;padding:2px 8px;border-radius:10px;margin-left:6px;">今日新题</span>' : '';
  var html = '<div class="card" style="border-left:3px solid var(--accent2);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><h3 style="margin:0;">📋 今日练习' + badge + '</h3></div>';

  if (ex.module === 'modern_reading') {
    html += '<div class="ex-passage" style="line-height:2;font-size:14px;margin-bottom:12px;">' + htmlesc(ex.content) + '</div>';
    if (ex.question) {
      html += '<p><strong>' + htmlesc(ex.question) + '</strong></p>';
      if (ex.options_json) {
        try {
          var opts = JSON.parse(ex.options_json);
          opts.forEach(function(o, i) {
            html += '<label class="ex-option"><input type="radio" name="dailyQ" value="' + i + '" onchange="checkDailyAnswer(\'' + ex.module + '\',' + i + ',\'' + ex.answer + '\')"> ' + htmlesc(o) + '</label>';
          });
        } catch(e) {}
      }
      html += '<div class="ex-answer" id="dailyQ-result" style="display:none;margin-top:8px;"></div>';
    }
    if (ex.explanation) {
      html += '<div id="dailyQ-explanation" style="display:none;margin-top:8px;background:#faf8f5;padding:10px;border-radius:6px;font-size:13px;">' + htmlesc(ex.explanation).replace(/\n/g,'<br>') + '</div>';
    }
  } else if (ex.module === 'classical_reading') {
    html += '<div class="ex-passage" style="font-size:16px;margin-bottom:8px;">' + htmlesc(ex.content) + '</div>';
    if (ex.question) html += '<p><strong>' + htmlesc(ex.question) + '</strong></p>';
    if (ex.options_json && ex.options_json !== '[]') {
      try {
        JSON.parse(ex.options_json).forEach(function(o, i) {
          html += '<label class="ex-option"><input type="radio" name="dailyQ" value="' + i + '" onchange="checkDailyAnswer(\'' + ex.module + '\',' + i + ',\'' + ex.answer + '\')"> ' + htmlesc(o) + '</label>';
        });
      } catch(e) {}
    } else {
      html += '<input class="gram-input" id="dailyInput" placeholder="输入你的答案…"><button class="btn-primary" onclick="checkDailyText(\'' + ex.module + '\')">提交</button>';
    }
    html += '<div class="ex-answer" id="dailyQ-result" style="display:none;margin-top:8px;"></div>';
  } else if (ex.module === 'grammar') {
    html += '<p style="font-size:15px;margin-bottom:8px;"><strong>句子：</strong>' + htmlesc(ex.content) + '</p>';
    if (ex.question) html += '<p>' + htmlesc(ex.question) + '</p>';
    html += '<input class="gram-input" id="dailyInput" placeholder="输入你的分析或答案…"><button class="btn-primary" onclick="checkDailyText(\'' + ex.module + '\')">提交</button>';
    html += '<div class="ex-answer" id="dailyQ-result" style="display:none;margin-top:8px;"></div>';
    if (ex.explanation) {
      html += '<div id="dailyQ-explanation" style="display:none;margin-top:8px;background:#faf8f5;padding:10px;border-radius:6px;font-size:13px;">' + htmlesc(ex.explanation).replace(/\n/g,'<br>') + '</div>';
    }
  } else if (ex.module === 'writing') {
    html += '<p style="font-size:15px;margin-bottom:8px;"><strong>🎯 今日话题：</strong>' + htmlesc(ex.content) + '</p>';
    try {
      var extra = JSON.parse(ex.extra_json || '{}');
      if (extra.template_hint) html += '<p style="font-size:12px;color:var(--accent2);">💡 建议模板：' + htmlesc(extra.template_hint) + '</p>';
    } catch(e) {}
    html += '<textarea id="dailyInput" style="width:100%;height:120px;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;resize:vertical;" placeholder="在此写作…"></textarea>';
    html += '<button class="btn-primary mt-8" onclick="checkDailyText(\'' + ex.module + '\')">提交</button>';
  }

  html += '</div>';
  container.innerHTML = html;
  container.style.display = 'block';
}

function checkDailyAnswer(module, chosen, correctStr) {
  var resultEl = document.getElementById('dailyQ-result');
  var explanationEl = document.getElementById('dailyQ-explanation');
  if (!resultEl) return;
  resultEl.style.display = 'block';
  if (explanationEl) explanationEl.style.display = 'block';
  var correct = parseInt(correctStr) === chosen;
  if (correct) {
    resultEl.innerHTML = '<p style="color:#27ae60;font-weight:600">✅ 正确！</p>';
    completeDailyExercise(module, 3);
    markTaskDone(module === 'modern_reading' ? 'reading' : module === 'classical_reading' ? 'classical' : 'language');
  } else {
    resultEl.innerHTML = '<p style="color:#c0392b;font-weight:600">❌ 错误。正确答案已在上方解析中。</p>';
    completeDailyExercise(module, 0);
  }
}

function checkDailyText(module) {
  var input = document.getElementById('dailyInput');
  var resultEl = document.getElementById('dailyQ-result');
  var explanationEl = document.getElementById('dailyQ-explanation');
  if (!input || !resultEl) return;
  resultEl.style.display = 'block';
  if (explanationEl) explanationEl.style.display = 'block';
  if (input.value.trim()) {
    resultEl.innerHTML = '<p style="color:var(--accent2);font-weight:600">✅ 已提交。对照上方解析检查你的答案。</p>';
    completeDailyExercise(module, 2);
    if (module === 'grammar') markTaskDone('language');
    if (module === 'writing') markTaskDone('writing');
  }
}

const SRS_INTERVALS = [1, 2, 4, 8, 16, 32, 64, 128];
const MASTERY_INTERVAL = 32;

async function initDeck(name) {
  currentDeck = name; deckIndex = 0;
  // 优先从服务端题库加载，API 不可用时回退到硬编码数据
  if (apiAvailable) {
    try {
      const r = await fetchFlashcardItems(name);
      if (r && r.items && r.items.length > 0) {
        const existing = DECKS[name] || [];
        const existingFronts = new Set(existing.map(c => c.front));
        const apiCards = r.items.map(item => {
          var extra = {};
          try { extra = JSON.parse(item.extra_json || '{}'); } catch(e) {}
          return {
            front: item.content, hl: extra.hl || '', word: extra.word || '',
            meaning: extra.meaning || '', analogy: extra.analogy || ''
          };
        });
        const newCards = apiCards.filter(c => !existingFronts.has(c.front));
        if (newCards.length > 0) DECKS[name] = [...existing, ...newCards];
      }
    } catch(e) { /* API 不可用，回退硬编码 */ }
  }
  const totalCards = DECKS[name].length;
  const today = new Date().toISOString().slice(0, 10);
  const srsRows = dbGet("SELECT card_idx, interval_days, repetitions, next_review, mastered FROM card_srs WHERE deck = ?", [name]);
  const srsMap = {};
  srsRows.forEach(r => { srsMap[r[0]] = { interval: r[1], reps: r[2], next: r[3], mastered: r[4] }; });
  const dueIndices = [], newIndices = [];
  for (let i = 0; i < totalCards; i++) {
    const s = srsMap[i];
    if (!s || !s.next) { newIndices.push(i); }
    else if (s.next <= today && !s.mastered) { dueIndices.push(i); }
  }
  shuffle(dueIndices); shuffle(newIndices);
  var limitedNew = newIndices.slice(0, DAILY_CARD_LIMIT);
  deckQueue = [...dueIndices, ...limitedNew];
  const el = document.getElementById('fcStats');
  if (el) {
    const mastered = srsRows.filter(r => r[4]).length;
    var newLabel = limitedNew.length + (newIndices.length > DAILY_CARD_LIMIT ? '（上限' + DAILY_CARD_LIMIT + '）' : '');
    if (dueIndices.length > 0) el.textContent = `待复习: ${dueIndices.length} | 新卡: ${newLabel} | 已掌握: ${mastered}`;
    else if (newIndices.length > 0) el.textContent = `新卡: ${newLabel}/${totalCards} | 已掌握: ${mastered}`;
    else el.textContent = `🎉 全部已掌握！ (${totalCards}张)`;
  }
  showCard();
  document.querySelectorAll('.deck-btn').forEach(b => b.classList.toggle('active', b.dataset.deck === name));
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }
function showCard() {
  if (deckQueue.length === 0) {
    if (cardTimer) { clearInterval(cardTimer); cardTimer = null; }
    var tEl2 = document.getElementById('fcTimer'); if (tEl2) tEl2.textContent = '';
    const m = dbGet("SELECT COUNT(*) FROM card_srs WHERE deck = ? AND mastered = 1", [currentDeck]);
    const mastered = m.length ? m[0][0] : 0;
    const total = DECKS[currentDeck].length;
    document.getElementById('fcStats').textContent = mastered >= total ? `🏆 全部掌握！ (${total}张)` : `✅ 今日任务完成！已掌握: ${mastered}/${total}`;
    document.getElementById('fcFront').textContent = mastered >= total ? '🏆 太棒了！全部掌握' : '✅ 今日任务完成，明天再来！';
    document.getElementById('fcWord').textContent = ''; document.getElementById('fcMeaning').textContent = ''; document.getElementById('fcAnalogy').textContent = '';
    flipped = false; document.getElementById('flashcard').classList.remove('flipped'); return;
  }
  // Start 20s countdown
  if (cardTimer) clearInterval(cardTimer);
  cardSeconds = 20;
  var timerEl = document.getElementById('fcTimer');
  if (timerEl) { timerEl.textContent = '⏱ 20s'; timerEl.classList.remove('urgent'); }
  cardTimer = setInterval(function() {
    cardSeconds--;
    if (timerEl) {
      timerEl.textContent = '⏱ ' + cardSeconds + 's';
      if (cardSeconds <= 5) timerEl.classList.add('urgent');
    }
    if (cardSeconds <= 0) {
      clearInterval(cardTimer); cardTimer = null;
      if (timerEl) timerEl.textContent = '⏰ 超时';
      if (flipped) rateCard('again');
      else { flipCard(); setTimeout(function() { rateCard('again'); }, 1000); }
    }
  }, 1000);
  const card = DECKS[currentDeck][deckQueue[deckIndex]];
  document.getElementById('fcStats').textContent = `卡片 ${deckIndex + 1}/${deckQueue.length} · 待复习:${deckQueue.length}`;
  let frontHTML = card.front;
  if (card.hl) { frontHTML = card.front.replace(new RegExp('(' + card.hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'g'), '<span class="fw-bold-highlight">$1</span>'); }
  document.getElementById('fcFront').innerHTML = sanitizeHTML(frontHTML);
  document.getElementById('fcWord').textContent = card.word;
  document.getElementById('fcMeaning').textContent = card.meaning;
  document.getElementById('fcAnalogy').textContent = card.analogy || '';
  flipped = false; document.getElementById('flashcard').classList.remove('flipped');
  updateHomeStats();
}
function flipCard() { if (deckQueue.length === 0) return; flipped = !flipped; document.getElementById('flashcard').classList.toggle('flipped', flipped); }
function rateCard(rating) {
  if (deckQueue.length === 0) return;
  if (cardTimer) { clearInterval(cardTimer); cardTimer = null; }
  if (!flipped) { flipCard(); return; }
  const cardIdx = deckQueue[deckIndex];
  if (cardIdx === undefined) return;
  const card = DECKS[currentDeck][cardIdx];
  const today = new Date().toISOString().slice(0, 10);
  apiCall('POST', '/api/flashcard/log', {deck: currentDeck, card_word: card.word, rating});
  apiCall('POST', '/api/training/session', {date: today, module: '闪卡', duration_min: 5});
  dbRun("INSERT INTO flashcard_log (deck, card_word, rating) VALUES (?, ?, ?)", [currentDeck, card.word, rating]);
  const rows = dbGet("SELECT interval_days, repetitions FROM card_srs WHERE deck = ? AND card_idx = ?", [currentDeck, cardIdx]);
  let interval = rows.length ? rows[0][0] : 0;
  let reps = rows.length ? rows[0][1] : 0;
  if (rating === 'again') { interval = 1; reps = 0; }
  else if (rating === 'hard') { if (interval === 0) interval = 1; reps++; }
  else if (rating === 'easy') {
    if (interval === 0) interval = 1;
    else { const idx = SRS_INTERVALS.indexOf(interval); interval = idx >= 0 && idx < SRS_INTERVALS.length - 1 ? SRS_INTERVALS[idx + 1] : interval; }
    reps++;
  }
  const nextReview = new Date(Date.now() + interval * 86400000).toISOString().slice(0, 10);
  const mastered = interval >= MASTERY_INTERVAL ? 1 : 0;
  apiCall('PUT', '/api/card-srs', {deck: currentDeck, card_idx: cardIdx, rating: rating, interval_days: interval, repetitions: reps, next_review: nextReview, mastered});
  dbRun(`INSERT OR REPLACE INTO card_srs (deck, card_idx, interval_days, repetitions, next_review, mastered) VALUES (?, ?, ?, ?, ?, ?)`, [currentDeck, cardIdx, interval, reps, nextReview, mastered]);
  if (mastered) { deckQueue.splice(deckIndex, 1); }
  else if (rating === 'again') { deckQueue.splice(deckIndex, 1); deckQueue.push(cardIdx); }
  else { deckQueue.splice(deckIndex, 1); }
  if (deckQueue.length > 0) deckIndex = deckIndex % deckQueue.length; else deckIndex = 0;
  checkStreak(); showCard();
  if (deckQueue.length < DECKS[currentDeck].length) markTaskDone('flashcard');
}
document.addEventListener('click', e => { const btn = e.target.closest('.deck-btn'); if (btn) initDeck(btn.dataset.deck); });

let currentPage = 'overview', currentDeck = 'shici', deckIndex = 0, deckQueue = [], flipped = false;
let cardTimer = null, cardSeconds = 20;
const DAILY_CARD_LIMIT = 20;
let streak = 0, lastActive = '', templateCount = 0, grammarCount = 0;
let timerSeconds = 25 * 60, timerRunning = false, timerInterval = null;

// Daily task tracking
const DAILY_TASKS = ['flashcard', 'reading', 'classical', 'language', 'writing'];
let completedTasks = {};
async function loadCompletedTasks() {
  const today = new Date().toISOString().slice(0, 10);
  completedTasks = {};
  // Try server first
  if (apiAvailable) {
    try {
      const r = await fetch(API_BASE + '/api/query', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({sql: "SELECT task FROM daily_tasks WHERE date = ?", params: [today]})
      });
      const data = await r.json();
      if (data && data.rows) { data.rows.forEach(r => { completedTasks[r[0]] = true; }); }
    } catch(e) {}
  }
  // Local fallback
  const rows = dbGet("SELECT task FROM daily_tasks WHERE date = ?", [today]);
  rows.forEach(r => { completedTasks[r[0]] = true; });
  renderDailyChecklist();
}
function markTaskDone(task) {
  const today = new Date().toISOString().slice(0, 10);
  dbRun("INSERT OR IGNORE INTO daily_tasks (date, task) VALUES (?, ?)", [today, task]);
  apiCall('POST', '/api/training/session', {date: today, module: task, duration_min: 5});
  completedTasks[task] = true;
  renderDailyChecklist();
}
function renderDailyChecklist() {
  const done = Object.keys(completedTasks).length;
  const total = DAILY_TASKS.length;
  const pct = Math.round(done / total * 100);
  document.getElementById('progressLabel').textContent = `已完成 ${done} / ${total} 项`;
  document.getElementById('progressFill').style.width = pct + '%';
  DAILY_TASKS.forEach(task => {
    const el = document.querySelector(`.daily-task[data-task="${task}"]`);
    if (el) el.classList.toggle('done', !!completedTasks[task]);
  });
  if (done >= total) {
    var now = new Date();
    var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
    var timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    var totalMin = 0;
    var todayISO = now.toISOString().slice(0,10);
    var sessions = dbGet("SELECT SUM(duration_min) FROM training_sessions WHERE date=?", [todayISO]);
    if (sessions.length && sessions[0][0]) totalMin = sessions[0][0];
    document.getElementById('celebration').classList.add('show');
    document.getElementById('taskProgress').style.display = 'none';
    document.getElementById('dailyChecklist').style.display = 'none';
    document.getElementById('celebCards').textContent = DECKS[currentDeck].length;
    document.getElementById('celebTemplates').textContent = getTemplateCount();
    document.getElementById('celebGrammar').textContent = getGrammarCount();
    document.getElementById('celebDay').textContent = streak;
    document.getElementById('celebMeta').textContent = '完成于 ' + dateStr + ' ' + timeStr + ' · 训练用时 ' + totalMin + ' 分钟';
  }
}
function startTask(page) {
  if (page === 'flashcard') navigate('classical', true);
  else navigate(page, true);
  // Task completion is tracked by actual activity (rateCard, applyTemplate, etc.)
  // which call markTaskDone() when the user genuinely completes an exercise.
}

document.addEventListener('DOMContentLoaded', async () => {
  await checkApi();
  var st = await getStreak();
  streak = st.count;
  lastActive = st.lastActive;
  await loadCompletedTasks();
  checkStreak();
  renderSymbols();
  renderReadingTabs();
  renderBooks();
  renderPlan();
  renderSelfAssessment();
  renderTemplates();
  initDeck('shici');
  updateHomeStats();
});

function renderBooks() {
  const l = document.getElementById('bookList'); if (!l) return;
  l.innerHTML = BOOKS.map(b => `<div class="book-row"><div class="rank">${b.rank}</div><div><h4>${b.title}</h4><div class="author">${b.author}</div><div class="desc">${b.desc}</div><span class="tag ${b.tagClass}">${b.tag}</span></div></div>`).join('');
}

function renderPlan() {
  const c = document.getElementById('planTabs-content'); if (!c) return;
  let html = '';
  ['week1', 'week2', 'week3', 'week4'].forEach(wk => {
    const d = PLAN_WEEKS[wk];
    html += `<div class="tab-content${wk === 'week1' ? ' active' : ''}" id="tab-${wk}"><div class="plan-week"><h3>${d.title}</h3><table class="plan-table"><thead><tr><th>日</th><th>晨5min</th><th>午5min</th><th>晚15min</th></tr></thead><tbody>`;
    d.days.forEach((day, i) => { html += `<tr><td>${['一', '二', '三', '四', '五', '六', '日'][i]}</td><td>${day[0]}</td><td>${day[1]}</td><td>${day[2]}</td></tr>`; });
    html += '</tbody></table></div></div>';
  });
  c.innerHTML = html;
}

async function renderSelfAssessment() {
  const el = document.getElementById('selfAssessment'); if (!el) return;
  let h = '<div style="overflow-x:auto"><table class="plan-table"><thead><tr><th>评估项</th><th>W1</th><th>W2</th><th>W3</th><th>W4</th></tr></thead><tbody>';
  ['每天坚持闪卡？', '阅读主动标记？', '作文用上模板？', '语法拆解越来越快？'].forEach((item) => {
    h += `<tr><td>${item}</td>`;
    for (let w = 1; w <= 4; w++) {
      const r = dbGet("SELECT score FROM assessments WHERE item=? AND week=?", [item, w]);
      const v = r.length ? r[0][0] : 0;
      h += `<td style="text-align:center"><select onchange="saveAssessment('${item.replace(/'/g, "\\'")}',${w},this.value)" style="padding:3px;border:1px solid #ddd;border-radius:4px">${[0, 1, 2, 3, 4, 5].map(x => `<option value="${x}"${x === v ? ' selected' : ''}>${'⭐'.repeat(x) || '—'}</option>`).join('')}</select></td>`;
    }
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  el.innerHTML = h;
}

function switchTab(tabsId, tabId) {
  const container = document.getElementById(tabsId); if (!container) return;
  container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  container.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
  const cc = document.getElementById(`${tabsId}-content`); if (!cc) return;
  cc.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const tc = document.getElementById(`tab-${tabId}`); if (tc) tc.classList.add('active');
}

function renderTemplates() {
  ['A', 'B', 'C'].forEach(l => {
    const c = document.getElementById(`tabs${l}-content`); if (!c) return;
    let h = '';
    for (let i = 1; i <= 4; i++) { const k = `${l}${i}`; const t = TEMPLATES[k] || ''; h += `<div class="tab-content${i === 1 ? ' active' : ''}" id="tab-${k}"><p style="font-size:14px;line-height:1.8">${htmlesc(t)}</p></div>`; }
    c.innerHTML = h;
  });
}

function applyTemplate() {
  const a = document.getElementById('selA').value, b = document.getElementById('selB').value, c = document.getElementById('selC').value;
  const input = document.getElementById('templateInput').value;
  let p = `<span class="tmpl-tag A">${a}</span> ${htmlesc(TEMPLATES[a])}\n\n`;
  p += `<span class="tmpl-tag B">${b}</span> ${htmlesc(TEMPLATES[b])}\n\n`;
  p += `<span class="tmpl-tag C">${c}</span> ${htmlesc(TEMPLATES[c])}\n\n`;
  p += `<hr style="margin:10px 0"><span class="text-light">你的话题：</span>\n${htmlesc(input)}`;
  document.getElementById('templatePreview').innerHTML = p;
  const today = new Date().toISOString().slice(0, 10);
  apiCall('POST', '/api/template/log', {combo_a: a, combo_b: b, combo_c: c, topic: input.substring(0, 200)});
  apiCall('POST', '/api/training/session', {date: today, module: '模板', duration_min: 10});
  dbRun("INSERT INTO template_log (combo_a, combo_b, combo_c, topic) VALUES (?, ?, ?, ?)", [a, b, c, input]);
  templateCount = getTemplateCount();
  checkStreak(); updateHomeStats();
  markTaskDone('writing');
}

function htmlesc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function sanitizeHTML(str) {
  if (!str) return '';
  var s = String(str);
  // Pass 1: strip dangerous tags and event handlers
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
       .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
       .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
       .replace(/<embed\b[^>]*>/gi, '')
       .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
       .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
       .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
       .replace(/\bon\w+\s*=\s*[^\s>]*/gi, '')
       .replace(/\bon\w+\b(?=\s*[^=]|$)/gi, '')  // bare on* attrs like <img onerror>
       .replace(/javascript\s*:/gi, '')
       .replace(/vbscript\s*:/gi, '')
       .replace(/data\s*:\s*text\/html/gi, '');
  // Pass 2: decode HTML entities and re-check for smuggled tags
  var decoded;
  try {
    var txt = document.createElement('textarea');
    txt.innerHTML = s; decoded = txt.value;
  } catch(e) { decoded = s; }
  if (decoded !== s) {
    // Re-run stripped-tag regex on decoded text to catch entity-encoded attacks
    decoded = decoded.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                     .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
                     .replace(/\bon\w+\s*=\s*[^\s>]*/gi, '')
                     .replace(/javascript\s*:/gi, '');
    return decoded;
  }
  return s;
}

function loadGrammarExample(idx) {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('grammarInput').value = GRAMMAR_EXAMPLES[idx].sentence;
  document.getElementById('grammarResult').innerHTML = `<div class="gram-step"><h4>🔍 诊断结果</h4><pre class="analysis">${GRAMMAR_EXAMPLES[idx].analysis}</pre></div>`;
  apiCall('POST', '/api/grammar/log', {sentence: GRAMMAR_EXAMPLES[idx].sentence, example_idx: idx, module: '语言运用'});
  apiCall('POST', '/api/training/session', {date: today, module: '语法', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, 'language')", [GRAMMAR_EXAMPLES[idx].sentence, idx]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
  markTaskDone('language');
}
function analyzeGrammar() {
  const today = new Date().toISOString().slice(0, 10);
  const input = document.getElementById('grammarInput').value.trim();
  if (!input) { alert('请输入句子'); return; }
  document.getElementById('grammarResult').innerHTML = `<div class="gram-step"><h4>🔍 你的句子</h4><p style="font-size:13px;margin-bottom:6px"><strong>原文：</strong>${htmlesc(input)}</p><pre class="analysis">请按三步手动拆解：\n\n1️⃣ 提主干：找出 S+V+O\n  主语：___  谓语：___  宾语：___\n\n2️⃣ 配逻辑：\n  □搭配不当 □成分残缺 □句式杂糅 □语序不当\n\n3️⃣ 画结构：还原完整修饰关系</pre></div>`;
  apiCall('POST', '/api/grammar/log', {sentence: input, example_idx: -1, module: '语言运用'});
  apiCall('POST', '/api/training/session', {date: today, module: '语法', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'language')", [input]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}

function loadSyntaxExample(idx) {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('syntaxInput').value = SYNTAX_EXAMPLES[idx].sentence;
  document.getElementById('syntaxResult').innerHTML = `<div class="gram-step"><h4>🧩 拆解结果</h4><pre class="analysis">${SYNTAX_EXAMPLES[idx].analysis}</pre></div>`;
  apiCall('POST', '/api/grammar/log', {sentence: SYNTAX_EXAMPLES[idx].sentence, example_idx: idx, module: '古诗文'});
  apiCall('POST', '/api/training/session', {date: today, module: '语法', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, 'classical')", [SYNTAX_EXAMPLES[idx].sentence, idx]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}
function analyzeSyntax() {
  const today = new Date().toISOString().slice(0, 10);
  const input = document.getElementById('syntaxInput').value.trim();
  if (!input) { alert('请输入文言句子'); return; }
  document.getElementById('syntaxResult').innerHTML = `<div class="gram-step"><h4>🧩 你的句子</h4><p><strong>原文：</strong>${htmlesc(input)}</p><pre class="analysis">请按三步拆解：\n\n1️⃣ 提主干：找出 S+V+O\n2️⃣ 识别句式：□宾语前置 □介宾后置 □定语后置 □被动句 □省略句\n3️⃣ 还原现代汉语语序</pre></div>`;
  apiCall('POST', '/api/grammar/log', {sentence: input, example_idx: -1, module: '古诗文'});
  apiCall('POST', '/api/training/session', {date: today, module: '语法', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'classical')", [input]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}

function loadRhetoricExample(idx) {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('rhetoricInput').value = RHETORIC_EXAMPLES[idx].sentence;
  document.getElementById('rhetoricResult').innerHTML = '<div class="gram-step" style="border-left-color: var(--gold);"><h4>🎭 修辞鉴赏解析</h4><pre class="analysis" style="font-family: inherit; font-size:13px;">' + RHETORIC_EXAMPLES[idx].analysis + '</pre></div>';
  apiCall('POST', '/api/grammar/log', {sentence: RHETORIC_EXAMPLES[idx].sentence, example_idx: idx, module: '修辞鉴赏'});
  apiCall('POST', '/api/training/session', {date: today, module: '修辞', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, 'rhetoric')", [RHETORIC_EXAMPLES[idx].sentence, idx]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}
function analyzeRhetoric() {
  const today = new Date().toISOString().slice(0, 10);
  const input = document.getElementById('rhetoricInput').value.trim();
  if (!input) { alert('请输入含有修辞的句子'); return; }
  document.getElementById('rhetoricResult').innerHTML = '<div class="gram-step" style="border-left-color: var(--gold);"><h4>🎭 自主修辞分析骨架</h4><p style="font-size:13px; margin-bottom:10px;"><strong>你的句子：</strong>' + htmlesc(input) + '</p><pre class="analysis" style="font-family: inherit; font-size:13px; line-height: 1.8;">请按照高考阅卷的三步公式作答：\n\n1️⃣ <strong>明手法：</strong>这句话运用了________的修辞手法。\n2️⃣ <strong>析具体：</strong>通过将________比作/拟作/对仗________，具体表现了________。\n3️⃣ <strong>阐效果：</strong>该修辞深化了________的主旨，表达了________的情感。</pre></div>';
  apiCall('POST', '/api/grammar/log', {sentence: input, example_idx: -1, module: '修辞鉴赏'});
  apiCall('POST', '/api/training/session', {date: today, module: '修辞', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'rhetoric')", [input]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}

function analyzeImplicature() {
  const today = new Date().toISOString().slice(0, 10);
  const input = document.getElementById('implicatureInput').value.trim();
  if (!input) { alert('请输入含有言外之意的对话'); return; }
  document.getElementById('implicatureResult').innerHTML = '<div class="gram-step" style="border-left-color: var(--accent2);"><h4>🗣️ 言外之意解码框架</h4><p style="font-size:13px; margin-bottom:10px;"><strong>你的句子：</strong>' + htmlesc(input) + '</p><pre class="analysis" style="font-family: inherit; font-size:13px; line-height: 1.8;">请按格莱斯会话含义理论的三步公式作答：\n\n1️⃣ <strong>字面意义：</strong>这句话的表面意思是________。\n2️⃣ <strong>被违反的准则：</strong>它违反了________准则，具体表现为________。\n3️⃣ <strong>真实意图：</strong>说话者实际上想表达的是________。</pre></div>';
  apiCall('POST', '/api/grammar/log', {sentence: input, example_idx: -1, module: '言外之意'});
  apiCall('POST', '/api/training/session', {date: today, module: '言外之意', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'implicature')", [input]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}

function loadTranslationExample(idx) {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('translationInput').value = TRANSLATION_EXAMPLES[idx].sentence;
  document.getElementById('translationResult').innerHTML = '<div class="gram-step" style="border-left-color: var(--accent);"><h4>🎯 双语对齐与采分点剖析</h4><pre class="analysis" style="font-family: inherit; font-size:13px;">' + TRANSLATION_EXAMPLES[idx].analysis + '</pre></div>';
  apiCall('POST', '/api/grammar/log', {sentence: TRANSLATION_EXAMPLES[idx].sentence, example_idx: idx, module: '古文翻译'});
  apiCall('POST', '/api/training/session', {date: today, module: '古文翻译', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, 'translation')", [TRANSLATION_EXAMPLES[idx].sentence, idx]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}
function analyzeTranslation() {
  const today = new Date().toISOString().slice(0, 10);
  const input = document.getElementById('translationInput').value.trim();
  if (!input) { alert('请输入文言句子'); return; }
  document.getElementById('translationResult').innerHTML = '<div class="gram-step" style="border-left-color: var(--accent);"><h4>🎯 自主双语对齐翻译工作台</h4><p style="font-size:13px; margin-bottom:10px;"><strong>输入内容：</strong>' + htmlesc(input) + '</p><pre class="analysis" style="font-family: inherit; font-size:13px; line-height: 1.8;">请按高考阅卷"直译"原则作答：\n\n1️⃣ <strong>字字对齐：</strong>找出句中无法直接用现代汉语套用的单音节词。\n2️⃣ <strong>句式调整：</strong>是否存在倒装？调整为"主-谓-宾-状-定"语序。\n3️⃣ <strong>最终译文：</strong>做到"字字落实"，补充省略成分。</pre></div>';
  apiCall('POST', '/api/grammar/log', {sentence: input, example_idx: -1, module: '古文翻译'});
  apiCall('POST', '/api/training/session', {date: today, module: '古文翻译', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'translation')", [input]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}

function loadNovelExample(idx) {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('novelInput').value = NOVEL_EXAMPLES[idx].title;
  document.getElementById('novelResult').innerHTML = '<div class="gram-step" style="border-left-color: var(--accent2);"><h4>🕵️‍♂️ 小说叙事特征解析</h4><pre class="analysis" style="font-family: inherit; font-size:13px;">' + NOVEL_EXAMPLES[idx].analysis + '</pre></div>';
  apiCall('POST', '/api/grammar/log', {sentence: NOVEL_EXAMPLES[idx].title, example_idx: idx, module: '小说鉴赏'});
  apiCall('POST', '/api/training/session', {date: today, module: '小说', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, 'novel')", [NOVEL_EXAMPLES[idx].title, idx]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}
function analyzeNovel() {
  const today = new Date().toISOString().slice(0, 10);
  const input = document.getElementById('novelInput').value.trim();
  if (!input) { alert('请输入小说片段或题目'); return; }
  document.getElementById('novelResult').innerHTML = '<div class="gram-step" style="border-left-color: var(--accent2);"><h4>🕵️‍♂️ 自主小说叙事学拆解</h4><p style="font-size:13px; margin-bottom:10px;"><strong>输入内容：</strong>' + htmlesc(input) + '</p><pre class="analysis" style="font-family: inherit; font-size:13px; line-height: 1.8;">请从热奈特叙事学维度拆解：\n\n1️⃣ <strong>叙事视角：</strong>第几人称？有限/无限视角？\n2️⃣ <strong>时空结构：</strong>是否存在插叙、补叙或倒叙？\n3️⃣ <strong>核心物象：</strong>反复出现的静物或意象是什么？</pre></div>';
  apiCall('POST', '/api/grammar/log', {sentence: input, example_idx: -1, module: '小说鉴赏'});
  apiCall('POST', '/api/training/session', {date: today, module: '小说', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'novel')", [input]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}

function updateHomeStats() {
  var todayStr = new Date().toISOString().slice(0, 10);
  var cardCount = dbGet("SELECT COUNT(*) FROM flashcard_log WHERE deck=? AND date(reviewed_at)=?", [currentDeck, todayStr]);
  var cardToday = cardCount.length ? cardCount[0][0] : 0;
  const elC = document.getElementById('ovCards'); if (elC) elC.textContent = cardToday;
  const elT = document.getElementById('ovTemplates'); if (elT) elT.textContent = getTemplateCount();
  const elG = document.getElementById('ovGrammar'); if (elG) elG.textContent = getGrammarCount();
}

document.addEventListener('click', e => {
  const btn = e.target.closest('#planTabs .tab-btn');
  if (btn) { switchTab('planTabs', btn.dataset.tab); }
});

function toggleAnswer(id) { const el = document.getElementById(id); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
function checkClassicalQ4(radio) { const ans = document.getElementById('ex-classical-4'); if (ans) ans.style.display = 'block'; document.querySelectorAll('input[name="q4"]').forEach(r => { const label = r.closest('.ex-option'); if (label) { label.classList.remove('correct', 'wrong'); if (r.checked && r.value === 'B') label.classList.add('correct'); else if (r.checked) label.classList.add('wrong'); } }); }
function doCheck(name, correct) { document.getElementById(`ex-${name}`).style.display = 'block'; document.querySelectorAll(`input[name="${name}"]`).forEach(r => { const l = r.closest('.ex-option'); if (l) { l.classList.remove('correct', 'wrong'); if (r.checked && r.value === correct) l.classList.add('correct'); else if (r.checked) l.classList.add('wrong'); } }); }
function checkBingju1(r) { doCheck('bingju1', 'B'); } function checkBingju2(r) { doCheck('bingju2', 'A'); } function checkBingju3(r) { doCheck('bingju3', 'C'); } function checkBingju4(r) { doCheck('bingju4', 'B'); } function checkBingju5(r) { doCheck('bingju5', 'B'); }

let calYear, calMonth;

async function renderCalendar(y, m) {
  if (!y) { const now = new Date(); y = now.getFullYear(); m = now.getMonth(); }
  calYear = y; calMonth = m;
  document.getElementById('calMonthLabel').textContent = `${y}年 ${m + 1}月`;
  const grid = document.getElementById('calGrid');
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  let html = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  const firstDay = new Date(y, m, 1).getDay();
  const totalDays = new Date(y, m + 1, 0).getDate();
  const today = new Date().toDateString();
  const startDate = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const endDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;
  let rows = [];
  if (apiAvailable) { try { const r = await apiCall('GET', `/api/calendar?start=${startDate}&end=${endDate}`); if (r && r.dates) rows = r.dates.map(d => [d]); } catch(e) {} }
  if (!rows.length) rows = localQuery("SELECT DISTINCT date FROM training_sessions WHERE date >= ? AND date <= ?", [startDate, endDate]);
  const trainedSet = new Set(rows.map(r => r[0]));
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day other"></div>';
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = new Date(y, m, d).toDateString() === today;
    const trained = trainedSet.has(dateStr);
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (trained) cls += ' trained';
    html += `<div class="${cls}" onclick="showDayDetail('${dateStr}')">${d}${isToday ? '' : (trained ? '<span class="dot"></span>' : '')}</div>`;
  }
  grid.innerHTML = html;
}
function calPrevMonth() { const m = calMonth - 1; if (m < 0) renderCalendar(calYear - 1, 11); else renderCalendar(calYear, m); }
function calNextMonth() { const m = calMonth + 1; if (m > 11) renderCalendar(calYear + 1, 0); else renderCalendar(calYear, m); }
async function showDayDetail(dateStr) {
  document.getElementById('calDayDetail').style.display = 'block';
  document.getElementById('calDayTitle').textContent = `📅 ${dateStr}`;
  let sessions = [];
  if (apiAvailable) { try { const r = await apiCall('GET', `/api/calendar/day?date=${dateStr}`); if (r && r.sessions) sessions = r.sessions.map(s => [s.module, s.duration_min]); } catch(e) {} }
  if (!sessions.length) sessions = localQuery("SELECT module, duration_min FROM training_sessions WHERE date = ?", [dateStr]);
  if (!sessions.length) { document.getElementById('calDayContent').innerHTML = '<p style="color:var(--text-light)">该日无训练记录。</p>'; return; }
  let html = '<div style="display:grid;gap:4px">';
  sessions.forEach(s => { html += `<div style="padding:6px 10px;background:#faf8f5;border-radius:6px;display:flex;justify-content:space-between"><span>📝 ${s[0]}</span><span style="font-weight:600">${s[1]}分钟</span></div>`; });
  html += '</div>';
  document.getElementById('calDayContent').innerHTML = html;
}

function toggleTimer() {
  const w = document.getElementById('timerWidget');
  const body = w.querySelector('.timer-body');
  if (w.classList.contains('minimized')) { w.classList.remove('minimized'); body.style.display = 'block'; }
  else { w.classList.add('minimized'); body.style.display = 'none'; }
}
function setTimer(evt, mins) {
  document.querySelectorAll('.timer-presets button').forEach(b => b.classList.remove('active'));
  if (evt && evt.target) evt.target.classList.add('active');
  timerSeconds = mins * 60;
  resetTimer(true);
}
function formatTime(s) { const m = Math.floor(s / 60), sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }
function startTimer() {
  if (timerRunning) {
    clearInterval(timerInterval); timerRunning = false;
    document.getElementById('timerStartBtn').textContent = '▶ 开始';
    document.getElementById('timerStartBtn').classList.replace('pause', 'start');
    document.getElementById('timerDisplay').classList.remove('running');
  } else {
    timerRunning = true;
    document.getElementById('timerStartBtn').textContent = '⏸ 暂停';
    document.getElementById('timerStartBtn').classList.replace('start', 'pause');
    document.getElementById('timerDisplay').classList.add('running');
    document.getElementById('timerResetBtn').style.display = 'block';
    timerInterval = setInterval(() => {
      timerSeconds--;
      document.getElementById('timerDisplay').textContent = formatTime(timerSeconds);
      if (timerSeconds <= 0) {
        clearInterval(timerInterval); timerRunning = false;
        document.getElementById('timerDisplay').textContent = '00:00';
        document.getElementById('timerDisplay').classList.remove('running');
        const mins = Math.round((parseInt(document.querySelector('.timer-presets button.active')?.textContent) || 15));
        const today = new Date().toISOString().slice(0, 10);
        apiCall('POST', '/api/training/session', {date: today, module: '训练', duration_min: mins});
        dbRun("INSERT INTO training_sessions (date, module, duration_min) VALUES (?, '训练', ?)", [today, mins]);
        resetTimer(true);
        alert('🎉 训练完成！已记录到日历。');
      }
    }, 1000);
  }
}
function resetTimer(keepMins = true) {
  clearInterval(timerInterval); timerRunning = false;
  if (!keepMins) { const activeBtn = document.querySelector('.timer-presets button.active'); timerSeconds = (parseInt(activeBtn?.textContent) || 15) * 60; }
  document.getElementById('timerDisplay').textContent = formatTime(timerSeconds);
  document.getElementById('timerDisplay').classList.remove('running');
  document.getElementById('timerStartBtn').textContent = '▶ 开始';
  document.getElementById('timerStartBtn').classList.replace('pause', 'start');
  document.getElementById('timerResetBtn').style.display = 'none';
}

let importData = [], importType = '';
function handleImportFile(event) {
  const file = event.target.files[0]; if (!file) return;
  importType = document.getElementById('importDeck').value;
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) { showImportStatus('文件为空或格式不正确', 'error'); return; }
    const headers = parseCSVLine(lines[0]);
    importData = lines.slice(1).map(l => parseCSVLine(l)).filter(r => r.length >= headers.length);
    showImportPreview(headers, importData);
  };
  reader.readAsText(file, 'UTF-8');
}
function parseCSVLine(line) {
  const result = []; let current = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) { const ch = line[i]; if (ch === '"') { inQuotes = !inQuotes; } else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; } else { current += ch; } }
  result.push(current.trim()); return result;
}
function showImportPreview(headers, data) {
  const preview = document.getElementById('importPreview');
  preview.style.display = 'block';
  let html = '<table><thead><tr>';
  headers.forEach(h => { html += `<th>${htmlesc(h)}</th>`; });
  html += '</tr></thead><tbody>';
  data.slice(0, 20).forEach(row => { html += '<tr>'; row.forEach(cell => { html += `<td>${htmlesc(cell)}</td>`; }); html += '</tr>'; });
  html += '</tbody></table>';
  if (data.length > 20) html += `<div style="padding:8px;text-align:center;color:var(--text-light);font-size:12px">... 还有 ${data.length - 20} 行</div>`;
  preview.innerHTML = html;
  document.getElementById('importBtn').style.display = 'inline-block';
  showImportStatus(`共读取 ${data.length} 条数据，请确认后点击导入。`, 'success');
}
function showImportStatus(msg, type) {
  const el = document.getElementById('importStatus'); el.style.display = 'block'; el.className = 'import-status ' + type; el.textContent = msg;
}
async function executeImport() {
  if (!importData.length) return;
  const deck = document.getElementById('importDeck').value; let count = 0;
  // 闪卡牌组 — 追加到 DECKS
  if (deck === 'shici' || deck === 'xuci' || deck === 'wenxue') {
    const newCards = importData.map(row => ({ front: row[0] || '', hl: row[1] || '', word: row[2] || '', meaning: row[3] || '', analogy: row[4] || '' }));
    DECKS[deck].push(...newCards); count = newCards.length;
  // 现代文阅读题库 — CSV 列: passage_type, title, passage, question, options_json, answer_idx, explanation
  } else if (deck === 'modern_reading') {
    for (const row of importData) {
      if (row.length < 6) continue;
      const r = await apiCall('POST', '/api/exercises', {
        module: 'modern_reading', type: row[0]||'', title: row[1]||'',
        content: row[2]||'', question: row[3]||'', options_json: row[4]||'[]',
        answer: row[5]||'', explanation: row[6]||'',
        extra_json: JSON.stringify({answer_idx: parseInt(row[5])||0})
      });
      if (r && r.ok) count++;
    }
  // 古诗文阅读题库 — CSV 列: question_type, passage, question, options_json, answer, explanation
  } else if (deck === 'classical_reading') {
    for (const row of importData) {
      if (row.length < 5) continue;
      const r = await apiCall('POST', '/api/exercises', {
        module: 'classical_reading', type: row[0]||'', content: row[1]||'',
        question: row[2]||'', options_json: row[3]||'[]',
        answer: row[4]||'', explanation: row[5]||''
      });
      if (r && r.ok) count++;
    }
  // 语法练习题库 — CSV 列: question_type, sentence, options_json, answer, explanation, points
  } else if (deck === 'grammar') {
    for (const row of importData) {
      if (row.length < 4) continue;
      const r = await apiCall('POST', '/api/exercises', {
        module: 'grammar', type: row[0]||'', content: row[1]||'',
        options_json: row[2]||'[]', answer: row[3]||'',
        explanation: row[4]||'', extra_json: JSON.stringify({points: row[5]||''})
      });
      if (r && r.ok) count++;
    }
  // 写作题库 — CSV 列: prompt, template_hint, sample_answer, scoring_guide
  } else if (deck === 'writing') {
    for (const row of importData) {
      if (row.length < 1) continue;
      const r = await apiCall('POST', '/api/exercises', {
        module: 'writing', content: row[0]||'',
        extra_json: JSON.stringify({template_hint: row[1]||'', sample_answer: row[2]||'', scoring_guide: row[3]||''})
      });
      if (r && r.ok) count++;
    }
  // 通用习题导入（兼容旧格式）
  } else if (deck === 'exercises') {
    const rows = importData.filter(r => r && r.length >= 6).map(r => [r[0]||'', r[1]||'', r[2]||'', r[3]||'', r[4]||'', r[5]||'']);
    const result = await apiCall('POST', '/api/import/exercises', { rows });
    if (result && result.ok) count = result.count || rows.length;
    else { showImportStatus('❌ 导入失败，请检查网络或数据格式', 'error'); return; }
  }
  showImportStatus(`✅ 成功导入 ${count} 条数据到 ${deck}`, 'success');
  document.getElementById('importBtn').style.display = 'none';
  importData = [];
}
const dz = document.getElementById('dropZone');
if (dz) {
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', () => { dz.classList.remove('dragover'); });
  dz.addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation(); dz.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) { document.getElementById('importFile').files = e.dataTransfer.files; handleImportFile({ target: { files: [file] } }); }
  });
}
