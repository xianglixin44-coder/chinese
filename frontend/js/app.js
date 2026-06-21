var htmlesc = App.htmlesc;
var sanitizeHTML = App.sanitizeHTML;

(function(){
// ====== 全局事件委托 (新代码用 data-action, 旧 onclick 保留兼容) ======
document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  // Navigation actions
  if (action === 'navigate') navigate(el.dataset.page, el.dataset.keepNav === 'true');
  else if (action === 'startTask') startTask(el.dataset.task);
  else if (action === 'switchTab') switchTab(el.dataset.tabsId, el.dataset.tabId);
  else if (action === 'toggleAnswer') toggleAnswer(el.dataset.target);
  else if (action === 'rateCard') rateCard(el.dataset.rating);
  else if (action === 'flipCard') flipCard();
  else if (action === 'toggleTimer') toggleTimer();
  else if (action === 'setTimer') setTimer(e, parseInt(el.dataset.mins));
  else if (action === 'startTimer') startTimer();
  else if (action === 'resetTimer') resetTimer();
  else if (action === 'applyTemplate') applyTemplate();
  else if (action === 'executeImport') executeImport();
  else if (action === 'loadGrammarExample') loadGrammarExample(parseInt(el.dataset.idx));
  else if (action === 'loadSyntaxExample') loadSyntaxExample(parseInt(el.dataset.idx));
  else if (action === 'loadRhetoricExample') loadRhetoricExample(parseInt(el.dataset.idx));
  else if (action === 'loadTranslationExample') loadTranslationExample(parseInt(el.dataset.idx));
  else if (action === 'loadNovelExample') loadNovelExample(parseInt(el.dataset.idx));
  else if (action === 'analyzeGrammar') analyzeGrammar();
  else if (action === 'analyzeSyntax') analyzeSyntax();
  else if (action === 'analyzeRhetoric') analyzeRhetoric();
  else if (action === 'analyzeTranslation') analyzeTranslation();
  else if (action === 'analyzeNovel') analyzeNovel();
  else if (action === 'analyzeImplicature') analyzeImplicature();
  else if (action === 'calPrevMonth') calPrevMonth();
  else if (action === 'calNextMonth') calNextMonth();
  else if (action === 'toggleGroup') toggleGroup(el.dataset.name);
});

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
  if (!body) return;
  var arrow = body.parentElement.querySelector('.arrow');
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
  if (page === 'records') { renderRecords(); }
  if (page === 'method') { renderMethodPage(); }
  if (page === 'wrong') { renderWrongPage(); }
  if (page === 'history') { renderTrainingHistory(); }
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



function renderSymbols() {
  const html = SYMBOLS.map(s => `<div class="sym-card"><div class="sym">${s.sym}</div><div class="sym-name">${s.name}</div><div class="sym-desc">${s.desc}</div></div>`).join('');
  var g = document.getElementById('symGrid'); if (g) g.innerHTML = html;
}

// ====== 每日选题加载与渲染 ======






var currentPage = 'overview', currentDeck = 'shici', deckIndex = 0, deckQueue = [], flipped = false;
var cardTimer = null, cardSeconds = 20;
var streak = 0, lastActive = '', templateCount = 0, grammarCount = 0;
var timerSeconds = 25 * 60, timerRunning = false, timerInterval = null;

// Daily task tracking
const DAILY_TASKS = ['flashcard', 'reading', 'classical', 'language', 'writing'];
var completedTasks = {};
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
function doCheck(name, correct) { document.getElementById(`ex-${name}`).style.display = 'block'; var wrong=false; var userAns=''; document.querySelectorAll(`input[name="${name}"]`).forEach(r => { const l = r.closest('.ex-option'); if (l) { l.classList.remove('correct', 'wrong'); if (r.checked && r.value === correct) { l.classList.add('correct'); userAns=r.value; } else if (r.checked) { l.classList.add('wrong'); wrong=true; userAns=r.value; } } }); if (!userAns) userAns='未作答'; var questionEl=document.getElementById(`ex-${name}`); var question=(questionEl?.closest('.exercise-item')?.querySelector('strong')?.textContent)||name; var module=''; if (name.startsWith('reading')) module='modern_reading'; else if (name.startsWith('classical')) module='classical_reading'; else if (name.startsWith('bingju')) module='grammar'; else if (name.startsWith('language')) module='grammar'; else module='grammar'; recordTrainingLog(module, question, userAns, correct, wrong?0:1); if (wrong) { apiCall('POST', '/api/wrong', {exercise_id:0,module:module,question_type:'',question:question,user_answer:userAns,correct_answer:correct,explanation:''}); localRun("INSERT INTO wrong_items (exercise_id,module,question,user_answer,correct_answer) VALUES (?,?,?,?,?)",[0,module,question,userAns,correct]); } }
function checkBingju1(r) { doCheck('bingju1', 'B'); } function checkBingju2(r) { doCheck('bingju2', 'A'); } function checkBingju3(r) { doCheck('bingju3', 'C'); } function checkBingju4(r) { doCheck('bingju4', 'B'); } function checkBingju5(r) { doCheck('bingju5', 'B'); }

