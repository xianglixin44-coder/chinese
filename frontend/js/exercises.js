// exercises.js — 训练练习模块
// Depends on: config.js, utils.js, data.js, api.js
// Provides: reading, daily, templates, grammar, syntax, rhetoric, translation, novel analysis

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
            html += '<div class="ex-option"><input type="radio" name="dailyQ" value="' + i + '" onchange="checkDailyAnswer(\'' + ex.module + '\',' + i + ',\'' + ex.answer + '\')"> ' + htmlesc(o) + '</label>';
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
          html += '<div class="ex-option"><input type="radio" name="dailyQ" value="' + i + '" onchange="checkDailyAnswer(\'' + ex.module + '\',' + i + ',\'' + ex.answer + '\')"> ' + htmlesc(o) + '</label>';
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

// ====== 断句训练（从后端数据库加载）======
async function loadDuanjuExample(idx) {
  // 确保数据已加载
  await ensureDuanjuLoaded();
  // 随机模式
  if (idx === 'random') {
    var total = (DUANJU_EXAMPLES && DUANJU_EXAMPLES.length) || 1;
    idx = Math.floor(Math.random() * total);
  }
  const today = new Date().toISOString().slice(0, 10);
  var examples = DUANJU_EXAMPLES;
  if (!examples || !examples.length) {
    document.getElementById('duanjuContent').innerHTML = '<p style="color:var(--text-light);font-size:13px;">暂无断句题目，请先导入数据。</p>';
    return;
  }
  if (idx >= examples.length) idx = 0;
  var ex = examples[idx];
  var html = '<div class="duanju-exercise">';
  html += '<div class="duanju-passage"><p><strong>原文（无标点）：</strong></p>';
  html += '<p class="duanju-text" style="font-size:16px;line-height:2;letter-spacing:1px;background:#f8f6f0;padding:12px;border-radius:6px;border:1px solid #e0d8c8;">' + htmlesc(ex.sentence) + '</p></div>';
  html += '<div class="duanju-options" style="margin-top:10px;">';
  var labels = ['A', 'B', 'C', 'D'];
  for (var i = 0; i < ex.options.length; i++) {
    html += '<div class="ex-option" style="display:block;margin-bottom:8px;padding:8px 10px;border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;line-height:1.6;" onclick="checkDuanju(' + idx + ', ' + i + ', this)">';
    html += '<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;background:var(--accent);color:#fff;font-weight:700;font-size:12px;margin-right:8px;">' + labels[i] + '</span>';
    html += htmlesc(ex.options[i]);
    html += '</div>';
  }
  html += '</div>';
  html += '<div id="duanju-result-' + idx + '" class="mt-12"></div>';
  html += '</div>';
  document.getElementById('duanjuContent').innerHTML = html;
  document.getElementById('duanjuIdx').value = idx;
  apiCall('POST', '/api/grammar/log', {sentence: ex.sentence.substring(0, 30), example_idx: idx, module: '断句'});
  apiCall('POST', '/api/training/session', {date: today, module: '断句', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, ?, 'classical')", [ex.sentence.substring(0, 30), idx]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}

async function ensureDuanjuLoaded() {
  if (typeof loadDuanjuFromDB === 'function' && (!DUANJU_EXAMPLES || !DUANJU_EXAMPLES.length)) {
    await loadDuanjuFromDB();
  }
  // 更新题目总数
  var cntEl = document.getElementById('duanjuTotalCount');
  if (cntEl && DUANJU_EXAMPLES) cntEl.textContent = DUANJU_EXAMPLES.length;
}

function checkDuanju(idx, selected, el) {
  var examples = DUANJU_EXAMPLES;
  if (!examples || !examples.length || idx >= examples.length) return;
  var ex = examples[idx];
  var allOpts = document.querySelectorAll('.duanju-options .ex-option');
  allOpts.forEach(function(o) { o.style.borderColor = 'var(--border)'; o.style.background = ''; });
  if (selected === ex.answer) {
    el.style.borderColor = '#27ae60'; el.style.background = '#e8f8e8';
  } else {
    el.style.borderColor = '#c0392b'; el.style.background = '#fde8e8';
    if (ex.answer >= 0 && ex.answer < allOpts.length) {
      allOpts[ex.answer].style.borderColor = '#27ae60'; allOpts[ex.answer].style.background = '#e8f8e8';
    }
  }
  document.getElementById('duanju-result-' + idx).innerHTML = '<div class="ex-answer" style="display:block;border-left:3px solid ' + (selected === ex.answer ? '#27ae60' : '#c0392b') + ';padding:10px 14px;background:#fafafa;border-radius:6px;margin-top:8px;"><p style="font-weight:600;margin-bottom:4px;">' + (selected === ex.answer ? '✅ 正确！' : '❌ 正确答案是 ' + ['A','B','C','D'][ex.answer]) + '</p><pre class="analysis" style="font-family:inherit;font-size:13px;white-space:pre-wrap;">' + (ex.analysis || '') + '</pre></div>';
  if (selected !== ex.answer) {
    apiCall('POST', '/api/training/log', {module: '断句', exercise_id: idx, question: ex.sentence.substring(0, 30), user_answer: ['A','B','C','D'][selected], correct_answer: ['A','B','C','D'][ex.answer], is_correct: 0});
  }
}

function nextDuanju() {
  var idx = parseInt(document.getElementById('duanjuIdx').value || '0');
  var total = (DUANJU_EXAMPLES && DUANJU_EXAMPLES.length) || 1;
  var next = (idx + 1) % total;
  loadDuanjuExample(next);
}
// ====== 高考题型切换（含断句数据自动加载）======
function switchGKTab(page, tab, el) {
  // 切换标签样式
  var parent = el.closest('.gaokao-tabs') || el.parentElement;
  if (parent) {
    parent.querySelectorAll('.gk-tab').forEach(function(t) {
      t.style.background = 'var(--surface)';
      t.style.color = 'var(--text-light)';
      t.style.border = '1px solid var(--border)';
    });
    el.style.background = 'var(--primary)';
    el.style.color = '#fff';
  }
  // 切换面板
  var panelId = 'gk-' + page + '-' + tab;
  document.querySelectorAll('[id^="gk-' + page + '-"]').forEach(function(p) { p.style.display = 'none'; });
  var panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'block';
  // 如果是断句标签，自动加载数据
  if (tab === 'duanju') {
    ensureDuanjuLoaded().then(function() {
      var total = (DUANJU_EXAMPLES && DUANJU_EXAMPLES.length) || 0;
      var cntEl = document.getElementById('duanjuTotalCount');
      if (cntEl) cntEl.textContent = total;
    });
  }
}

// switchGKTab already defined above (merged)

// ====== 后续扩展：文化常识、诗歌、默写（可在此添加数据） ======



// ====== 文化常识（3分）======
var WENHUA_LOADED = false;
function loadWenhua() {
  if (WENHUA_LOADED) return;
  WENHUA_LOADED = true;
  const today = new Date().toISOString().slice(0, 10);
  fetchExercises('classical_reading', 'wenhua').then(function(r) {
    if (!r || !r.items || !r.items.length) {
      document.getElementById('wenhuaContent').innerHTML = '<p style="color:var(--text-light);font-size:13px;">暂无数据</p>';
      return;
    }
    var html = '';
    r.items.forEach(function(ex, idx) {
      html += '<div class="exercise-item" style="margin-bottom:14px;">';
      html += '<p style="font-size:13px;margin-bottom:6px;"><strong>' + (idx+1) + '.</strong> ' + htmlesc(ex.question || ex.content) + '</p>';
      var opts = JSON.parse(ex.options_json || '[]');
      var labels = ['A','B','C','D'];
      opts.forEach(function(o, oi) {
        html += '<div class="ex-option" style="display:block;margin-bottom:4px;padding:6px 10px;border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:12px;" onclick="checkWenhua(' + idx + ',' + oi + ',this)">';
        html += '<strong>' + labels[oi] + '.</strong> ' + htmlesc(o);
        html += '</div>';
      });
      html += '<div id="wenhua-result-' + idx + '" class="mt-4"></div>';
      html += '</div>';
    });
    document.getElementById('wenhuaContent').innerHTML = html;
    window._wenhuaData = r.items;
    apiCall('POST','/api/training/session',{date:today,module:'文化常识',duration_min:3});
    checkStreak(); updateHomeStats();
  });
}

function checkWenhua(idx, selected, el) {
  var items = window._wenhuaData;
  if (!items || idx >= items.length) return;
  var answer = items[idx].answer;
  var answerIdx = ['A','B','C','D'].indexOf(answer);
  var allOpts = el.parentElement.querySelectorAll('.ex-option');
  allOpts.forEach(function(o) { o.style.borderColor = 'var(--border)'; o.style.background = ''; });
  if (selected === answerIdx) {
    el.style.borderColor = '#27ae60'; el.style.background = '#e8f8e8';
  } else {
    el.style.borderColor = '#c0392b'; el.style.background = '#fde8e8';
    if (answerIdx >= 0) { allOpts[answerIdx].style.borderColor = '#27ae60'; allOpts[answerIdx].style.background = '#e8f8e8'; }
  }
  document.getElementById('wenhua-result-' + idx).innerHTML = '<div class="ex-answer" style="display:block;border-left:3px solid ' + (selected===answerIdx?'#27ae60':'#c0392b') + ';padding:8px 12px;background:#fafafa;border-radius:4px;margin-top:4px;font-size:12px;"><p>' + (selected===answerIdx?'✅ 正确！':'❌ 正确答案：' + answer) + '</p><p style="color:#555;margin-top:2px;">' + htmlesc(items[idx].explanation || '') + '</p></div>';
}

// ====== 内容概括（3分）======
var NEIRONG_LOADED = false;
function loadNeirong() {
  if (NEIRONG_LOADED) return;
  NEIRONG_LOADED = true;
  const today = new Date().toISOString().slice(0, 10);
  fetchExercises('classical_reading', 'neirong').then(function(r) {
    if (!r || !r.items || !r.items.length) { document.getElementById('neirongContent').innerHTML = '<p style="color:var(--text-light);">暂无数据</p>'; return; }
    var html = '';
    r.items.forEach(function(ex, idx) {
      html += '<div class="exercise-item" style="margin-bottom:14px;"><p style="font-size:13px;margin-bottom:6px;"><strong>' + (idx+1) + '.</strong> ' + htmlesc(ex.question || ex.content) + '</p>';
      var opts = JSON.parse(ex.options_json || '[]');
      var labels = ['A','B','C','D'];
      opts.forEach(function(o, oi) {
        html += '<div class="ex-option" style="display:block;margin-bottom:4px;padding:6px 10px;border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:12px;" onclick="checkNeirong(' + idx + ',' + oi + ',this)">';
        html += '<strong>' + labels[oi] + '.</strong> ' + htmlesc(o) + '</label>';
      });
      html += '<div id="neirong-result-' + idx + '" class="mt-4"></div></div>';
    });
    document.getElementById('neirongContent').innerHTML = html;
    window._neirongData = r.items;
    apiCall('POST','/api/training/session',{date:today,module:'内容概括',duration_min:3});
    checkStreak(); updateHomeStats();
  });
}
function checkNeirong(idx, selected, el) {
  var items = window._neirongData;
  if (!items || idx >= items.length) return;
  var answer = items[idx].answer;
  var answerIdx = ['A','B','C','D'].indexOf(answer);
  var allOpts = el.parentElement.querySelectorAll('.ex-option');
  allOpts.forEach(function(o) { o.style.borderColor = 'var(--border)'; o.style.background = ''; });
  if (selected === answerIdx) {
    el.style.borderColor = '#27ae60'; el.style.background = '#e8f8e8';
  } else {
    el.style.borderColor = '#c0392b'; el.style.background = '#fde8e8';
    if (answerIdx >= 0) { allOpts[answerIdx].style.borderColor = '#27ae60'; allOpts[answerIdx].style.background = '#e8f8e8'; }
  }
  document.getElementById('neirong-result-' + idx).innerHTML = '<div class="ex-answer" style="display:block;border-left:3px solid ' + (selected===answerIdx?'#27ae60':'#c0392b') + ';padding:8px 12px;background:#fafafa;border-radius:4px;margin-top:4px;font-size:12px;"><p>' + (selected===answerIdx?'✅ 正确！':'❌ 正确答案：' + answer) + '</p><p style="color:#555;margin-top:2px;">' + htmlesc(items[idx].explanation || '') + '</p></div>';
}

// ====== 诗歌阅读（9分）======
var POEM_LOADED = false;
function loadPoem() {
  if (POEM_LOADED) return;
  POEM_LOADED = true;
  const today = new Date().toISOString().slice(0, 10);
  fetchExercises('classical_reading', 'poem').then(function(r) {
    if (!r || !r.items || !r.items.length) { document.getElementById('poemContent').innerHTML = '<p style="color:var(--text-light);">暂无数据</p>'; return; }
    var html = '';
    r.items.forEach(function(ex, idx) {
      html += '<div class="exercise-item" style="margin-bottom:14px;">';
      html += '<div style="background:#f8f6f0;padding:10px 14px;border-radius:6px;margin-bottom:8px;font-size:13px;line-height:1.8;font-family:KaiTi,STKaiti,serif;">' + htmlesc(ex.content || ex.question).replace(/\n/g,'<br>') + '</div>';
      html += '<div style="margin-top:6px;"><div class="badge-sm bg-blue" style="font-size:11px;">选择题（3分）</div></div>';
      var opts = JSON.parse(ex.options_json || '[]');
      var labels = ['A','B','C','D'];
      opts.forEach(function(o, oi) {
        html += '<div class="ex-option" style="display:block;margin-bottom:4px;padding:6px 10px;border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:12px;" onclick="checkPoem(' + idx + ',' + oi + ',this)">';
        html += '<strong>' + labels[oi] + '.</strong> ' + htmlesc(o) + '</label>';
      });
      html += '<div id="poem-result-' + idx + '" class="mt-4"></div></div>';
    });
    document.getElementById('poemContent').innerHTML = html;
    window._poemData = r.items;
    apiCall('POST','/api/training/session',{date:today,module:'诗歌鉴赏',duration_min:5});
    checkStreak(); updateHomeStats();
  });
}
function checkPoem(idx, selected, el) {
  var items = window._poemData;
  if (!items || idx >= items.length) return;
  var answer = items[idx].answer;
  var answerIdx = ['A','B','C','D'].indexOf(answer);
  var allOpts = el.parentElement.querySelectorAll('.ex-option');
  allOpts.forEach(function(o) { o.style.borderColor = 'var(--border)'; o.style.background = ''; });
  if (selected === answerIdx) {
    el.style.borderColor = '#27ae60'; el.style.background = '#e8f8e8';
  } else {
    el.style.borderColor = '#c0392b'; el.style.background = '#fde8e8';
    if (answerIdx >= 0) { allOpts[answerIdx].style.borderColor = '#27ae60'; allOpts[answerIdx].style.background = '#e8f8e8'; }
  }
  var extra = '<p style="color:#555;margin-top:2px;">' + htmlesc(items[idx].explanation || '') + '</p>';
  document.getElementById('poem-result-' + idx).innerHTML = '<div class="ex-answer" style="display:block;border-left:3px solid ' + (selected===answerIdx?'#27ae60':'#c0392b') + ';padding:8px 12px;background:#fafafa;border-radius:4px;margin-top:4px;font-size:12px;"><p>' + (selected===answerIdx?'✅ 正确！':'❌ 正确答案：' + answer) + '</p>' + extra + '</div>';
}

// ====== 名篇默写（6分）======
var MOXIE_LOADED = false;
function loadMoxie() {
  if (MOXIE_LOADED) return;
  MOXIE_LOADED = true;
  const today = new Date().toISOString().slice(0, 10);
  fetchExercises('classical_reading', 'moxie').then(function(r) {
    if (!r || !r.items || !r.items.length) { document.getElementById('moxieContent').innerHTML = '<p style="color:var(--text-light);">暂无数据</p>'; return; }
    var html = '';
    r.items.forEach(function(ex, idx) {
      html += '<div class="exercise-item" style="margin-bottom:14px;padding:10px 14px;background:#fafafa;border-radius:6px;">';
      html += '<p style="font-size:13px;margin-bottom:6px;line-height:1.6;">' + htmlesc(ex.question || ex.content).replace(/\n/g,'<br>') + '</p>';
      html += '<input class="gram-input" id="moxie-input-' + idx + '" placeholder="输入答案（上下句用逗号分隔）…" style="font-size:13px;padding:6px 10px;">';
      html += ' <button class="btn-small" onclick="checkMoxie(' + idx + ')" style="font-size:12px;">核对</button>';
      html += '<div id="moxie-result-' + idx + '" class="mt-4"></div></div>';
    });
    document.getElementById('moxieContent').innerHTML = html;
    window._moxieData = r.items;
    apiCall('POST','/api/training/session',{date:today,module:'名篇默写',duration_min:3});
    checkStreak(); updateHomeStats();
  });
}
function checkMoxie(idx) {
  var items = window._moxieData;
  if (!items || idx >= items.length) return;
  var input = document.getElementById('moxie-input-' + idx).value.trim();
  var answer = items[idx].answer;
  var isCorrect = input.replace(/[，。；""''「」]/g,'') === answer.replace(/[，。；""''「」]/g,'');
  document.getElementById('moxie-result-' + idx).innerHTML = '<div class="ex-answer" style="display:block;border-left:3px solid ' + (isCorrect?'#27ae60':'#e67e22') + ';padding:8px 12px;background:#fafafa;border-radius:4px;margin-top:4px;font-size:12px;"><p>' + (isCorrect?'✅ 正确！':'📝 参考答案：' + answer) + '</p><p style="color:#555;margin-top:2px;">' + htmlesc(items[idx].explanation || '') + '</p></div>';
  apiCall('POST','/api/training/log',{module:'名篇默写',exercise_id:idx,question:items[idx].question,user_answer:input,correct_answer:answer,is_correct:isCorrect?1:0});
}

window.loadDuanjuExample = loadDuanjuExample;
window.loadMoxie = loadMoxie;
window.checkMoxie = checkMoxie;
window.checkDuanju = checkDuanju;
window.nextDuanju = nextDuanju;
window.ensureDuanjuLoaded = ensureDuanjuLoaded;
window.switchGKTab = switchGKTab;
window.applyTemplate = applyTemplate;
window.analyzeGrammar = analyzeGrammar;
window.analyzeSyntax = analyzeSyntax;
window.analyzeRhetoric = analyzeRhetoric;
window.analyzeTranslation = analyzeTranslation;
window.analyzeNovel = analyzeNovel;
window.analyzeImplicature = analyzeImplicature;
window.loadGrammarExample = loadGrammarExample;
window.loadSyntaxExample = loadSyntaxExample;
window.loadRhetoricExample = loadRhetoricExample;
window.loadTranslationExample = loadTranslationExample;
window.loadNovelExample = loadNovelExample;
window.checkReadingAnswer = checkReadingAnswer;
window.checkDailyAnswer = checkDailyAnswer;
window.checkDailyText = checkDailyText;
window.renderReadingTabs = renderReadingTabs;
window.renderTemplates = renderTemplates;
window.loadDailyExercise = loadDailyExercise;
window.renderDailyExercise = renderDailyExercise;
// ====== 每日训练页面 ======
var _trainingSession = null;
var _trainingIdx = 0;

function getMethodLabel(item) {
  try {
    var extra = JSON.parse(item.extra_json || '{}');
    return extra.method || '';
  } catch(e) { return ''; }
}



// 方法介绍文案
var METHOD_INTROS = {
  '虚词标志法': '文言断句以虚词为标志。「也」「者」「矣」「焉」「乎」「耳」「哉」等句末语气词<strong>后必断</strong>；「曰」「云」「言」等对话标志<strong>前后皆断</strong>；「夫」「盖」「且夫」等发语词在句首时<strong>前面断开</strong>。',
  '主语识别法': '文言断句以主语为核心。遇到<strong>新人名、新事物作主语</strong>，其前断开；<strong>动宾结构完整</strong>不能从中切开；<strong>主语转换</strong>（话题改变）处断开。',
  '结构切分法': '文言断句以结构为单位。<strong>时间状语</strong>（如「三年」「童幼时」）独立断开；<strong>表字、籍贯、官职</strong>等信息各自成句；<strong>对偶、排比</strong>句式参照对称结构断开。',
  '综合运用法': '综合运用虚词标志、主语识别、结构切分三种方法。先找虚词，再定主语，最后用对偶排比验证。',
  '古今异义': '文言翻译先辨古今异义。「痛恨」=痛心遗憾（非仇恨）、「交通」=交错相通（非运输）、「妻子」=妻子儿女（非配偶）。<strong>切忌以今义解古义</strong>。',
  '词类活用': '文言翻译注意词类活用。<strong>名词作状语</strong>（「手」→亲手）、<strong>形容词作动词</strong>、<strong>使动/意动用法</strong>。先识别活用类型，再用「活用词+本义」翻译。',
  '虚词翻译': '文言虚词翻译要灵活。「盖」=大概/发语词（句首可不译）、「夫」=发语词（不译）、「之」根据位置判断（主谓间取独/宾语代词/定语标志）。',
  '字字落实': '文言翻译三步法：①<strong>字字落实</strong>每个实词对应现代汉语；②<strong>句法还原</strong>调整语序为现代语序；③<strong>规范译文</strong>补充省略成分，连贯通顺。',
  '通假字识别': '文言翻译先辨通假字。根据<strong>上下文语义</strong>和<strong>字音相似</strong>推断本字。常见通假如「说」通「悦」、「见」通「现」、「反」通「返」。',
  '情境默写': '根据题干描述的情境，从必背篇目中提取对应名句。<strong>先定位篇目</strong>→<strong>再锁定段落</strong>→<strong>最后回忆原句</strong>。注意不写错别字。'
};
var _lastMethod = '';

function showMethodIntro(method) {
  if (!method || method === _lastMethod) return '';
  _lastMethod = method;
  var intro = METHOD_INTROS[method];
  if (!intro) return '';
  return '<div style="background:linear-gradient(135deg,#e8f0fe,#f0f4ff);padding:12px 16px;border-radius:8px;margin-bottom:12px;border-left:4px solid #1a73e8;">' +
    '<p style="font-size:12px;color:#1a73e8;margin-bottom:6px;"><strong>📐 ' + htmlesc(method) + '</strong></p>' +
    '<p style="font-size:12px;color:#444;line-height:1.8;margin:0;">' + intro + '</p>' +
    '</div>';
}

// ====== 训练模块配置 ======
var TRAINING_MODULES = [
  {id:'classical_reading', icon:'🏛️', title:'古诗文阅读', desc:'断句·文化常识·默写·翻译·内容概括', count:6, time:'10分钟'},
  {id:'modern_reading', icon:'📖', title:'现代文阅读', desc:'论述类·文学类·实用类', count:4, time:'8分钟'},
  {id:'grammar', icon:'✍️', title:'语法训练', desc:'病句辨析', count:2, time:'3分钟'},
  {id:'writing', icon:'📝', title:'写作训练', desc:'审题立意·结构搭建', count:1, time:'5分钟'}
];

function renderTrainingModules() {
  var container = document.getElementById('trainingModules');
  if (!container) return;
  var today = new Date().toISOString().slice(0, 10);

  var html = '';
  TRAINING_MODULES.forEach(function(mod) {
    html += '<div class="card" style="padding:20px;cursor:default;" id="mod-card-' + mod.id + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">';
    html += '<span style="font-size:28px;">' + mod.icon + '</span>';
    html += '<div><h4 style="margin:0;font-size:15px;">' + mod.title + '</h4>';
    html += '<p style="font-size:11px;color:var(--text-light);margin:2px 0 0;">' + mod.desc + '</p></div>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">';
    html += '<span style="font-size:12px;color:var(--text-light);">' + mod.count + '题 · ' + mod.time + '</span>';
    html += '<button class="btn-small" onclick="startDailyTraining(\'' + mod.id + '\')" style="font-size:13px;padding:6px 16px;" id="btn-' + mod.id + '">开始训练</button>';
    html += '</div>';
    html += '<p id="mod-status-' + mod.id + '" style="font-size:11px;margin-top:8px;display:none;"></p>';
    html += '</div>';
  });
  container.innerHTML = html;

  // Check status for each module
  TRAINING_MODULES.forEach(function(mod) {
    checkModuleStatus(mod.id);
  });
}

function checkModuleStatus(moduleId) {
  apiCall('GET', '/api/daily/session?module=' + moduleId + '&check_only=1').then(function(r) {
    var statusEl = document.getElementById('mod-status-' + moduleId);
    var btnEl = document.getElementById('btn-' + moduleId);
    if (!r || !r.items) return;
    var allDone = r.total > 0 && r.items.every(function(it) { return it.is_correct >= 0; });
    var inProgress = r.total > 0 && r.items.some(function(it) { return it.is_correct >= 0; }) && !allDone;
    if (allDone) {
      if (statusEl) { statusEl.style.display = 'block'; statusEl.style.color = '#27ae60'; statusEl.textContent = '✅ 今日已完成'; }
      if (btnEl) { btnEl.textContent = '重新训练'; btnEl.style.background = '#e8f5e9'; btnEl.style.color = '#27ae60'; }
    } else if (inProgress) {
      if (statusEl) { statusEl.style.display = 'block'; statusEl.style.color = '#f39c12'; statusEl.textContent = '⏳ 进行中，点击继续'; }
      if (btnEl) { btnEl.textContent = '继续训练'; btnEl.style.background = '#fff3e0'; btnEl.style.color = '#e67e22'; }
    }
  }).catch(function() {});
}

function startDailyTraining(moduleName) {
  _lastMethod = '';
  _currentModule = moduleName || '';
  document.getElementById('trainingStart').style.display = 'none';
  document.getElementById('trainingProgress').style.display = 'block';
  document.getElementById('trainingQuiz').style.display = 'block';
  document.getElementById('trainingResult').style.display = 'none';
  
  var url = '/api/daily/session';
  if (moduleName) {
    url += '?module=' + encodeURIComponent(moduleName);
  }
  // 显示模块名称
  var modLabel = '';
  TRAINING_MODULES.forEach(function(m) { if (m.id === moduleName) modLabel = m.icon + ' ' + m.title; });
  document.getElementById('trainingDate').textContent = modLabel || '📅 综合训练';
  
  apiCall('GET', url).then(function(r) {
    if (!r || !r.items || !r.items.length) {
      document.getElementById('trainingQuiz').innerHTML = '<div class="card" style="text-align:center;padding:24px;"><p>📭 该模块暂无可用题目，请先导入数据。</p><button class="btn-small" onclick="resetTraining()" style="margin-top:12px;">← 返回模块列表</button></div>';
      return;
    }
    _trainingSession = r;
    _trainingIdx = 0;
    updateTrainingProgress();
    renderTrainingQuestion(0);
  });
}

function updateTrainingProgress() {
  if (!_trainingSession) return;
  var total = _trainingSession.total;
  var done = _trainingSession.items.filter(function(it) { return it.is_correct >= 0; }).length;
  // Include current if already answered
  document.getElementById('trainingCount').textContent = done + '/' + total + ' 题';
  document.getElementById('trainingBar').style.width = Math.round(done / total * 100) + '%';
  var dots = '';
  for (var i = 0; i < total; i++) {
    var it = _trainingSession.items[i];
    if (it.is_correct === 1) dots += '🟢';
    else if (it.is_correct === 0) dots += '🔴';
    else if (i === _trainingIdx) dots += '⚪';
    else dots += '○';
  }
  document.getElementById('trainingDots').textContent = dots;
}

function renderTrainingQuestion(idx) {
  if (!_trainingSession || idx >= _trainingSession.total) {
    finishTraining();
    return;
  }
  _trainingIdx = idx;
  updateTrainingProgress();
  
  var item = _trainingSession.items[idx];
  var typeNames = {discourse:"论述类",literary:"文学类",practical:"实用类",duanju:'断句', wenhua:'文化常识', moxie:'默写', translation:'翻译', neirong:'内容概括', bingju:'病句辨析', essay:'写作审题', scaffold:'写作脚手架', semi_open:'半开放写作'};
  var typeName = typeNames[item.type] || item.type;
  
  var html = '';
  html += '<div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;">';
  html += '<span style="background:var(--primary);color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;">' + typeName + '</span>';
  html += '<span style="font-size:11px;color:var(--text-light);">题 ' + (idx+1) + '/' + _trainingSession.total + '</span>';
  html += '</div>';
  
  // Method intro + label (show intro when method changes)
  var method = getMethodLabel(item);
  if (method) {
    html += showMethodIntro(method);
  }

  // Render based on type
  if (item.type === 'duanju') {
    // 断句：显示原文 + 4个选项
    var raw = item.content || '';
    html += '<div style="background:#f0f4f8;padding:12px 16px;border-radius:6px;margin-bottom:10px;font-size:16px;line-height:1.8;font-family:serif;letter-spacing:1px;">' + htmlesc(raw) + '</div>';
    html += '<p style="font-size:13px;color:var(--text-light);margin-bottom:10px;">下列断句正确的一项是：</p>';
  } else if (item.type === 'translation') {
    // 翻译：显示原句 + 操作提示
    var raw = item.content || '';
    if (raw) {
      html += '<div style="background:#fef9e7;padding:10px 14px;border-radius:6px;margin-bottom:8px;font-size:15px;line-height:1.7;font-family:serif;border-left:3px solid #f1c40f;">' + htmlesc(raw) + '</div>';
    }
    html += '<p style="font-size:13px;color:var(--text-light);margin-bottom:10px;">' + htmlesc(item.question || '请翻译') + '</p>';
  } else if (item.type === 'moxie') {
    // 默写：显示情境描述
    html += '<p style="font-size:14px;line-height:1.7;margin-bottom:12px;">' + htmlesc(item.question || item.content || '') + '</p>';
  } else if (item.type === 'discourse' || item.type === 'literary' || item.type === 'practical') {
    // 现代文阅读：显示原文 + 题目
    var raw = item.content || '';
    if (raw) {
      html += '<div style="background:#fafafa;padding:14px 18px;border-radius:6px;margin-bottom:10px;font-size:14px;line-height:2;border-left:3px solid var(--primary);max-height:300px;overflow-y:auto;">' + htmlesc(raw) + '</div>';
    }
    html += '<p style="font-size:14px;line-height:1.7;margin-bottom:12px;">' + htmlesc(item.question || '') + '</p>';
  } else if (item.type === 'bingju') {
    // 病句辨析：显示句子 + 问题
    var raw = item.content || '';
    if (raw) {
      html += '<div style="background:#fff8f0;padding:12px 16px;border-radius:6px;margin-bottom:8px;font-size:15px;line-height:1.8;border-left:3px solid #e67e22;">' + htmlesc(raw) + '</div>';
    }
    html += '<p style="font-size:13px;color:var(--text-light);margin-bottom:10px;">' + htmlesc(item.question || '请判断此句是否有语病') + '</p>';
  } else if (item.type === 'essay' || item.type === 'scaffold' || item.type === 'semi_open') {
    // 写作表达：显示话题 + 要求 + 可选提示
    var raw = item.content || '';
    if (raw) {
      html += '<div style="background:#f0f4ff;padding:14px 18px;border-radius:8px;margin-bottom:10px;border-left:3px solid #1a73e8;">';
      html += '<p style="font-size:15px;font-weight:600;margin-bottom:6px;">' + htmlesc(raw) + '</p>';
      if (item.question) {
        html += '<p style="font-size:13px;color:var(--text-light);">' + htmlesc(item.question) + '</p>';
      }
      html += '</div>';
    }
    // Show explanation as hint (collapsed)
    if (item.explanation) {
      html += '<details style="margin-bottom:10px;font-size:12px;"><summary style="cursor:pointer;color:var(--accent);">💡 查看写作指导</summary>';
      html += '<div style="background:#fafafa;padding:10px;border-radius:6px;margin-top:6px;line-height:1.8;">' + htmlesc(item.explanation).replace(/\n/g,'<br>') + '</div>';
      html += '</details>';
    }
    // Text area for free-form writing
    html += '<textarea id="train-input-' + idx + '" class="gram-input" rows="5" style="font-size:14px;width:100%;" placeholder="在此写作…"></textarea>';
    html += '<button class="btn-small" onclick="checkTrainingAnswer(' + idx + ',-1)" style="margin-top:8px;font-size:13px;">提交</button>';
  } else {
    // 文化常识/内容概括：显示题目
    html += '<p style="font-size:14px;line-height:1.7;margin-bottom:12px;">' + htmlesc(item.question || item.content || '') + '</p>';
  }
  
  // Options (for choice-type questions)
  var opts = [];
  try { opts = JSON.parse(item.options_json || '[]'); } catch(e) {}
  
  if (opts.length > 0) {
    var labels = ['A','B','C','D'];
    opts.forEach(function(o, oi) {
      var text = o;
      // If option already starts with label prefix (e.g. "A. ..."), don't add again
      var alreadyPrefixed = false;
      for (var li = 0; li < labels.length; li++) {
        if (text.indexOf(labels[li] + '.') === 0 || text.indexOf(labels[li] + ' ') === 0 || text.indexOf(labels[li] + '、') === 0) {
          alreadyPrefixed = true;
          break;
        }
      }
      // For duanju: format with / spacing
      if (item.type === 'duanju') {
        text = text.replace(/\//g, ' / ');
      }
      html += '<div class="ex-option" style="display:block;margin-bottom:6px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:13px;line-height:1.6;" onclick="checkTrainingAnswer(' + idx + ',' + oi + ',this)">';
      if (alreadyPrefixed) {
        html += htmlesc(text);
      } else {
        html += '<strong>' + labels[oi] + '.</strong> ' + htmlesc(text);
      }
      html += '</div>';
    });
  } else {
    // Text input for moxie/translation
    html += '<textarea id="train-input-' + idx + '" class="gram-input" rows="3" style="font-size:14px;width:100%;" placeholder="输入答案…"></textarea>';
    html += '<button class="btn-small" onclick="checkTrainingAnswer(' + idx + ',-1)" style="margin-top:8px;font-size:13px;">核对</button>';
  }
  
  html += '<div id="train-result-' + idx + '" style="margin-top:10px;"></div>';
  
  document.getElementById('trainingQuestion').innerHTML = html;
  document.getElementById('trainingQuestion').scrollIntoView({behavior:'smooth'});
}

function checkTrainingAnswer(idx, choiceIdx, el) {
  if (!_trainingSession || idx >= _trainingSession.total) return;
  var item = _trainingSession.items[idx];
  if (item.is_correct >= 0) return; // already answered
  
  var isCorrect = false;
  var userAnswer = '';
  
  if (choiceIdx >= 0) {
    // Multiple choice
    userAnswer = String.fromCharCode(65 + choiceIdx);
    isCorrect = (item.answer === userAnswer);
    
    // Highlight
    var parent = el.parentElement;
    if (parent) {
      parent.querySelectorAll('.ex-option').forEach(function(opt) {
        opt.style.pointerEvents = 'none';
      });
    }
    el.style.borderColor = isCorrect ? '#27ae60' : '#e67e22';
    el.style.background = isCorrect ? '#e8f5e9' : '#fff3e0';
    
    // Show correct if wrong
    if (!isCorrect && item.answer) {
      var labels = ['A','B','C','D'];
      var correctIdx = labels.indexOf(item.answer);
      if (correctIdx >= 0) {
        var opts = parent.querySelectorAll('.ex-option');
        if (opts[correctIdx]) {
          opts[correctIdx].style.borderColor = '#27ae60';
          opts[correctIdx].style.background = '#e8f5e9';
        }
      }
    }
  } else {
    // Text input
    var input = document.getElementById('train-input-' + idx);
    if (!input) return;
    userAnswer = input.value.trim();
    var cleanUser = userAnswer.replace(/[，。；""''「」\s]/g, '');
    var cleanAns = (item.answer || '').replace(/[，。；""''「」\s]/g, '');
    isCorrect = cleanUser === cleanAns;
  }
  
  // Record
  item.is_correct = isCorrect ? 1 : 0;
  apiCall('POST', '/api/daily/answer', {exercise_id: item.exercise_id, session_id: _trainingSession.session_id, is_correct: isCorrect});

  // 错题自动录入
  if (!isCorrect) {
    var wrongQ = item.question || item.content || '';
    apiCall('POST', '/api/wrong', {
      exercise_id: item.exercise_id || 0,
      module: item.module || 'classical_reading',
      question_type: item.type || '',
      question: wrongQ,
      user_answer: userAnswer,
      correct_answer: item.answer || '',
      explanation: item.explanation || ''
    });
    if (typeof recordTrainingLog === 'function') {
      recordTrainingLog(item.module || 'classical_reading', wrongQ, userAnswer, item.answer || '', 0);
    }
  }

  // 写作类题目：提交即视作完成（无标准答案）
  var isWriting = item.type === 'essay' || item.type === 'scaffold' || item.type === 'semi_open';
  if (isWriting && userAnswer) {
    item.is_correct = 1;  // 写作题提交即算完成
    isCorrect = true;
  }
  
  // Show result with method highlighted
  var resultEl = document.getElementById('train-result-' + idx);
  if (resultEl) {
    var method = getMethodLabel(item);
    var feedbackHtml = '<div class="ex-answer" style="display:block;border-left:3px solid ' + (isCorrect?'#27ae60':'#e67e22') + ';padding:12px 14px;background:#fafafa;border-radius:6px;margin-top:6px;font-size:13px;">';
    
    // Method highlight
    if (method) {
      feedbackHtml += '<div style="background:#e8f0fe;padding:6px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;">';
      feedbackHtml += '<strong>📐 ' + htmlesc(method) + '</strong>';
      if (item.type === 'duanju') {
        feedbackHtml += '<span style="color:#666;margin-left:6px;">— 掌握此方法可应对所有同类断句题</span>';
      } else if (item.type === 'translation') {
        feedbackHtml += '<span style="color:#666;margin-left:6px;">— 此类翻译题的通用解法</span>';
      }
      feedbackHtml += '</div>';
    }
    
    // Answer
    feedbackHtml += '<p style="margin-bottom:6px;">' + (isCorrect ? '✅ 正确！' : '❌ 正确答案：<strong>' + htmlesc(item.answer || '') + '</strong>') + '</p>';
    
    // Explanation / method steps
    var expl = item.explanation || '';
    if (expl) {
      feedbackHtml += '<div style="color:#555;font-size:12px;line-height:1.7;border-top:1px solid #e0e0e0;padding-top:6px;margin-top:4px;">' + htmlesc(expl).replace(/【/g, '<br>【') + '</div>';
    }
    
    feedbackHtml += '</div>';
    resultEl.innerHTML = feedbackHtml;
  }
  
  updateTrainingProgress();
  
  // Auto-advance after delay
  setTimeout(function() {
    if (_trainingIdx === idx) {
      renderTrainingQuestion(idx + 1);
    }
  }, 1200);
}

function finishTraining() {
  document.getElementById('trainingQuiz').style.display = 'none';
  document.getElementById('trainingResult').style.display = 'block';
  
  if (!_trainingSession) return;
  
  var total = _trainingSession.total;
  var correct = _trainingSession.items.filter(function(it) { return it.is_correct === 1; }).length;
  var accuracy = Math.round(correct / total * 100);
  
  // Complete session
  apiCall('POST', '/api/daily/complete', {session_id: _trainingSession.session_id});
  
  var emoji = accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪';
  var msg = accuracy >= 80 ? '太棒了！继续保持！' : accuracy >= 60 ? '不错！再接再厉！' : '继续加油！查漏补缺！';
  
  var html = '<p style="font-size:48px;margin-bottom:8px;">' + emoji + '</p>';
  html += '<h3 style="margin-bottom:6px;">训练完成</h3>';
  html += '<p style="font-size:32px;font-weight:700;color:var(--primary);margin-bottom:4px;">' + correct + '/' + total + '</p>';
  html += '<p style="color:var(--text-light);font-size:13px;margin-bottom:12px;">正确率 ' + accuracy + '% · ' + msg + '</p>';
  html += '<button class="btn-small" onclick="reviewTraining()" style="font-size:12px;">📋 查看错题</button>';
  html += ' <button class="btn-small" onclick="resetTraining()" style="font-size:12px;">🔄 重新开始</button>';
  
  document.getElementById('trainingScore').innerHTML = html;
  document.getElementById('trainingDate').textContent = '📅 ' + (_trainingSession.date || '') + ' ✅ 已完成';
  
  // Update streak
  if (typeof checkStreak === 'function') checkStreak();
  if (typeof updateHomeStats === 'function') updateHomeStats();
}

function reviewTraining() {
  if (!_trainingSession) return;
  var wrong = _trainingSession.items.filter(function(it) { return it.is_correct === 0; });
  if (!wrong.length) {
    document.getElementById('trainingReview').innerHTML = '<div class="card" style="text-align:center;padding:16px;"><p>🎉 全对！没有错题。</p></div>';
    return;
  }
  var html = '<h4 style="margin-bottom:10px;">📝 错题回顾（' + wrong.length + '题）</h4>';
  wrong.forEach(function(item, i) {
    var q = item.question || item.content || '';
    html += '<div class="exercise-item" style="margin-bottom:10px;padding:10px 14px;">';
    html += '<p style="font-size:13px;margin-bottom:4px;"><strong>' + (i+1) + '.</strong> ' + htmlesc(q) + '</p>';
    html += '<p style="color:#e67e22;font-size:12px;">✏️ 答案：' + htmlesc(item.answer || '') + '</p>';
    html += '<p style="color:#555;font-size:11px;">' + htmlesc(item.explanation || '') + '</p>';
    html += '</div>';
  });
  document.getElementById('trainingReview').innerHTML = html;
}

function resetTraining() {
  _trainingSession = null;
  _trainingIdx = 0;
  _currentModule = '';
  document.getElementById('trainingStart').style.display = 'block';
  document.getElementById('trainingProgress').style.display = 'none';
  document.getElementById('trainingQuiz').style.display = 'none';
  document.getElementById('trainingResult').style.display = 'none';
  document.getElementById('trainingDate').textContent = '';
  // 刷新模块状态
  renderTrainingModules();
}

window.startDailyTraining = startDailyTraining;
window.checkTrainingAnswer = checkTrainingAnswer;
window.reviewTraining = reviewTraining;
window.resetTraining = resetTraining;

function checkTrainingStatus() {
  // 渲染模块卡片 + 检查各模块状态
  renderTrainingModules();
}
window.checkTrainingStatus = checkTrainingStatus;
window.renderTrainingModules = renderTrainingModules;
window.startDailyTraining = startDailyTraining;

var _currentModule = '';

// ====== 方法掌握度面板 ======
function renderMethodStats() {
  apiCall('GET', '/api/daily/method-stats').then(function(data) {
    if (!data || !data.methods) {
      document.getElementById('methodsList').innerHTML = '<p style="color:var(--text-light);">暂无训练数据，开始每日训练后这里会显示方法掌握度。</p>';
      return;
    }

    // Overall
    var ov = data.overall;
    var ovHtml = '<div class="card" style="text-align:center;padding:20px;">';
    ovHtml += '<p style="font-size:40px;margin-bottom:4px;">' + (ov.accuracy >= 80 ? '🎉' : ov.accuracy >= 60 ? '👍' : '💪') + '</p>';
    ovHtml += '<p style="font-size:28px;font-weight:700;color:var(--primary);">' + ov.accuracy + '%</p>';
    ovHtml += '<p style="color:var(--text-light);font-size:12px;">总正确率 · ' + ov.correct + '/' + ov.total + ' 题</p>';
    ovHtml += '</div>';
    document.getElementById('methodsOverall').innerHTML = ovHtml;

    // Method list
    var statusLabels = {mastered:'🟢 已掌握', learning:'🟡 学习中', weak:'🔴 薄弱', new:'⚪ 新接触'};
    var html = '';
    data.methods.forEach(function(m) {
      var barColor = m.accuracy >= 80 ? '#27ae60' : m.accuracy >= 60 ? '#f39c12' : '#e74c3c';
      var barBg = m.total < 3 ? '#ddd' : '';
      html += '<div class="card" style="padding:14px 18px;margin-bottom:10px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
      html += '<div>';
      html += '<strong style="font-size:14px;">' + htmlesc(m.method) + '</strong>';
      html += '<span style="font-size:11px;color:var(--text-light);margin-left:8px;">' + htmlesc(m.type) + '</span>';
      html += '</div>';
      html += '<span style="font-size:12px;">' + (statusLabels[m.status] || m.status) + '</span>';
      html += '</div>';
      // Progress bar
      html += '<div style="height:6px;background:#eee;border-radius:3px;overflow:hidden;margin-bottom:4px;">';
      html += '<div style="height:100%;background:' + barColor + ';border-radius:3px;width:' + m.accuracy + '%;transition:width .5s;"></div>';
      html += '</div>';
      html += '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light);">';
      html += '<span>' + m.accuracy + '% (' + m.correct + '/' + m.total + ')</span>';
      if (m.status === 'weak') html += '<span style="color:#e74c3c;">⚠️ 需加强训练</span>';
      else if (m.status === 'new') html += '<span style="color:#999;">需要更多练习数据</span>';
      else if (m.status === 'mastered') html += '<span style="color:#27ae60;">✅ 已内化</span>';
      else html += '<span style="color:#f39c12;">接近掌握</span>';
      html += '</div></div>';
    });

    if (!data.methods.length) {
      html = '<p style="color:var(--text-light);">暂无训练数据，开始每日训练后这里会显示方法掌握度。</p>';
    }

    document.getElementById('methodsList').innerHTML = html;
  });
}

window.renderMethodStats = renderMethodStats;

// ====== 每日训练记录 ======
function renderTrainingSessions() {
  apiCall('GET', '/api/daily/history?limit=14').then(function(data) {
    var container = document.getElementById('trainingSessions');
    if (!container) return;
    if (!data || !data.sessions || !data.sessions.length) {
      container.innerHTML = '<p style="color:var(--text-light);font-size:12px;">暂无训练记录</p>';
      return;
    }

    var html = '<h4 style="margin-bottom:10px;">📋 最近训练</h4>';
    html += '<div style="overflow-x:auto;">';
    html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
    html += '<thead><tr style="border-bottom:1px solid var(--border);color:var(--text-light);">';
    html += '<th style="padding:6px 8px;text-align:left;">日期</th>';
    html += '<th style="padding:6px 8px;text-align:center;">题数</th>';
    html += '<th style="padding:6px 8px;text-align:center;">正确</th>';
    html += '<th style="padding:6px 8px;text-align:center;">正确率</th>';
    html += '<th style="padding:6px 8px;text-align:center;">状态</th>';
    html += '</tr></thead><tbody>';

    data.sessions.forEach(function(s) {
      var accColor = s.accuracy >= 80 ? '#27ae60' : s.accuracy >= 60 ? '#f39c12' : '#e74c3c';
      html += '<tr style="border-bottom:1px solid #f0f0f0;">';
      html += '<td style="padding:6px 8px;">' + htmlesc(s.date) + '</td>';
      html += '<td style="padding:6px 8px;text-align:center;">' + s.total + '</td>';
      html += '<td style="padding:6px 8px;text-align:center;">' + s.correct + '</td>';
      html += '<td style="padding:6px 8px;text-align:center;color:' + accColor + ';font-weight:600;">' + s.accuracy + '%</td>';
      html += '<td style="padding:6px 8px;text-align:center;">' + (s.completed ? '✅' : '⏳') + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  });
}

window.renderTrainingSessions = renderTrainingSessions;
