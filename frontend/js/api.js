(function(){
var API_BASE = App.API_BASE || 'http://localhost:3200';
var AUTH_TOKEN = App.AUTH_TOKEN || 'chinese-trainer-2026';
let apiAvailable = false;

let dbLocal = null;
(async function initLocalDB() {
  // Schema source of truth: ../../schema.sql
  // Offline-only tables (server has full schema)
  try {
    const SQL = await initSqlJs({ locateFile: f => f });
    dbLocal = new SQL.Database();
    dbLocal.run("CREATE TABLE IF NOT EXISTS streak (id INTEGER PRIMARY KEY CHECK(id=1), count INTEGER DEFAULT 0, last_active TEXT)");
    dbLocal.run("INSERT OR IGNORE INTO streak VALUES (1,0,'')");
    dbLocal.run("CREATE TABLE IF NOT EXISTS flashcard_log (id INTEGER PRIMARY KEY AUTOINCREMENT, deck TEXT, card_word TEXT, rating TEXT, reviewed_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS template_log (id INTEGER PRIMARY KEY AUTOINCREMENT, combo_a TEXT, combo_b TEXT, combo_c TEXT, topic TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS grammar_log (id INTEGER PRIMARY KEY AUTOINCREMENT, sentence TEXT, example_idx INTEGER, module TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS card_srs (deck TEXT, card_idx INTEGER, interval_days INTEGER DEFAULT 0, repetitions INTEGER DEFAULT 0, next_review TEXT, mastered INTEGER DEFAULT 0, PRIMARY KEY(deck, card_idx))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS assessments (item TEXT, week INTEGER, score INTEGER DEFAULT 0, updated_at TEXT DEFAULT (datetime('now','localtime')), PRIMARY KEY(item, week))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS training_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, module TEXT, duration_min INTEGER, created_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS daily_tasks (date TEXT, task TEXT, PRIMARY KEY(date, task))");
    console.log('📦 Local SQLite ready');
  } catch(e) { console.warn('Local DB:', e.message); }
})();

function localRun(sql, params) {
  if (!dbLocal) return;
  try { dbLocal.run(sql, params || []); } catch(e) {}
}
function localQuery(sql, params) {
  if (!dbLocal) return [];
  try { const r = dbLocal.exec(sql, params || []); return (r.length && r[0].values) ? r[0].values : []; } catch(e) { return []; }
}

async function checkApi() {
  try {
    const r = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
    apiAvailable = r.ok;
    if (apiAvailable) console.log('✅ API connected:', API_BASE);
  } catch(e) {
    apiAvailable = false;
    console.log('📴 Offline mode (local DB)');
  }
}

async function apiCall(method, path, body) {
  if (!apiAvailable) return null;
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AUTH_TOKEN }, signal: AbortSignal.timeout(3000) };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${API_BASE}${path}`, opts);
    if (!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

async function syncStreak(count, lastActive) {
  if (apiAvailable) {
    apiCall('POST', '/api/streak', { count, last_active: lastActive });
  }
}

const SYMBOLS = [
  {sym:"[ ]",name:"核心概念框",desc:"关键词、核心意象、反复出现的词"},
  {sym:"/",name:"层次分割线",desc:"事实→分析→结论的逻辑转换处"},
  {sym:"?",name:"困惑标记",desc:"作者写得反常、矛盾、或读不懂处"},
  {sym:"★",name:"主旨句标记",desc:"每一段的结论句、全文中心论点"},
  {sym:"~~~",name:"论据波浪线",desc:"例子、数据、引用等支撑论据"},
  {sym:"→",name:"逻辑箭头",desc:"因果、转折、递进的标志词"},
  {sym:"▲",name:"词句品味",desc:"用得精妙或值得模仿的词句"},
  {sym:"×",name:"逻辑漏洞",desc:"偷换概念、以偏概全、因果倒置"},
];const DECK_XUCI = [
  {front:"学而时习之",hl:"之",word:"之·代词：他/它",meaning:"代指学过的知识",analogy:"= it/them"},
  {front:"千里之行",hl:"之",word:"之·助词：的",meaning:"千里的路程",analogy:"= 的/of"},
  {front:"大道之行也",hl:"之",word:"之·取消句子独立性",meaning:"大道的施行",analogy:"≈ 使句子变成短语"},
  {front:"温故而知新",hl:"而",word:"而·表并列：而且",meaning:"温习旧知而且获得新知",analogy:"= and"},
  {front:"学而不思则罔",hl:"而",word:"而·表转折：但是",meaning:"学了但是不思考就会迷惑",analogy:"= but"},
  {front:"吾恂恂而起",hl:"而",word:"而·表修饰：地",meaning:"我小心地起身",analogy:"= -ly（修饰动词）"},
  {front:"食马者不知其能千里而食也",hl:"其",word:"其·代词：它的",meaning:"它的（指千里马）的能力",analogy:"= its/his/her"},
  {front:"其真不知马也？",hl:"其",word:"其·副词：大概/难道",meaning:"大概是真的不认识千里马",analogy:"= perhaps/surely"},
  {front:"其人视端容寂",hl:"其",word:"其·指示：那",meaning:"那个人",analogy:"= that"},
  {front:"以刀劈狼首",hl:"以",word:"以·介词：用",meaning:"用刀劈砍狼头",analogy:"= with/using"},
  {front:"以光先帝遗德",hl:"以",word:"以·连词：来",meaning:"来发扬光大先帝的遗德",analogy:"= in order to"},
  {front:"皆以美于徐公",hl:"以",word:"以·认为",meaning:"都认为比徐公美",analogy:"= think/consider"},
  {front:"战于长勺",hl:"于",word:"于·介词：在",meaning:"在长勺作战",analogy:"= at/in"},
  {front:"皆美于徐公",hl:"于",word:"于·介词：比",meaning:"都比徐公美",analogy:"= than（比较）"},
  {front:"告之于帝",hl:"于",word:"于·介词：向",meaning:"向天帝报告",analogy:"= to"},
  {front:"为人谋而不忠乎",hl:"为",word:"为 wèi·替/给",meaning:"替别人谋划",analogy:"= for"},
  {front:"可以为师矣",hl:"为",word:"为 wéi·成为",meaning:"可以成为老师了",analogy:"= become"},
  {front:"二虫尽为所吞",hl:"为",word:"为 wéi·被",meaning:"两只虫子全被吞掉",analogy:"= by（被动）"},
  {front:"乃重修岳阳楼",hl:"乃",word:"乃·于是/就",meaning:"于是重新修建岳阳楼",analogy:"= then/so"},
  {front:"乃不知有汉",hl:"乃",word:"乃·竟然",meaning:"竟然不知道有汉朝",analogy:"= unexpectedly"},
  {front:"此乃英雄也",hl:"乃",word:"乃·是（判断）",meaning:"这就是英雄",analogy:"= is"},
  {front:"学而不思则罔",hl:"则",word:"则·就",meaning:"学了不思考就会迷惑",analogy:"= then"},
  {front:"则凡可以得生者何不用也",hl:"则",word:"则·那么",meaning:"那么凡是能保命的有什么不能用",analogy:"= then/in that case"},
  {front:"则人物略不相睹",hl:"则",word:"则·原来是",meaning:"原来是人和物互相看不清",analogy:"= it turned out that"},
  {front:"食马者",hl:"者",word:"者·……的人",meaning:"喂马的人",analogy:"= one who/-er"},
  {front:"古之学者必有师",hl:"者",word:"者·……的人",meaning:"古代求学的人一定有老师",analogy:"= one who / -er"},
  {front:"陈胜者，阳城人也",hl:"者",word:"者·表停顿",meaning:"陈胜这个人，是阳城人",analogy:"= 提顿语气"},
  {front:"道之所存",hl:"所",word:"所·……的地方",meaning:"道存在的地方",analogy:"= place where"},
  {front:"二虫尽为所吞",hl:"所",word:"所·被（为……所）",meaning:"全被吞掉",analogy:"= 被动标记"},
  {front:"从弟子女十人所",hl:"所",word:"所·大约",meaning:"随从的女徒弟约十人左右",analogy:"= about/approximately"},
  {front:"且焉置土石",hl:"且",word:"且·并且/况且",meaning:"况且在哪里来放土石",analogy:"= moreover/besides"},
  {front:"年且九十",hl:"且",word:"且·将近",meaning:"年龄将近九十",analogy:"= nearly/almost"},
  {front:"且欲与常马等不可得",hl:"且",word:"且·尚且",meaning:"尚且想和普通马一样都得不到",analogy:"= even"},
  {front:"可远观而不可亵玩焉",hl:"焉",word:"焉·语气词",meaning:"可以远观却不可近玩",analogy:"= 无实义语气词"},
  {front:"且焉置土石",hl:"焉",word:"焉·代词：哪里",meaning:"况且在哪里来放土石",analogy:"= where"},
  {front:"必有我师焉",hl:"焉",word:"焉·兼词：于此",meaning:"在其中一定有我的老师",analogy:"= in it/there"},
  {front:"何以战",hl:"何",word:"何·疑问：什么",meaning:"凭什么作战",analogy:"= what"},
  {front:"肉食者谋之，又何间焉",hl:"何",word:"何·疑问：怎么",meaning:"当权者谋划，你何必参与",analogy:"= why/how"},
  {front:"水何澹澹",hl:"何",word:"何·多么",meaning:"海水多么浩荡",analogy:"= how（感叹）"},
  {front:"学而时习之，不亦说乎",hl:"乎",word:"乎·疑问：吗",meaning:"不是很快乐吗",analogy:"= ?（疑问语气）"},
  {front:"叫嚣乎东西",hl:"乎",word:"乎·介词：在",meaning:"在东西方向叫嚣",analogy:"= at/in"},
  {front:"其必曰先天下之忧而忧乎",hl:"乎",word:"乎·感叹：啊",meaning:"他一定会说先天下之忧而忧啊",analogy:"= !（感叹语气）"},
  {front:"吾与汝毕力平险",hl:"与",word:"与·和",meaning:"我和你一起尽全力铲除险阻",analogy:"= and/together with"},
  {front:"蹴尔而与之",hl:"与",word:"与·给",meaning:"用脚踢过去给他",analogy:"= give"},
  {front:"其真无马邪？",hl:"与",word:"与·语气：吗（同欤）",meaning:"难道真的没有千里马吗？",analogy:"= ?（反问语气）"},
  {front:"因拔刀斫前奏案",hl:"因",word:"因·于是",meaning:"于是拔出刀砍向前面的奏案",analogy:"= then/thereby"},
  {front:"高祖因之以成帝业",hl:"因",word:"因·凭借",meaning:"高祖凭借它成就了帝业",analogy:"= by means of/relying on"},
  {front:"因事顺心",hl:"因",word:"因·因为",meaning:"因为事情符合心意",analogy:"= because of"},
  {front:"若为佣耕",hl:"若",word:"若·你",meaning:"你是个雇工",analogy:"= you"},
  {front:"徐公不若君之美也",hl:"若",word:"若·如/比得上",meaning:"徐公不如您美",analogy:"= as…as"},
  {front:"若有作奸犯科及为忠善者",hl:"若",word:"若·如果",meaning:"如果有作奸犯科和尽忠行善的人",analogy:"= if"},
  {front:"安求其能千里也",hl:"安",word:"安·怎么",meaning:"怎么能要求它日行千里",analogy:"= how could"},
  {front:"安得广厦千万间",hl:"安",word:"安·哪里",meaning:"哪里能得到千万间宽敞的大厦",analogy:"= where"},
  {front:"安居乐业",hl:"安",word:"安·安定/平安",meaning:"安定地生活愉快地工作",analogy:"= peaceful/stable"},
];const DECKS = {shici:DECK_SHIPIN, xuci:DECK_XUCI, wenxue:DECK_WENXUE};const PLAN_WEEKS = {
  week1:{title:"第1周·基础搭建",days:[
    ["晨刷虚词之而其为","午读短文标[]/?","晚拆2简单单句"],
    ["晨刷虚词以于为","午同篇标★~~~","晚拆《出师表》1句"],
    ["晨复习前6虚词","午文末3句批注","晚A1+B1写一段"],
    ["晨刷虚词乃则者所","午新短文完整标记","晚拆1病句真题"],
    ["晨刷虚词且焉何乎","午对比阅读","晚A2+B1+C1写段"],
    ["晨刷虚词与因若安","午复习本周标记法","晚完整走一遍流程"],
    ["晨总复习18虚词","午慢读《如何阅读》","晚整理本周笔记"],
  ]},
  week2:{title:"第2周·核心发力",days:[
    ["晨实词10个","午完整标记25min","晚拆2句(含文言)"],
    ["晨实词10个","午批注三层法","晚A+B+C完整模板"],
    ["晨实词10个","午限时读+仅做?标记","晚拆自己作文长句"],
    ["晨实词10个","午对比阅读★(A)★(B)","晚用模板拆高分范文"],
    ["晨实词10个","午完整标记+3句批注","晚不同A/B/C同话题"],
    ["晨文学常识10条","午重读W1文章对比标记","晚语法拆解+病句"],
    ["晨总复习50实词","午读《他们说/我说》","晚做本周总结"],
  ]},
  week3:{title:"第3周·综合应用",days:[
    ["晨高频错词专组","午速读标记5min","晚完整题型训练"],
    ["晨高频错词专组","午速读标记5min","晚完整题型训练"],
    ["晨高频错词专组","午无标记阅读挑战","晚画逻辑结构图"],
    ["晨高频错词专组","午无标记阅读挑战","晚对照原文修正"],
    ["晨高频错词专组","午完整标记","晚模板隐身挑战写作"],
    ["晨高频错词专组","午完整标记","晚红笔标实际模板"],
    ["晨总复习","午慢读教材","晚做本周总结"],
  ]},
  week4:{title:"第4周·模拟输出",days:[
    ["晨闪卡快速过","午现代文15min","晚模拟题拆解"],
    ["晨闪卡快速过","午现代文15min","晚模拟题拆解"],
    ["晨闪卡快速过","午文言文15min","晚病句5题/3min"],
    ["晨闪卡快速过","午文言文15min","晚病句5题/3min"],
    ["晨闪卡快速过","午议论文45min全文","晚自评逻辑结构"],
    ["晨总复习","午全套模拟(不写作文)","晚自评"],
    ["晨总结错题","午全套模拟(写作文)","晚四周复盘"],
  ]}
};const SYNTAX_EXAMPLES = [
  {sentence:"大王来何操？", analysis:"Step1 提主干：大王（S）+操（V）+何（O）→ 现代汉语语序应为「大王操何」\n→ 疑问代词「何」作宾语，前置于动词前 = 宾语前置\n\nStep2 画结构：大王（S）+来（状语）+何（O前置）+操（V）\n规则：疑问句中，疑问代词作宾语必须前置\n\nStep3 现代语序：「大王来操持什么？」"},
  {sentence:"战于长勺", analysis:"Step1 提主干：（省略主语）+战（V）+于长勺（补语）\n→ 现代汉语语序应为「在长勺作战」\n→ 介宾短语「于长勺」后置于动词 = 介宾后置（状语后置）\n\nStep2 规则：古汉语中，「于/以」引导的介宾结构常放在动词之后\n\nStep3 现代语序：「在长勺作战」"},
  {sentence:"马之千里者", analysis:"Step1 提主干：马（中心词）+之（助词）+千里（定语）+者（助词）\n→ 现代语序应为「千里马」或「能行千里的马」\n→ 定语「千里」后置于中心词「马」= 定语后置\n\nStep2 标志：中心词+之+定语+者\n\nStep3 现代语序：「能行千里的马」"},
];const TRANSLATION_EXAMPLES = [
  {sentence:"群臣吏民能面刺寡人之过者，受上赏。",analysis:"📌 【双语字字对齐与采分点】\n\n1️⃣ 【字字落实（对齐）】:\n- 群臣吏民：大小官吏和百姓\n- 能：能够\n- 面：【采分点1】当面（名词作状语，译为「当面」，不能译为「脸面」）\n- 刺：【采分点2】指责/批评\n- 寡人：我（君王自称）\n- 之：的\n- 过：过失/过错\n- 者：……的人（定语后置标志）\n- 受：获得\n- 上赏：上等奖赏\n\n2️⃣ 【句法还原（结构调整）】:\n- 原文「群臣吏民能面刺寡人之过者」属于定语后置句。\n\n3️⃣ 【高考规范译文】:\n大小官吏和百姓，能够当面指责我的过错的，给予上等奖赏。"},
  {sentence:"二虫尽为所吞，余年幼，方出神，不觉呀然惊恐。",analysis:"📌 【双语字字对齐与采分点】\n\n1️⃣ 【字字落实（对齐）】:\n- 二虫：两只虫子\n- 尽：全/都\n- 为所：【采分点1】被（「为……所……」表被动句式）\n- 吞：吞食\n- 余：我\n-年幼：年纪小\n- 方：【采分点2】正/刚刚（古今异义）\n- 出神：看得出神\n- 不觉：不知不觉地\n- 呀然：【采分点3】唉呀一声\n- 惊恐：感到惊恐\n\n2️⃣ 【句法还原（结构调整）】:\n- 原文「二虫尽为所吞」，属于缩略被动。\n\n3️⃣ 【高考规范译文】:\n两只虫子全被吞食了。我当时年纪小，正看得出神，不自觉地唉呀一声，感到十分惊恐。"},
  {sentence:"先帝不以臣卑鄙，猥自枉屈，三顾臣于草庐之中。",analysis:"📌 【双语字字对齐与采分点】\n\n1️⃣ 【字字落实（对齐）】:\n- 先帝：刘备\n- 不以：不因为（以：因为）\n- 臣：我（诸葛亮）\n- 卑鄙：【采分点1】地位卑微，见识浅陋（古今异义，不能译为「品质恶劣」）\n- 猥：【采分点2】委屈（谦词，译为「委屈地」）\n- 自枉屈：亲自降低身份\n- 三：多次/三次\n- 顾：拜访\n- 于草庐之中：【采分点3】在草庐之中（介宾短语后置）\n\n2️⃣ 【句法还原（结构调整）】:\n- 原文「三顾臣于草庐之中」为介宾后置句。\n\n3️⃣ 【高考规范译文】:\n先帝不因为我地位卑微、见识浅陋，委屈地亲自降低身份，三次到草庐之中来拜访我。"}
];// dbRun — local-only write helper. Explicit apiCall() calls in each business function handle server sync.
function dbRun(sql, params) { localRun(sql, params); }

async function getStreak() {
  const r = await apiCall('GET','/api/streak');
  if (r && r.count !== undefined) return { count: r.count, lastActive: r.last_active || '' };
  const lr = localQuery("SELECT count, last_active FROM streak WHERE id=1");
  return lr.length ? { count: lr[0][0], lastActive: lr[0][1] } : { count: 0, lastActive: '' };
}
async function setStreak(count, la) {
  localRun("UPDATE streak SET count=?, last_active=? WHERE id=1", [count, la]);
  apiCall('POST','/api/streak',{count,last_active:la});
}
function getTemplateCount() {
  const lr = localQuery("SELECT COUNT(*) FROM template_log");
  const count = lr.length ? lr[0][0] : 0;
  apiCall('GET','/api/stats/template').then(r => { if (r && r.count !== undefined) templateCount = r.count; }).catch(e => { console.warn('Failed to sync template count via API:', e); });
  return count;
}
function getGrammarCount() {
  const lr = localQuery("SELECT COUNT(*) FROM grammar_log");
  const count = lr.length ? lr[0][0] : 0;
  apiCall('GET','/api/stats/grammar').then(r => { if (r && r.count !== undefined) grammarCount = r.count; }).catch(e => { console.warn('Failed to sync grammar count via API:', e); });
  return count;
}
function dbGet(sql, params) { return localQuery(sql, params); }
function saveAssessment(item, week, score) {
  localRun("INSERT OR REPLACE INTO assessments(item,week,score,updated_at) VALUES(?,?,?,datetime('now','localtime'))", [item, week, score]);
  apiCall('POST','/api/assessment',{item,week,score});
}

// ====== 统一题库 API ======
async function fetchExercises(module, type) {
  var params = new URLSearchParams();
  if (module) params.set('module', module);
  if (type) params.set('type', type);
  params.set('limit', '200');
  var qs = params.toString();
  return await apiCall('GET', '/api/exercises' + (qs ? '?' + qs : ''));
}

// 兼容旧调用名（内部转调 fetchExercises）
async function fetchFlashcardItems(category) { return await fetchExercises('flashcard', category || ''); }
async function fetchModernReading(type)      { return await fetchExercises('modern_reading', type || ''); }
async function fetchClassicalReading(type)   { return await fetchExercises('classical_reading', type || ''); }
async function fetchWritingPrompts()         { return await fetchExercises('writing', ''); }
async function fetchGrammarExercises(type)   { return await fetchExercises('grammar', type || ''); }

// ====== 每日选题 API ======
async function fetchDailyExercise(module) {
  var today = new Date().toISOString().slice(0, 10);
  return await apiCall('GET', '/api/daily?module=' + encodeURIComponent(module) + '&date=' + today);
}
async function completeDailyExercise(module, score) {
  var today = new Date().toISOString().slice(0, 10);
  return await apiCall('POST', '/api/daily/complete', { module: module, date: today, score: score || 0 });
}

async function fetchRecords(days) {
  return await apiCall('GET', '/api/records?days=' + (days || 30));
}

async function fetchMethods() {
  return await apiCall('GET', '/api/methods');
}

// Export to global
window.apiAvailable = apiAvailable;
window.fetchExercises = fetchExercises;
window.fetchFlashcardItems = fetchFlashcardItems;
window.fetchDailyExercise = fetchDailyExercise;
window.completeDailyExercise = completeDailyExercise;
window.fetchRecords = fetchRecords;
window.fetchMethods = fetchMethods;
window.apiCall = apiCall;
window.syncStreak = syncStreak;
window.localRun = localRun;
window.localQuery = localQuery;
window.dbGet = localQuery;
window.dbRun = localRun;
window.getStreak = getStreak;
window.setStreak = setStreak;
window.getTemplateCount = getTemplateCount;
window.getGrammarCount = getGrammarCount;
window.saveAssessment = saveAssessment;
window.checkApi = checkApi;
})();