async function renderMethodPage() {
  // 渲染侧边栏方法项
  var sidebarEl = document.getElementById('methodSidebar');
  // 渲染方法页内容
  var contentEl = document.getElementById('methodContent');
  if (!contentEl) return;

  var items = [];
  // 优先从 API 加载
  if (apiAvailable) {
    try {
      var data = await fetchMethods();
      if (data && data.items) items = data.items;
    } catch(e) {}
  }
  // 离线回退：硬编码（与 seed 一致）
  if (!items.length) {
    items = [
      {id:1,sort_order:1,icon:'🏷️',title:'主动标记阅读法',source:'《如何阅读一本书》分析阅读法',description:'8种符号+批注三层法+三遍阅读流程',target_page:'现代文阅读页',extra_json:'{"steps":["通读5min","细读15min","整合5min"]}'},
      {id:2,sort_order:2,icon:'🃏',title:'费曼闪卡法',source:'间隔重复+费曼学习法',description:'1→2→4→8→16→32→64→128天',target_page:'古诗文阅读页',extra_json:'{"tips":["每日新卡上限20张","答对升级答错重置","间隔≥32天=已掌握"]}'},
      {id:3,sort_order:3,icon:'🧩',title:'语法成分解构图',source:'结构主义语法',description:'三步法:提主干→配逻辑→画结构',target_page:'语言文字运用页',extra_json:'{}'},
      {id:4,sort_order:4,icon:'🗣️',title:'他们说/我说模板',source:'《They Say / I Say》',description:'A引入对立+B推进己方+C升华收束',target_page:'写作表达页',extra_json:'{}'},
      {id:5,sort_order:5,icon:'🕵️\u200d♂️',title:'小说叙事密码拆解',source:'热奈特叙事学',description:'三维度:叙事视角+时空结构+核心物象',target_page:'现代文阅读页',extra_json:'{"steps":["判视角","析时空","解物象"]}'},
      {id:6,sort_order:6,icon:'🎭',title:'修辞效果三步拆解法',source:'高考阅卷标准',description:'明手法(1分)→析具体(2分)→阐效果(2分)',target_page:'语言文字运用页',extra_json:'{"formula":"手法(1分)+具体分析(2分)+效果情感(2分)=5分"}'},
      {id:7,sort_order:7,icon:'🗣️',title:'言外之意解码法',source:'格莱斯会话含义理论',description:'字面意义+被违反的语用准则+真实意图',target_page:'语言文字运用页',extra_json:'{"formula":"字面意义+违反准则+真实意图","rules":["量准则","质准则","关系准则","方式准则"]}'},
      {id:8,sort_order:8,icon:'🔗',title:'连贯衔接速查',source:'语篇语言学',description:'6类逻辑连词速查表',target_page:'语言文字运用页',extra_json:'{}'},
      {id:9,sort_order:9,icon:'🎯',title:'文言文双语对齐翻译法',source:'对比语言学',description:'字字落实+句法还原+规范译文',target_page:'古诗文阅读页',extra_json:'{"steps":["字字落实","句法还原","规范译文"]}'},
    ];
  }

  // 渲染侧边栏
  if (sidebarEl) {
    var sideHtml = '';
    items.forEach(function(m) {
      sideHtml += '<div class="nav-item sub" onclick="navigate(\'method\',false);setTimeout(function(){var el=document.getElementById(\'m-\'+' + m.id + ');if(el)el.scrollIntoView({behavior:\'smooth\'});},150)">' + m.icon + ' ' + htmlesc(m.title) + '</div>';
    });
    sidebarEl.innerHTML = sideHtml;
  }

  // 渲染方法卡片
  var numbers = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
  var html = '';
  items.forEach(function(m, i) {
    var num = numbers[i] || (i+1);
    html += '<div class="card" id="m-' + m.id + '">';
    html += '<h3>' + m.icon + ' ' + num + '、' + htmlesc(m.title) + '</h3>';
    html += '<p style="margin-bottom:10px;">来源：' + htmlesc(m.source||'') + ' · 适用：' + htmlesc(m.target_page||'') + '</p>';
    if (m.description) html += '<p style="font-size:13px;color:var(--text-light);margin-bottom:8px;">' + htmlesc(m.description) + '</p>';

    // 解析 extra_json 渲染结构化内容
    var extra = {};
    try { extra = JSON.parse(m.extra_json || '{}'); } catch(e) {}

    if (extra.steps && extra.steps.length) {
      html += '<div style="display:grid;gap:6px;font-size:13px;line-height:1.8;">';
      var colors = ['var(--accent2)','var(--accent)','var(--gold)','var(--green)','var(--accent2)'];
      extra.steps.forEach(function(s, si) {
        html += '<div style="background:#faf8f5;padding:10px;border-radius:6px;border-left:3px solid ' + (colors[si]||colors[0]) + ';"><strong>' + (si+1) + '️⃣ ' + htmlesc(s) + '</strong></div>';
      });
      html += '</div>';
    }

    if (extra.table && extra.table.length) {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;line-height:1.8;">';
      extra.table.forEach(function(r) {
        html += '<div style="background:#faf8f5;padding:8px;border-radius:6px;"><strong>' + htmlesc(r[0]) + '：</strong>' + htmlesc(r[1]) + '</div>';
      });
      html += '</div>';
    }

    if (extra.tips && extra.tips.length) {
      html += '<div style="display:grid;gap:4px;font-size:13px;">';
      extra.tips.forEach(function(t) {
        html += '<div style="background:#faf8f5;padding:8px;border-radius:6px;">💡 ' + htmlesc(t) + '</div>';
      });
      html += '</div>';
    }

    if (extra.formula) {
      html += '<div style="font-size:13px;line-height:2;padding:10px;background:#faf8f5;border-radius:6px;margin-bottom:8px;"><strong>公式：</strong>' + htmlesc(extra.formula) + '</div>';
    }

    if (extra.principles && extra.principles.length) {
      html += '<div style="font-size:13px;margin-top:4px;"><strong>准则：</strong>' + extra.principles.map(function(p){return htmlesc(p);}).join(' | ') + '</div>';
    }

    if (m.target_page) {
      html += '<p style="margin-top:8px;font-size:12px;color:var(--text-light);">📖 练习入口：' + htmlesc(m.target_page) + '</p>';
    }
    html += '</div>';
  });

  // 方法映射表
  html += '<div class="card" style="margin-top:14px;"><h3>📊 方法 × 题型 映射</h3>';
  html += '<div style="overflow-x:auto;font-size:12px;line-height:2;"><table style="width:100%;border-collapse:collapse;">';
  html += '<tr style="border-bottom:1px solid var(--border);"><th style="text-align:left;padding:4px 8px;">方法</th><th style="padding:4px 8px;">现代文</th><th style="padding:4px 8px;">古诗文</th><th style="padding:4px 8px;">语言</th><th style="padding:4px 8px;">写作</th></tr>';
  var MODS = ['modern_reading','classical_reading','grammar','writing'];
  var MOD_NAMES = ['📖 现代文','🏛️ 古诗文','✍️ 语言','📝 写作'];
  items.forEach(function(m) {
    html += '<tr style="border-bottom:1px solid #f0eeea;">';
    html += '<td style="padding:4px 8px;">' + m.icon + ' ' + htmlesc(m.title) + '</td>';
    MODS.forEach(function(mod) {
      html += '<td style="text-align:center;padding:4px 8px;">' + (m.target_module === mod ? '✅' : '') + '</td>';
    });
    html += '</tr>';
  });
  html += '</table></div></div>';

  contentEl.innerHTML = html;
}

