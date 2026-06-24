// flashcard.js — 闪卡训练模块
// Depends on: config.js, utils.js, data.js, api.js
// Provides: initDeck, shuffle, showCard, flipCard, rateCard

var deckQueue = [];
var currentDeck, deckIndex, flipped, cardTimer, cardSeconds;
async function initDeck(name) {
  currentDeck = name; deckIndex = 0;
  // 显示加载状态
  var fcFront = document.getElementById('fcFront');
  if (fcFront) fcFront.textContent = '⏳ 加载中...';
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
            meaning: extra.meaning || '', analogy: extra.analogy || '',
            sentence: extra.sentence || item.content || ''
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
  document.querySelectorAll('.deck-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.deck === name);
    // 更新按钮上的数量标签
    var dk = b.dataset.deck;
    var cnt = (DECKS[dk] || []).length;
    if (cnt > 0 && !b.textContent.includes('(' + cnt + ')')) {
      var baseName = b.textContent.replace(/\s*\(\d+\)/, '');
      b.textContent = baseName + ' (' + cnt + ')';
    }
  });
  // Sync state object (used by app.js updateHomeStats etc.)
  if (typeof S !== 'undefined') { S.currentDeck = name; S.deckQueue = deckQueue; }
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
  document.getElementById('fcSentence').textContent = card.sentence || '';
  // 古今对译 + 出处
  var transText = '';
  if (card.word && card.meaning && card.meaning !== card.word) {
    transText = '「' + card.word + '」→ ' + card.meaning;
  }
  var sourceText = card.analogy || '';
  var displayParts = [];
  if (transText) displayParts.push(transText);
  if (sourceText) displayParts.push('📖 ' + sourceText);
  document.getElementById('fcAnalogy').innerHTML = displayParts.join('<br>');
  flipped = false; document.getElementById('flashcard').classList.remove('flipped');
  if (typeof S !== 'undefined') { S.currentDeck = currentDeck; S.flipped = flipped; S.cardSeconds = cardSeconds; }
  updateHomeStats();
}
function flipCard() { if (deckQueue.length === 0) return; flipped = !flipped; document.getElementById('flashcard').classList.toggle('flipped', flipped); if (typeof S !== 'undefined') S.flipped = flipped; }
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
window.flipCard = flipCard;
window.rateCard = rateCard;
window.initDeck = initDeck;

document.addEventListener('click', e => { const btn = e.target.closest('.deck-btn'); if (btn) initDeck(btn.dataset.deck); });