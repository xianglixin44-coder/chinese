const API_BASE = 'http://localhost:3200';
let apiAvailable = false;

let dbLocal = null;
(async function initLocalDB() {
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
    const opts = { method, headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(3000) };
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
];

const DECK_SHIPIN = [
  {front:"群臣吏民能面刺寡人之过者",hl:"面",word:"面",meaning:"当面",analogy:"像「当面」说一样，face to face"},
  {front:"邹忌修八尺有余",hl:"修",word:"修",meaning:"身高",analogy:"相当于「身高/长度」"},
  {front:"徐公何能及君也",hl:"及",word:"及",meaning:"比得上",analogy:"= 赶得上/比得上"},
  {front:"吾妻之美我者，私我也",hl:"私",word:"私",meaning:"偏私/偏爱",analogy:"= 私下偏向"},
  {front:"能谤讥于市朝",hl:"谤讥",word:"谤讥",meaning:"公开批评议论",analogy:"≈ 公开提意见（非贬义）"},
  {front:"闻寡人之耳者",hl:"闻",word:"闻",meaning:"使……听到",analogy:"= 让……听见"},
  {front:"于是入朝见威王",hl:"朝",word:"朝",meaning:"朝廷",analogy:"= 上朝/朝廷"},
  {front:"数月之后，时时而间进",hl:"间",word:"间",meaning:"间或/偶尔",analogy:"= occasionally"},
  {front:"此所谓战胜于朝廷",hl:"战胜",word:"战胜",meaning:"取胜",analogy:"在朝廷上取胜（无需出兵）"},
  {front:"先帝创业未半而中道崩殂",hl:"崩殂",word:"崩殂",meaning:"帝王去世",analogy:"= 驾崩"},
  {front:"此诚危急存亡之秋也",hl:"秋",word:"秋",meaning:"时候/时期",analogy:"= 关键时刻"},
  {front:"盖追先帝之殊遇",hl:"殊遇",word:"殊遇",meaning:"特殊的厚待",analogy:"=特别待遇"},
  {front:"是以先帝简拔以遗陛下",hl:"简拔",word:"简拔",meaning:"选拔",analogy:"= 挑选提拔"},
  {front:"性行淑均",hl:"淑均",word:"淑均",meaning:"善良公正",analogy:"= 品性善良公正"},
  {front:"未尝不叹息痛恨于桓灵也",hl:"痛恨",word:"痛恨",meaning:"痛心遗憾",analogy:"古义≠今义；不是恨，是遗憾"},
  {front:"由是感激，遂许先帝以驱驰",hl:"感激",word:"感激",meaning:"感动奋发",analogy:"= 感动+激奋"},
  {front:"深入不毛",hl:"不毛",word:"不毛",meaning:"不长草木之地",analogy:"= 不长草木的地方"},
  {front:"攘除奸凶",hl:"攘除",word:"攘除",meaning:"排除/铲除",analogy:"= 铲除"},
  {front:"临表涕零",hl:"涕",word:"涕",meaning:"眼泪",analogy:"≠鼻涕；古义为眼泪"},
  {front:"以光先帝遗德",hl:"光",word:"光",meaning:"发扬光大",analogy:"= 使……光大"},
  {front:"道中手自抄录",hl:"手",word:"手",meaning:"亲手（名词作状语）",analogy:"= by hand/亲手"},
  {front:"与之论辩，言和而色夷",hl:"夷",word:"夷",meaning:"平和",analogy:"= 平易/平和"},
  {front:"余幼时即嗜学",hl:"嗜",word:"嗜",meaning:"特别爱好",analogy:"= 沉迷于/酷爱"},
  {front:"家贫，无从致书以观",hl:"致",word:"致",meaning:"得到",analogy:"= 弄到/获得"},
  {front:"益慕圣贤之道",hl:"慕",word:"慕",meaning:"仰慕",analogy:"= 仰慕/敬佩"},
  {front:"尝趋百里外",hl:"趋",word:"趋",meaning:"快步走",analogy:"= 快走/奔赴"},
  {front:"从乡之先达执经叩问",hl:"叩问",word:"叩问",meaning:"请教",analogy:"= 敲门请教"},
  {front:"门人弟子填其室",hl:"填",word:"填",meaning:"挤满",analogy:"= 塞满/人多"},
  {front:"援疑质理",hl:"质",word:"质",meaning:"询问",analogy:"= 质问/询问"},
  {front:"俯身倾耳以请",hl:"倾",word:"倾",meaning:"侧着",analogy:"= 倾侧/侧耳倾听"},
  {front:"俟其欣悦，则又请焉",hl:"俟",word:"俟",meaning:"等待",analogy:"= wait/等候"},
  {front:"卒获有所闻",hl:"卒",word:"卒",meaning:"终于",analogy:"= finally/最终"},
  {front:"故余虽愚，卒获有所闻",hl:"虽",word:"虽",meaning:"即使",analogy:"= even if"},
  {front:"穷冬烈风，大雪深数尺",hl:"穷冬",word:"穷冬",meaning:"深冬/严冬",analogy:"= 极冷的冬天"},
  {front:"足肤皲裂而不知",hl:"皲裂",word:"皲裂",meaning:"皮肤冻裂",analogy:"= 皮肤开裂"},
  {front:"媵人持汤沃灌",hl:"汤",word:"汤",meaning:"热水",analogy:"≠菜汤；古义为热水"},
  {front:"以衾拥覆，久而乃和",hl:"和",word:"和",meaning:"暖和",analogy:"= 暖和/warm"},
  {front:"寓逆旅，主人日再食",hl:"再",word:"再",meaning:"两次",analogy:"= 两次（不是again）"},
  {front:"右备容臭",hl:"容臭",word:"容臭",meaning:"香囊/气味",analogy:"≠臭味；古义为香气"},
  {front:"烨然若神人",hl:"烨然",word:"烨然",meaning:"光彩照人的样子",analogy:"= 光彩耀眼"},
  {front:"余则缊袍敝衣处其间",hl:"缊",word:"缊",meaning:"破旧/乱麻",analogy:"= 破旧的"},
  {front:"略无慕艳意",hl:"慕艳",word:"慕艳",meaning:"羡慕",analogy:"= 羡慕"},
  {front:"以中有足乐者",hl:"以",word:"以",meaning:"因为",analogy:"= because"},
  {front:"不知口体之奉不若人也",hl:"奉",word:"奉",meaning:"供养/享受",analogy:"= 待遇/供给"},
  {front:"盖余之勤且艰若此",hl:"盖",word:"盖",meaning:"大概/发语词",analogy:"≈ 大概是这样"},
  {front:"今虽耄老，未有所成",hl:"耄老",word:"耄老",meaning:"年老（八九十岁）",analogy:"= 老年"},
  {front:"犹幸预君子之列",hl:"预",word:"预",meaning:"参与",analogy:"= 参与/列入"},
  {front:"而承天子之宠光",hl:"宠光",word:"宠光",meaning:"恩宠荣耀",analogy:"= 恩宠和荣耀"},
  {front:"缀公卿之后",hl:"缀",word:"缀",meaning:"跟随/列于",analogy:"= 跟在……后面"},
  {front:"非天质之卑，则心不若余之专耳",hl:"卑",word:"卑",meaning:"低下",analogy:"= 资质差 vs 专心不够"},
  {front:"辍耕之垄上",hl:"之",word:"之",meaning:"去/往（动词）",analogy:"= go to"},
  {front:"苟富贵，无相忘",hl:"苟",word:"苟",meaning:"如果",analogy:"= if"},
  {front:"燕雀安知鸿鹄之志哉",hl:"安",word:"安",meaning:"怎么",analogy:"= how could"},
  {front:"会天大雨，道不通",hl:"会",word:"会",meaning:"恰逢",analogy:"= 碰巧遇到"},
  {front:"度已失期",hl:"度",word:"度",meaning:"估计（duó）",analogy:"= 推测/估量"},
  {front:"今亡亦死，举大计亦死",hl:"亡",word:"亡",meaning:"逃跑",analogy:"≠死亡；此处指逃亡"},
  {front:"等死，死国可乎",hl:"等",word:"等",meaning:"同样",analogy:"= equally"},
  {front:"天下苦秦久矣",hl:"苦",word:"苦",meaning:"被……所苦",analogy:"= 受……之苦"},
];

const DECK_XUCI = [
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
];

const DECK_WENXUE = [
  {front:"《诗经》开创什么体裁？",hl:"",word:"风雅颂",meaning:"风(民歌)雅(宫廷)颂(祭祀)",analogy:"风在民间吹，雅在殿堂吟，颂在祭坛唱"},
  {front:"《离骚》谁的代表作？",hl:"",word:"屈原",meaning:"浪漫主义源头+香草美人手法",analogy:"香草美人=借花喻人"},
  {front:"《史记》作者与体例？",hl:"",word:"司马迁·纪传体通史",meaning:"究天人之际，通古今之变",analogy:"第一部纪传体通史"},
  {front:"唐宋八大家？",hl:"",word:"韩柳+三苏+欧曾王",meaning:"韩愈柳宗元+三苏+欧阳修曾巩王安石",analogy:"韩柳三苏欧曾王，古文运动扛大梁"},
  {front:"唐诗分哪四期？",hl:"",word:"初唐/盛唐/中唐/晚唐",meaning:"初唐四杰→李杜→白居易→小李杜",analogy:"王杨卢骆开新篇，李杜光芒照盛唐"},
  {front:"宋词两大流派？",hl:"",word:"婉约 vs 豪放",meaning:"婉约(柳永李清照)豪放(苏轼辛极疾)",analogy:"婉约儿女情长，豪放家国天下"},
  {front:"元曲四大家？",hl:"",word:"关马郑白",meaning:"关汉卿马致远郑光祖白朴",analogy:""},
  {front:"四大名著？",hl:"",word:"红·清/三·明/水·明/西·明",meaning:"红楼梦三国水浒西游",analogy:"明清小说四座山"},
  {front:"鲁迅代表作？",hl:"",word:"《呐喊》《彷徨》《朝花夕拾》",meaning:"中国现代文学奠基人",analogy:"横眉冷对千夫指，俯首甘为孺子牛"},
  {front:"《论语》体裁？",hl:"",word:"语录体·孔子弟子及再传弟子",meaning:"半部论语可治天下",analogy:""},
  {front:"《孟子》核心思想？",hl:"",word:"民贵君轻·性善论",meaning:"论辩体，孟子与弟子合著",analogy:""},
  {front:"陶渊明地位？",hl:"",word:"田园诗派鼻祖",meaning:"采菊东篱下，悠然见南山",analogy:""},
  {front:"杜甫称号？",hl:"",word:"诗圣·诗史",meaning:"沉郁顿挫，忧国忧民",analogy:""},
  {front:"李白称号？",hl:"",word:"诗仙·浪漫主义",meaning:"笔落惊风雨，诗成泣鬼神",analogy:""},
  {front:"苏轼成就？",hl:"",word:"豪放派代表+全才",meaning:"诗文书画全能",analogy:"一蓑烟雨任平生"},
  {front:"曹雪芹作品？",hl:"",word:"《红楼梦》·清代",meaning:"满纸荒唐言，一把辛酸泪",analogy:""},
  {front:"建安七子特征？",hl:"",word:"建安风骨",meaning:"慷慨悲凉，孔融陈琳等七人",analogy:""},
  {front:"《左传》体例？",hl:"",word:"编年体·春秋左氏传",meaning:"叙事之最，战争描写顶级",analogy:""},
  {front:"《战国策》体例？",hl:"",word:"国别体",meaning:"策士风采，说辞典范",analogy:""},
  {front:"《资治通鉴》作品？",hl:"",word:"司马光·编年体通史",meaning:"以史为鉴可知兴替",analogy:""},
];

const DECKS = {shici:DECK_SHIPIN, xuci:DECK_XUCI, wenxue:DECK_WENXUE};

const BOOKS = [
  {rank:1,title:"《如何阅读一本书》",author:"莫提默·J·艾德勒",tag:"阅读",tagClass:"tag-read",desc:"西方阅读教学奠基。分析阅读规则直接套用现代文答题。"},
  {rank:2,title:"《批判性思维工具》",author:"理查德·保罗",tag:"阅读",tagClass:"tag-read",desc:"识别偏见、评估论证，攻克「作者观点辨析」高阶题型。"},
  {rank:3,title:"《他们说/我说》",author:"杰拉尔德·格拉夫",tag:"写作",tagClass:"tag-write",desc:"美高校通用写作教材，逻辑模板训练议论文起承转合。"},
  {rank:4,title:"《论证是一门学问》",author:"安东尼·威斯汀",tag:"写作",tagClass:"tag-write",desc:"极简论证规则手册。类比/因果/演绎论证可操作训练。"},
  {rank:5,title:"《写字留存》",author:"厄苏拉·勒古恩",tag:"写作",tagClass:"tag-write",desc:"语言节奏与细节，训练「展示不要陈述」的记叙文基本功。"},
  {rank:6,title:"《语法讲义》/《八百词》",author:"朱德熙/吕叔湘",tag:"语法",tagClass:"tag-grammar",desc:"结构主义语法，把汉语病句分析变成数学公式。"},
];

const PLAN_WEEKS = {
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
};

const TEMPLATES = {
  A1:"诚然，[对立观点]在某种程度上具有其合理性，例如……；然而，如果我们审视其背后的深层逻辑，就会发现……",
  A2:"有人或许会主张：[对立观点]。这种看法并非全无道理，但它忽略了一个关键前提——……",
  A3:"站在[持方]的立场来看，[对立观点]确实有其依据。但当我们把视野放宽到[更大的层面]，就会发现……",
  A4:"不可否认，[对立观点]在[某个局限范围]内是成立的。然而，这恰恰暴露了它的盲区——……",
  B1:"这并非偶然的巧合，而是……的必然结果。究其本质，是因为……",
  B2:"事实上，[论点]不仅体现在[A层面]，更深刻地反映在[B层面]。二者的内在关联在于……",
  B3:"如果我们将[现象A]与[现象B]进行类比，就会发现它们在逻辑结构上共享一个核心特征——……",
  B4:"从更根本的层面来看，[论点]之所以成立，是因为它触及了一个被普遍忽略的前提——……",
  C1:"由此，我们不仅看到了……，更应当警惕其背后……的深层危机。",
  C2:"或许，最好的答案并不在于[二选一]，而在于我们在[更高维度]上寻得一种平衡——……",
  C3:"当我们重新审视[讨论的话题]时，会发现它最终指向了一个更本质的问题：我们究竟想要怎样的……？",
  C4:"归根结底，[论点]所关切的，不仅仅是……的问题，更关乎每一个人在[时代大背景]之中的安身立命。",
};

const GRAMMAR_EXAMPLES = [
  {sentence:"通过这次学习，使我认识到自己的不足。",
   analysis:"Step1 提主干：「通过这次学习」（介词结构→无主语）+「使」（谓）+「我」（宾）+「认识到…」（宾补）→ 全句缺少主语！\n\nStep2 配逻辑：介词「通过」导致主语被淹没=成分残缺（缺主语）\n修改①：去掉「通过」→「这次学习，使我认识到…」\n修改②：去掉「使」→「通过这次学习，我认识到…」\n\nStep3 规律：看到介词开头（通过/经过/由于/关于）立刻警惕缺主语！"},
  {sentence:"我们必须不断提高和培养自己的创新能力。",
   analysis:"Step1 提主干：我们（S）+提高和培养（V）+能力（O）→ 主干完整\n\nStep2 配逻辑：「提高……能力」✓；「培养……能力」✓ → 此句搭配正确\n\n💡 若改为「提高和培养水平」，则「培养水平」搭配不当，露出病句。"},
  {sentence:"这种做法，广为人民群众所欢迎。",
   analysis:"Step1 提主干：这种做法（S）+被欢迎（V）→ 主干完整\n\nStep2 配逻辑：「为……所……」是文言「为……所……」被动句式的残留。此句既用白话「广为」又用文言「为……所……」，属于句式杂糅。\n\nStep3 修改：「这种做法，受到人民群众的广泛欢迎。」"},
];

const SYNTAX_EXAMPLES = [
  {sentence:"大王来何操？", analysis:"Step1 提主干：大王（S）+操（V）+何（O）→ 现代汉语语序应为「大王操何」\n→ 疑问代词「何」作宾语，前置于动词前 = 宾语前置\n\nStep2 画结构：大王（S）+来（状语）+何（O前置）+操（V）\n规则：疑问句中，疑问代词作宾语必须前置\n\nStep3 现代语序：「大王来操持什么？」"},
  {sentence:"战于长勺", analysis:"Step1 提主干：（省略主语）+战（V）+于长勺（补语）\n→ 现代汉语语序应为「在长勺作战」\n→ 介宾短语「于长勺」后置于动词 = 介宾后置（状语后置）\n\nStep2 规则：古汉语中，「于/以」引导的介宾结构常放在动词之后\n\nStep3 现代语序：「在长勺作战」"},
  {sentence:"马之千里者", analysis:"Step1 提主干：马（中心词）+之（助词）+千里（定语）+者（助词）\n→ 现代语序应为「千里马」或「能行千里的马」\n→ 定语「千里」后置于中心词「马」= 定语后置\n\nStep2 标志：中心词+之+定语+者\n\nStep3 现代语序：「能行千里的马」"},
];

const RHETORIC_EXAMPLES = [
  {sentence:"风从巷子里灌出来，把纸角吹得一掀一掀的，像一只受伤的鸟在扑棱翅膀。",analysis:"📌 【高考标准答案示范】\n\n【第一步：明手法（1分）】\n运用了比喻（拟物）的手法，将「被风吹动的纸角」比作「受伤的鸟」。\n\n【第二步：析具体（2分）】\n结合语境，「一掀一掀」的动态与鸟「扑棱翅膀」的挣扎感相重合，生动形象地写出了纸角在风中无助、颤抖的物理形态。\n\n【第三步：阐效果（2分）】\n通过「受伤的鸟」这一具有痛感的意象，寄托并外化了人物此时内心挣扎、焦虑、脆弱的心理状态，达到了景情交融的效果。"},
  {sentence:"指点江山，激扬文字，粪土当年万户侯。",analysis:"📌 【高考标准答案示范】\n\n【第一步：明手法（1分）】\n运用了借代与对偶的手法。「江山」代指国家政权，「文字」代指革命舆论。\n\n【第二步：析具体（2分）】\n「指点」与「激扬」相对，「江山」与「文字」并列，句式整齐，音韵和谐，在对比中使革命活动更显具象化。\n\n【第三步：阐效果（2分）】\n借代的使用化抽象为具体，增强了形象性；对偶则让语言节奏感极强，慷慨激昂地表现出青年革命者蔑视权贵、担当天下的豪迈气概。"},
  {sentence:"他们的品质是那样的纯洁和高尚，他们的意志是那样的坚韧和刚强，他们的气质是那样的淳朴和谦逊……",analysis:"📌 【高考标准答案示范】\n\n【第一步：明手法（1分）】\n运用了排比的手法。连续三个「他们的……是那样的……」句式相同、语气一致。\n\n【第二步：析具体（2分）】\n从「品质」、「意志」、「气质」三个不同维度，层层递进地铺陈志愿军战士的高尚精神内核，形成了排山倒海的语势。\n\n【第三步：阐效果（2分）】\n结构整齐，音律顺畅，增强了文章的抒情气势，强烈地表达了作者对战士们无以复加的崇敬与赞美之情。"}
];

const TRANSLATION_EXAMPLES = [
  {sentence:"群臣吏民能面刺寡人之过者，受上赏。",analysis:"📌 【双语字字对齐与采分点】\n\n1️⃣ 【字字落实（对齐）】:\n- 群臣吏民：大小官吏和百姓\n- 能：能够\n- 面：【采分点1】当面（名词作状语，译为「当面」，不能译为「脸面」）\n- 刺：【采分点2】指责/批评\n- 寡人：我（君王自称）\n- 之：的\n- 过：过失/过错\n- 者：……的人（定语后置标志）\n- 受：获得\n- 上赏：上等奖赏\n\n2️⃣ 【句法还原（结构调整）】:\n- 原文「群臣吏民能面刺寡人之过者」属于定语后置句。\n\n3️⃣ 【高考规范译文】:\n大小官吏和百姓，能够当面指责我的过错的，给予上等奖赏。"},
  {sentence:"二虫尽为所吞，余年幼，方出神，不觉呀然惊恐。",analysis:"📌 【双语字字对齐与采分点】\n\n1️⃣ 【字字落实（对齐）】:\n- 二虫：两只虫子\n- 尽：全/都\n- 为所：【采分点1】被（「为……所……」表被动句式）\n- 吞：吞食\n- 余：我\n-年幼：年纪小\n- 方：【采分点2】正/刚刚（古今异义）\n- 出神：看得出神\n- 不觉：不知不觉地\n- 呀然：【采分点3】唉呀一声\n- 惊恐：感到惊恐\n\n2️⃣ 【句法还原（结构调整）】:\n- 原文「二虫尽为所吞」，属于缩略被动。\n\n3️⃣ 【高考规范译文】:\n两只虫子全被吞食了。我当时年纪小，正看得出神，不自觉地唉呀一声，感到十分惊恐。"},
  {sentence:"先帝不以臣卑鄙，猥自枉屈，三顾臣于草庐之中。",analysis:"📌 【双语字字对齐与采分点】\n\n1️⃣ 【字字落实（对齐）】:\n- 先帝：刘备\n- 不以：不因为（以：因为）\n- 臣：我（诸葛亮）\n- 卑鄙：【采分点1】地位卑微，见识浅陋（古今异义，不能译为「品质恶劣」）\n- 猥：【采分点2】委屈（谦词，译为「委屈地」）\n- 自枉屈：亲自降低身份\n- 三：多次/三次\n- 顾：拜访\n- 于草庐之中：【采分点3】在草庐之中（介宾短语后置）\n\n2️⃣ 【句法还原（结构调整）】:\n- 原文「三顾臣于草庐之中」为介宾后置句。\n\n3️⃣ 【高考规范译文】:\n先帝不因为我地位卑微、见识浅陋，委屈地亲自降低身份，三次到草庐之中来拜访我。"}
];

const NOVEL_EXAMPLES = [
  {title:"视角：第一人称限制视角的妙用",analysis:"📌 【叙事视角·高考答题模板】\n\n【第一步：判视角（1分）】\n本文采用第一人称（「我」）的限制性视角展开叙事。\n\n【第二步：析效果（2分）】\n1. 真实与拉近感：「我」作为故事的见证者与亲历者，具有极强的真实感。\n2. 制造悬念：由于「我」的认知局限性，无法窥见其他人物的完整心理，为情节发展设置了多处悬念。\n\n【第三步：扣主旨（1分）】\n通过「我」的主观感受和视线的推移，展现出普通人在特定时代环境下的心理波澜。"},
  {title:"时空：双线穿插与插叙的张力",analysis:"📌 【叙事结构·高考答题模板】\n\n【第一步：明手法（1分）】\n运用了「双线交织」与「插叙」相结合的叙事结构。\n\n【第二步：析具体（2分）】\n1. 明暗双线：以明线（主人公眼前的等待过程）推动现实时间；以暗线（插叙过去的遭遇和真相）揭示前因后果。\n2. 插叙切入：适时穿插往日的回忆，打破了单一时间轴的平铺直叙。\n\n【第三步：阐效果（2分）】\n这种叙事时空的交错，极大地丰富了小说的情节容量，强化了小说的戏剧冲突。"},
  {title:"道具：核心物象的结构与象征作用",analysis:"📌 【道具/物象·高考答题模板】\n\n【第一步：析物理（1分）】\n「对折的纸」是贯穿全文的核心线索与道具（物象）。\n\n【第二步：析结构（2分）】\n1. 线索作用：小说以「纸」的出现开篇，中途写「纸」在风中的挣扎，串联起承转合。\n2. 制造冲突：这张未打开的纸成为了情节的暴风眼。\n\n【第三步：析象征（2分）】\n1. 象征意义：纸上的字虽未点明，但其在风中「像受伤的鸟」一样挣扎，象征着主人公破碎的内心世界。\n2. 深化主题：道具的反复出现，将抽象的情感具象化。"}
];

function dbRun(sql, params) { localRun(sql, params); dispatchToApi(sql, params); }
function dispatchToApi(sql, params) {
  if (!apiAvailable) return;
       if (sql.includes('flashcard_log')) apiCall('POST','/api/flashcard/log',{deck:params[0],card_word:params[1],rating:params[2]});
  else if (sql.includes('template_log'))   apiCall('POST','/api/template/log',{combo_a:params[0],combo_b:params[1],combo_c:params[2],topic:params[3]});
  else if (sql.includes('grammar_log'))     apiCall('POST','/api/grammar/log',{sentence:params[0],example_idx:params[1]??-1,module:params[2]||''});
  else if (sql.includes('training_sessions')) apiCall('POST','/api/training/session',{date:params[0],module:params[1],duration_min:params[2]});
  // card_srs sync handled directly in rateCard() — skip dispatchToApi to avoid param mismatch
  else if (sql.includes('assessments'))     apiCall('POST','/api/assessment',{item:params[0],week:params[1],score:params[2]});
  else if (sql.includes('imported_exercises')) apiCall('POST','/api/import/exercises',{rows:params});
  else if (sql.includes('streak'))          apiCall('POST','/api/streak',{count:params[0],last_active:params[1]});
  else { apiCall('POST', '/api/run', {sql, params}); }
}

async function dbQuery(sql, params) {
  let apiRows = null;
  try {
         if (sql.includes('SELECT count, last_active FROM streak')) { const r = await apiCall('GET','/api/streak'); if (r) apiRows = [[r.count, r.last_active]]; }
    else if (sql.includes('SELECT COUNT(*) FROM template_log'))    { const r = await apiCall('GET','/api/stats/template'); if (r) apiRows = [[r.count]]; }
    else if (sql.includes('SELECT COUNT(*) FROM grammar_log'))     { const r = await apiCall('GET','/api/stats/grammar'); if (r) apiRows = [[r.count]]; }
    else if (sql.includes('SELECT DISTINCT date FROM training_sessions')) {
      const r = await apiCall('GET',`/api/calendar?start=${params[0]}&end=${params[1]}`);
      if (r && r.dates) apiRows = r.dates.map(d => [d]);
    }
    else if (sql.includes('SELECT module, duration_min FROM training_sessions WHERE date')) {
      const r = await apiCall('GET',`/api/calendar/day?date=${params[0]}`);
      if (r && r.sessions) apiRows = r.sessions.map(s => [s.module, s.duration_min]);
    }
  } catch(e) {}
  if (apiRows && apiRows.length) return apiRows;
  return localQuery(sql, params);
}

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