async function renderRecords() {
  var el = document.getElementById('recordsContent');
  if (!el) return;

  var MOD_ICON = { modern_reading: '📖', classical_reading: '🏛️', grammar: '✍️', writing: '📝' };
  var MOD_LABEL = { modern_reading: '现代文', classical_reading: '古诗文', grammar: '语言运用', writing: '写作' };

  if (apiAvailable) {
    try {
      var data = await fetchRecords(30);
      var html = '';

      // 本周统计
      if (data.week_stats) {
        html += '<div class="card"><h3>📊 本周概览</h3><div style="display:flex;gap:24px;flex-wrap:wrap;margin-top:8px;">';
        var ws = data.week_stats;
        if (ws.daily && ws.daily.length) {
          ws.daily.forEach(function(d) {
            var icon = MOD_ICON[d.module] || '📋';
            html += '<div style="text-align:center"><div style="font-size:24px;">' + icon + '</div><div style="font-size:12px;color:var(--text-light);">' + (MOD_LABEL[d.module]||d.module) + '</div><div style="font-size:18px;font-weight:700;">' + d.completed + '/' + d.total + '</div></div>';
          });
        }
        html += '<div style="text-align:center"><div style="font-size:24px;">🃏</div><div style="font-size:12px;color:var(--text-light);">闪卡复习</div><div style="font-size:18px;font-weight:700;">' + (ws.cards_reviewed||0) + '张</div></div>';
        html += '</div></div>';
      }

      // 时间线
      html += '<div class="card"><h3>📋 最近记录</h3><div style="display:grid;gap:6px;margin-top:8px;">';
      var allItems = [];

      (data.daily || []).forEach(function(d) {
        allItems.push({
          date: (d.date || '').slice(0,10),
          icon: MOD_ICON[d.module] || '📋',
          label: (MOD_LABEL[d.module]||d.module) + ' · ' + (d.content||'').substring(0,25),
          result: d.completed ? (d.score >= 3 ? '✅' : '⚠️') : '⬜',
          detail: d.answer || ''
        });
      });

      (data.flashcards || []).forEach(function(f) {
        allItems.push({
          date: (f.reviewed_at || '').slice(0,10),
          icon: '🃏', label: '闪卡 · ' + (f.card_word||'') + ' (' + (f.rating||'') + ')',
          result: f.rating === 'easy' ? '✅' : f.rating === 'hard' ? '⚠️' : '🔄',
          detail: f.deck || ''
        });
      });

      (data.grammar || []).forEach(function(g) {
        allItems.push({
          date: (g.created_at || '').slice(0,10),
          icon: '✍️', label: '语法 · ' + (g.sentence||'').substring(0,30),
          result: '📝', detail: g.module || ''
        });
      });

      (data.templates || []).forEach(function(t) {
        allItems.push({
          date: (t.created_at || '').slice(0,10),
          icon: '📝', label: '模板 · ' + (t.topic||'').substring(0,25),
          result: '📝', detail: (t.combo_a||'') + '+' + (t.combo_b||'') + '+' + (t.combo_c||'')
        });
      });

      allItems.sort(function(a,b) { return b.date.localeCompare(a.date); });
      allItems.slice(0, 50).forEach(function(item) {
        html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="font-size:11px;color:var(--text-light);min-width:45px;">' + item.date.slice(5) + '</span><span style="font-size:16px;">' + item.icon + '</span><span style="flex:1;">' + htmlesc(item.label) + '</span><span style="font-size:16px;">' + item.result + '</span></div>';
      });

      if (!allItems.length) {
        html += '<div style="text-align:center;color:var(--text-light);padding:24px;">暂无训练记录。开始每日训练吧！</div>';
      }
      html += '</div></div>';

      el.innerHTML = html;
    } catch(e) {
      el.innerHTML = '<div class="card" style="text-align:center;color:var(--text-light);padding:24px;">无法加载记录，请检查网络。</div>';
    }
  } else {
    // 离线模式 — 从本地 DB 读取
    var localHtml = '<div class="card"><h3>📋 本地记录</h3><div style="display:grid;gap:6px;margin-top:8px;">';
    var fcRows = localQuery("SELECT reviewed_at, card_word, rating FROM flashcard_log ORDER BY reviewed_at DESC LIMIT 30");
    var grRows = localQuery("SELECT created_at, sentence, module FROM grammar_log ORDER BY created_at DESC LIMIT 20");
    var tpRows = localQuery("SELECT created_at, topic FROM template_log ORDER BY created_at DESC LIMIT 10");
    var allLocal = [];

    fcRows.forEach(function(r) {
      allLocal.push({ date: (r[0]||'').slice(0,10), icon: '🃏', label: '闪卡·'+r[1], result: r[2]==='easy'?'✅':'🔄' });
    });
    grRows.forEach(function(r) {
      allLocal.push({ date: (r[0]||'').slice(0,10), icon: '✍️', label: '语法·'+(r[1]||'').substring(0,25), result: '📝' });
    });
    tpRows.forEach(function(r) {
      allLocal.push({ date: (r[0]||'').slice(0,10), icon: '📝', label: '模板·'+(r[1]||'').substring(0,20), result: '📝' });
    });

    allLocal.sort(function(a,b) { return b.date.localeCompare(a.date); });
    allLocal.slice(0,40).forEach(function(item) {
      localHtml += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="font-size:11px;color:var(--text-light);min-width:45px;">' + item.date.slice(5) + '</span><span style="font-size:16px;">' + item.icon + '</span><span style="flex:1;">' + htmlesc(item.label) + '</span><span style="font-size:16px;">' + item.result + '</span></div>';
    });

    if (!allLocal.length) localHtml += '<div style="text-align:center;color:var(--text-light);padding:24px;">暂无本地记录。</div>';
    localHtml += '</div></div>';
    el.innerHTML = localHtml;
  }
}

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

// Export IIFE functions to global scope (for HTML onclick handlers)
window.navigate = navigate;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleGroup = toggleGroup;
window.startTask = startTask;
window.switchTab = switchTab;
window.toggleAnswer = toggleAnswer;
window.executeImport = executeImport;
window.toggleTimer = toggleTimer;
window.setTimer = setTimer;
window.startTimer = startTimer;
window.resetTimer = resetTimer;
window.calPrevMonth = calPrevMonth;
window.calNextMonth = calNextMonth;
window.showDayDetail = showDayDetail;
window.checkClassicalQ4 = checkClassicalQ4;
window.doCheck = doCheck;
window.checkBingju1 = checkBingju1;
window.checkBingju2 = checkBingju2;
window.checkBingju3 = checkBingju3;
window.checkBingju4 = checkBingju4;
window.checkBingju5 = checkBingju5;
window.handleImportFile = handleImportFile;
window.saveAssessment = saveAssessment;
window.renderCalendar = renderCalendar;
window.renderRecords = renderRecords;
window.renderMethodPage = renderMethodPage;
window.renderSymbols = renderSymbols;
window.renderBooks = renderBooks;
window.renderPlan = renderPlan;
window.renderSelfAssessment = renderSelfAssessment;
window.renderDailyChecklist = renderDailyChecklist;
window.markTaskDone = markTaskDone;
window.updateHomeStats = updateHomeStats;
window.checkStreak = checkStreak;
window.renderWrongPage = renderWrongPage;
window.recordWrongAnswer = recordWrongAnswer;
window.renderTrainingHistory = renderTrainingHistory;
window.recordTrainingLog = recordTrainingLog;

// ====== 错题本 ======
function recordWrongAnswer(exerciseName, userAnswer, correctAnswer) {
  var module = '';
  var questionEl = document.getElementById(`ex-${exerciseName}`);
  var question = questionEl?.closest('.exercise-item')?.querySelector('strong')?.textContent || exerciseName;
  if (exerciseName.startsWith('reading')) module = 'modern_reading';
  else if (exerciseName.startsWith('classical')) module = 'classical_reading';
  else if (exerciseName.startsWith('bingju') || exerciseName.startsWith('language')) module = 'grammar';
  else if (exerciseName.startsWith('writing')) module = 'writing';
  apiCall('POST', '/api/wrong', {
    exercise_id: 0, module: module, question_type: '', question: question,
    user_answer: userAnswer, correct_answer: correctAnswer, explanation: ''
  });
  localRun("INSERT INTO wrong_items (exercise_id, module, question, user_answer, correct_answer) VALUES (?,?,?,?,?)",
    [0, module, question, userAnswer, correctAnswer]);
  // Also record to unified training_log
  recordTrainingLog(module, question, userAnswer, correctAnswer, 0);
}

// ====== 统一训练记录 ======
function recordTrainingLog(module, question, userAnswer, correctAnswer, isCorrect) {
  apiCall('POST', '/api/training-log', {
    module: module, exercise_id: 0, question: question,
    user_answer: userAnswer, correct_answer: correctAnswer,
    is_correct: isCorrect, score: 0
  });
  localRun("INSERT INTO training_log (module, question, user_answer, correct_answer, is_correct) VALUES (?,?,?,?,?)",
    [module, question, userAnswer, correctAnswer, isCorrect]);
}

async function renderTrainingHistory() {
  var el = document.getElementById('trainingHistoryContent');
  if (!el) return;
  var filter = document.getElementById('tlogFilter')?.value || '';
  var items = [];
  if (apiAvailable) {
    try {
      var qs = filter ? '?module=' + encodeURIComponent(filter) + '&limit=200' : '?limit=200';
      var data = await apiCall('GET', '/api/training-log' + qs);
      if (data && data.items) items = data.items;
    } catch(e) {}
  }
  if (!items.length) {
    var rows = localQuery("SELECT * FROM training_log ORDER BY created_at DESC LIMIT 200", []);
    items = rows.map(function(r) { return {id:r[0],module:r[1],question:r[3],user_answer:r[4],correct_answer:r[5],is_correct:r[6],correction_note:r[8],reviewed:r[9],created_at:r[11]}; });
  }
  if (!items.length) {
    el.innerHTML = '<div class="card" style="text-align:center;padding:40px;"><p style="font-size:18px;">📊 暂无训练记录</p><p style="color:var(--text-light);">完成练习后记录自动显示在此。</p></div>';
    return;
  }
  var correct = items.filter(function(i) { return i.is_correct; }).length;
  var wrong = items.length - correct;
  var html = '<div class="card" style="margin-bottom:10px;"><div style="display:flex;gap:20px;font-size:13px;">';
  html += '<span>📊 总计 <strong>' + items.length + '</strong></span>';
  html += '<span style="color:#27ae60;">✅ ' + correct + '</span>';
  html += '<span style="color:#e74c3c;">❌ ' + wrong + '</span>';
  html += '<span>📝 待复习 <strong style="color:#e67e22;">' + items.filter(function(i){return !i.is_correct && !i.reviewed;}).length + '</strong></span>';
  html += '<select id="tlogFilter" onchange="renderTrainingHistory()" style="margin-left:auto;font-size:12px;padding:2px 6px;border:1px solid var(--border);border-radius:4px;background:var(--card-bg);">';
  html += '<option value="">全部模块</option>';
  var MODS = {modern_reading:'现代文阅读',classical_reading:'古诗文阅读',grammar:'语言文字运用',writing:'写作表达',flashcard:'闪卡'};
  Object.keys(MODS).forEach(function(k) {
    html += '<option value="' + k + '"' + (filter===k?' selected':'') + '>' + MODS[k] + '</option>';
  });
  html += '</select></div></div>';
  items.forEach(function(item, i) {
    var cls = item.is_correct ? 'border-left:3px solid #27ae60;' : 'border-left:3px solid #e74c3c;';
    html += '<div class="card" style="margin-top:6px;' + cls + 'padding:10px 14px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:start;">';
    html += '<div style="flex:1;">';
    html += '<p style="font-size:11px;color:var(--text-light);margin-bottom:3px;">' + (item.created_at||'').slice(0,16) + ' · ' + (MODS[item.module]||item.module) + '</p>';
    html += '<p style="font-size:13px;margin-bottom:4px;"><strong>' + htmlesc(item.question) + '</strong></p>';
    html += '<p style="font-size:12px;margin-bottom:1px;">你的答案：<span style="color:' + (item.is_correct?'#27ae60':'#e74c3c') + ';">' + htmlesc(item.user_answer||'(空)') + '</span>';
    if (!item.is_correct) html += ' → 正确答案：<span style="color:#27ae60;">' + htmlesc(item.correct_answer||'') + '</span>';
    html += '</p>';
    if (item.correction_note) html += '<p style="font-size:12px;color:var(--accent2);margin-top:4px;">📝 纠错笔记：' + htmlesc(item.correction_note) + '</p>';
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">';
    html += '<button class="btn-small" onclick="editCorrectionNote(' + item.id + ')" style="font-size:11px;padding:2px 8px;">✏️ 纠错</button>';
    if (!item.reviewed) html += '<button class="btn-small" onclick="markReviewed(' + item.id + ')" style="font-size:11px;padding:2px 8px;background:#e67e22;color:#fff;">👁 已复习</button>';
    html += '</div></div></div>';
  });
  el.innerHTML = html;
}

function editCorrectionNote(id) {
  var note = prompt('请输入纠错笔记：');
  if (note === null) return;
  apiCall('PUT', '/api/training-log/' + id + '/note', {note: note});
  localRun("UPDATE training_log SET correction_note=? WHERE id=?", [note, id]);
  renderTrainingHistory();
}

function markReviewed(id) {
  apiCall('PUT', '/api/training-log/' + id + '/review');
  localRun("UPDATE training_log SET reviewed=1 WHERE id=?", [id]);
  renderTrainingHistory();
}
window.editCorrectionNote = editCorrectionNote;
window.markReviewed = markReviewed;
window.recordTrainingLog = recordTrainingLog;

async function renderWrongPage() {
  var el = document.getElementById('wrongContent');
  if (!el) return;
  var items = [];
  if (apiAvailable) {
    try {
      var data = await apiCall('GET', '/api/wrong');
      if (data && data.items) items = data.items;
    } catch(e) {}
  }
  if (!items.length) {
    var local = localQuery("SELECT * FROM wrong_items ORDER BY wrong_at DESC", []);
    items = local.map(function(r) { return {id:r[0], question:r[4], user_answer:r[5], correct_answer:r[6], wrong_count:r[7]||1, reviewed:r[9]||0}; });
  }
  if (!items.length) {
    el.innerHTML = '<div class="card" style="text-align:center;padding:40px;"><p style="font-size:18px;">🎉 暂无错题</p><p style="color:var(--text-light);">继续练习，答错的题目会自动收录到这里。</p></div>';
    return;
  }
  var html = '<div class="card"><h3>📋 错题列表 (' + items.length + '题)</h3></div>';
  items.forEach(function(item, i) {
    html += '<div class="card" id="wrong-' + item.id + '" style="margin-top:8px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:start;">';
    html += '<div style="flex:1;"><p style="font-size:13px;color:var(--text-light);margin-bottom:4px;">#' + (i+1) + ' · 错' + (item.wrong_count||1) + '次</p>';
    html += '<p style="font-size:14px;margin-bottom:6px;"><strong>' + htmlesc(item.question) + '</strong></p>';
    html += '<p style="font-size:12px;margin-bottom:2px;"><span style="color:#e74c3c;">❌ 你的答案：' + htmlesc(item.user_answer||'') + '</span></p>';
    html += '<p style="font-size:12px;color:#27ae60;">✅ 正确答案：' + htmlesc(item.correct_answer||'') + '</p>';
    html += '</div>';
    html += '<button class="btn-small" onclick="removeWrong(' + item.id + ')" style="background:#27ae60;color:#fff;white-space:nowrap;">✅ 已掌握</button>';
    html += '</div></div>';
  });
  el.innerHTML = html;
}

function removeWrong(id) {
  apiCall('DELETE', '/api/wrong/' + id);
  localRun("DELETE FROM wrong_items WHERE id=?", [id]);
  var card = document.getElementById('wrong-' + id);
  if (card) { card.style.opacity = '0.3'; card.querySelector('button').textContent = '已移除'; card.querySelector('button').disabled = true; }
  setTimeout(function() { renderWrongPage(); }, 1000);
}
window.removeWrong = removeWrong;
// Export shared state for cross-file access (flashcard.js, exercises.js)
// Use Object.defineProperty getter/setter to keep window in sync with IIFE-local vars
var _exports = [
  'currentPage', 'currentDeck', 'deckIndex', 'deckQueue', 'flipped',
  'cardTimer', 'cardSeconds',
  'streak', 'lastActive', 'templateCount', 'grammarCount',
  'timerSeconds', 'timerRunning', 'timerInterval',
  'completedTasks'
];
for (var i = 0; i < _exports.length; i++) {
  (function(name) {
    Object.defineProperty(window, name, {
      get: function() {
        // eval to access IIFE-local var by name
        return eval(name);
      },
      set: function(v) {
        eval(name + ' = v');
      },
      configurable: true, enumerable: true
    });
  })(_exports[i]);
}
})();
