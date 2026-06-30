// config.js — 全局常量
var App = window.App || {};

App.state = {
  currentPage: 'overview', currentDeck: 'shici', deckIndex: 0, deckQueue: [], flipped: false,
  cardTimer: null, cardSeconds: 20,
  streak: 0, lastActive: '', templateCount: 0, grammarCount: 0,
  timerSeconds: 25 * 60, timerRunning: false, timerInterval: null,
  completedTasks: {}
};

App.SYMBOLS = [
  {sym:"[ ]",name:"核心概念框",desc:"关键词、核心意象、反复出现的词"},
  {sym:"/",name:"层次分割线",desc:"事实→分析→结论的逻辑转换处"},
  {sym:"?",name:"困惑标记",desc:"作者写得反常、矛盾、或读不懂处"},
  {sym:"★",name:"主旨句标记",desc:"每一段的结论句、全文中心论点"},
  {sym:"~~~",name:"论据波浪线",desc:"例子、数据、引用等支撑论据"},
  {sym:"→",name:"逻辑箭头",desc:"因果、转折、递进的标志词"},
  {sym:"▲",name:"词句品味",desc:"用得精妙或值得模仿的词句"},
  {sym:"×",name:"逻辑漏洞",desc:"偷换概念、以偏概全、因果倒置"}
];

App.SRS_INTERVALS = [1, 2, 4, 8, 16, 32, 64, 128];
App.MASTERY_INTERVAL = 32;
App.DAILY_CARD_LIMIT = 20;
App.DAILY_TASKS = ['flashcard', 'reading', 'classical', 'language', 'writing'];
App.DAILY_COUNTS = { flashcard: 20, reading: 3, classical: 5, language: 3, writing: 1 };
App.API_BASE = 'http://localhost:3200';

// Global aliases for split files that reference bare names
var SRS_INTERVALS = App.SRS_INTERVALS;
var MASTERY_INTERVAL = App.MASTERY_INTERVAL;
var DAILY_CARD_LIMIT = App.DAILY_CARD_LIMIT;
var DAILY_TASKS = App.DAILY_TASKS;
var API_BASE = App.API_BASE;
var SYMBOLS = App.SYMBOLS;
// utils.js — 工具函数
var App = window.App || {};

App.htmlesc = function(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

App.sanitizeHTML = function(str) {
  if (!str) return '';
  var s = String(str);
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
       .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
       .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
       .replace(/<embed\b[^>]*>/gi, '')
       .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
       .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
       .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
       .replace(/\bon\w+\s*=\s*[^\s>]*/gi, '')
       .replace(/\bon\w+\b(?=\s*[^=]|$)/gi, '')
       .replace(/javascript\s*:/gi, '')
       .replace(/vbscript\s*:/gi, '')
       .replace(/data\s*:\s*text\/html/gi, '');
  var decoded;
  try { var txt = document.createElement('textarea'); txt.innerHTML = s; decoded = txt.value; } catch(e) { decoded = s; }
  if (decoded !== s) {
    decoded = decoded.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                     .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
                     .replace(/\bon\w+\s*=\s*[^\s>]*/gi, '')
                     .replace(/javascript\s*:/gi, '');
    return decoded;
  }
  return s;
};

App.shuffle = function(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
};

App.toggleAnswer = function(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

App.formatTime = function(s) {
  var m = Math.floor(s / 60), sec = s % 60;
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
};

// Bare aliases for functions extracted from app.js
var htmlesc = App.htmlesc;
var sanitizeHTML = App.sanitizeHTML;
/* 数据定义 */


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




const DECK_WENXUE = [
  {front:"《诗经》开创什么体裁？",hl:"",word:"风雅颂",meaning:"风(民歌)雅(宫廷)颂(祭祀)",analogy:"风在民间吹，雅在殿堂吟，颂在祭坛唱"},
  {front:"《离骚》谁的代表作？",hl:"",word:"屈原",meaning:"浪漫主义源头+香草美人手法",analogy:"香草美人=借花喻人"},
  {front:"《史记》作者与体例？",hl:"",word:"司马迁·纪传体通史",meaning:"究天人之际，通古今之变",analogy:"第一部纪传体通史"},
  {front:"唐宋八大家？",hl:"",word:"韩柳+三苏+欧曾王",meaning:"韩愈柳宗元+三苏+欧阳修曾巩王安石",analogy:"韩柳三苏欧曾王，古文运动扛大梁"},
  {front:"唐诗分哪四期？",hl:"",word:"初唐/盛唐/中唐/晚唐",meaning:"初唐四杰→李杜→白居易→小李杜",analogy:"王杨卢骆开新篇，李杜光芒照盛唐"},
  {front:"宋词两大流派？",hl:"",word:"婉约 vs 豪放",meaning:"婉约(柳永李清照)豪放(苏轼辛弃疾)",analogy:"婉约儿女情长，豪放家国天下"},
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


const BOOKS = [
  {rank:1,title:"《如何阅读一本书》",author:"莫提默·J·艾德勒",tag:"阅读",tagClass:"tag-read",desc:"西方阅读教学奠基。分析阅读规则直接套用现代文答题。"},
  {rank:2,title:"《批判性思维工具》",author:"理查德·保罗",tag:"阅读",tagClass:"tag-read",desc:"识别偏见、评估论证，攻克「作者观点辨析」高阶题型。"},
  {rank:3,title:"《他们说/我说》",author:"杰拉尔德·格拉夫",tag:"写作",tagClass:"tag-write",desc:"美高校通用写作教材，逻辑模板训练议论文起承转合。"},
  {rank:4,title:"《论证是一门学问》",author:"安东尼·威斯汀",tag:"写作",tagClass:"tag-write",desc:"极简论证规则手册。类比/因果/演绎论证可操作训练。"},
  {rank:5,title:"《写字留存》",author:"厄苏拉·勒古恩",tag:"写作",tagClass:"tag-write",desc:"语言节奏与细节，训练「展示不要陈述」的记叙文基本功。"},
  {rank:6,title:"《语法讲义》/《八百词》",author:"朱德熙/吕叔湘",tag:"语法",tagClass:"tag-grammar",desc:"结构主义语法，把汉语病句分析变成数学公式。"},
];




const GRAMMAR_EXAMPLES = [
  {sentence:"通过这次学习，使我认识到自己的不足。",
   analysis:"Step1 提主干：「通过这次学习」（介词结构→无主语）+「使」（谓）+「我」（宾）+「认识到…」（宾补）→ 全句缺少主语！\n\nStep2 配逻辑：介词「通过」导致主语被淹没=成分残缺（缺主语）\n修改①：去掉「通过」→「这次学习，使我认识到…」\n修改②：去掉「使」→「通过这次学习，我认识到…」\n\nStep3 规律：看到介词开头（通过/经过/由于/关于）立刻警惕缺主语！"},
  {sentence:"我们必须不断提高和培养自己的创新能力。",
   analysis:"Step1 提主干：我们（S）+提高和培养（V）+能力（O）→ 主干完整\n\nStep2 配逻辑：「提高……能力」✓；「培养……能力」✓ → 此句搭配正确\n\n💡 若改为「提高和培养水平」，则「培养水平」搭配不当，露出病句。"},
  {sentence:"这种做法，广为人民群众所欢迎。",
   analysis:"Step1 提主干：这种做法（S）+被欢迎（V）→ 主干完整\n\nStep2 配逻辑：「为……所……」是文言「为……所……」被动句式的残留。此句既用白话「广为」又用文言「为……所……」，属于句式杂糅。\n\nStep3 修改：「这种做法，受到人民群众的广泛欢迎。」"},
];




const RHETORIC_EXAMPLES = [
  {sentence:"风从巷子里灌出来，把纸角吹得一掀一掀的，像一只受伤的鸟在扑棱翅膀。",analysis:"📌 【高考标准答案示范】\n\n【第一步：明手法（1分）】\n运用了比喻（拟物）的手法，将「被风吹动的纸角」比作「受伤的鸟」。\n\n【第二步：析具体（2分）】\n结合语境，「一掀一掀」的动态与鸟「扑棱翅膀」的挣扎感相重合，生动形象地写出了纸角在风中无助、颤抖的物理形态。\n\n【第三步：阐效果（2分）】\n通过「受伤的鸟」这一具有痛感的意象，寄托并外化了人物此时内心挣扎、焦虑、脆弱的心理状态，达到了景情交融的效果。"},
  {sentence:"指点江山，激扬文字，粪土当年万户侯。",analysis:"📌 【高考标准答案示范】\n\n【第一步：明手法（1分）】\n运用了借代与对偶的手法。「江山」代指国家政权，「文字」代指革命舆论。\n\n【第二步：析具体（2分）】\n「指点」与「激扬」相对，「江山」与「文字」并列，句式整齐，音韵和谐，在对比中使革命活动更显具象化。\n\n【第三步：阐效果（2分）】\n借代的使用化抽象为具体，增强了形象性；对偶则让语言节奏感极强，慷慨激昂地表现出青年革命者蔑视权贵、担当天下的豪迈气概。"},
  {sentence:"他们的品质是那样的纯洁和高尚，他们的意志是那样的坚韧和刚强，他们的气质是那样的淳朴和谦逊……",analysis:"📌 【高考标准答案示范】\n\n【第一步：明手法（1分）】\n运用了排比的手法。连续三个「他们的……是那样的……」句式相同、语气一致。\n\n【第二步：析具体（2分）】\n从「品质」、「意志」、「气质」三个不同维度，层层递进地铺陈志愿军战士的高尚精神内核，形成了排山倒海的语势。\n\n【第三步：阐效果（2分）】\n结构整齐，音律顺畅，增强了文章的抒情气势，强烈地表达了作者对战士们无以复加的崇敬与赞美之情。"}
];




const NOVEL_EXAMPLES = [
  {title:"视角：第一人称限制视角的妙用",analysis:"📌 【叙事视角·高考答题模板】\n\n【第一步：判视角（1分）】\n本文采用第一人称（「我」）的限制性视角展开叙事。\n\n【第二步：析效果（2分）】\n1. 真实与拉近感：「我」作为故事的见证者与亲历者，具有极强的真实感。\n2. 制造悬念：由于「我」的认知局限性，无法窥见其他人物的完整心理，为情节发展设置了多处悬念。\n\n【第三步：扣主旨（1分）】\n通过「我」的主观感受和视线的推移，展现出普通人在特定时代环境下的心理波澜。"},
  {title:"时空：双线穿插与插叙的张力",analysis:"📌 【叙事结构·高考答题模板】\n\n【第一步：明手法（1分）】\n运用了「双线交织」与「插叙」相结合的叙事结构。\n\n【第二步：析具体（2分）】\n1. 明暗双线：以明线（主人公眼前的等待过程）推动现实时间；以暗线（插叙过去的遭遇和真相）揭示前因后果。\n2. 插叙切入：适时穿插往日的回忆，打破了单一时间轴的平铺直叙。\n\n【第三步：阐效果（2分）】\n这种叙事时空的交错，极大地丰富了小说的情节容量，强化了小说的戏剧冲突。"},
  {title:"道具：核心物象的结构与象征作用",analysis:"📌 【道具/物象·高考答题模板】\n\n【第一步：析物理（1分）】\n「对折的纸」是贯穿全文的核心线索与道具（物象）。\n\n【第二步：析结构（2分）】\n1. 线索作用：小说以「纸」的出现开篇，中途写「纸」在风中的挣扎，串联起承转合。\n2. 制造冲突：这张未打开的纸成为了情节的暴风眼。\n\n【第三步：析象征（2分）】\n1. 象征意义：纸上的字虽未点明，但其在风中「像受伤的鸟」一样挣扎，象征着主人公破碎的内心世界。\n2. 深化主题：道具的反复出现，将抽象的情感具象化。"}
];




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

const DECK_GAOZHONG = [
  {"front": "学不可以已", "hl": "已", "word": "已", "meaning": "停止", "analogy": "★《劝学》", "sentence": "学不可以已"},
  {"front": "木直中绳，其曲中规", "hl": "中", "word": "中(zhòng)", "meaning": "合乎", "analogy": "★《劝学》", "sentence": "木直中绳，其曲中规"},
  {"front": "虽有槁暴，不复挺者", "hl": "挺", "word": "挺", "meaning": "直", "analogy": "★《劝学》", "sentence": "虽有槁暴，不复挺者"},
  {"front": "君子生非异也，善假于物也", "hl": "假", "word": "假", "meaning": "借助", "analogy": "★《劝学》", "sentence": "君子生非异也，善假于物也"},
  {"front": "假舟楫者，非能水也，而绝江河", "hl": "绝", "word": "绝", "meaning": "横渡", "analogy": "★《劝学》", "sentence": "假舟楫者，非能水也，而绝江河"},
  {"front": "锲而不舍，金石可镂", "hl": "镂", "word": "镂", "meaning": "雕刻", "analogy": "★《劝学》", "sentence": "锲而不舍，金石可镂"},
  {"front": "古之学者必有师 / 吾从而师之", "hl": "师", "word": "师", "meaning": "老师/以……为师", "analogy": "★《师说》", "sentence": "古之学者必有师 / 吾从而师之"},
  {"front": "师者，所以传道受业解惑也", "hl": "受", "word": "受", "meaning": "通「授」,传授", "analogy": "★《师说》", "sentence": "师者，所以传道受业解惑也"},
  {"front": "人非生而知之者，孰能无惑", "hl": "惑", "word": "惑", "meaning": "疑惑", "analogy": "★《师说》", "sentence": "人非生而知之者，孰能无惑"},
  {"front": "巫医乐师百工之人，君子不齿", "hl": "不齿", "word": "不齿", "meaning": "看不起", "analogy": "★《师说》", "sentence": "巫医乐师百工之人，君子不齿"},
  {"front": "术业有专攻", "hl": "术业", "word": "术业", "meaning": "学术技艺", "analogy": "★《师说》", "sentence": "术业有专攻"},
  {"front": "壬戌之秋，七月既望", "hl": "既望", "word": "既望", "meaning": "农历每月十六日", "analogy": "★《赤壁赋》", "sentence": "壬戌之秋，七月既望"},
  {"front": "举酒属客，诵明月之诗", "hl": "属", "word": "属(zhǔ)", "meaning": "劝请", "analogy": "★《赤壁赋》", "sentence": "举酒属客，诵明月之诗"},
  {"front": "纵一苇之所如，凌万顷之茫然", "hl": "如", "word": "如", "meaning": "往", "analogy": "★《赤壁赋》", "sentence": "纵一苇之所如，凌万顷之茫然"},
  {"front": "苏子愀然，正襟危坐", "hl": "愀然", "word": "愀(qiǎo)然", "meaning": "容色改变的样子", "analogy": "★《赤壁赋》", "sentence": "苏子愀然，正襟危坐"},
  {"front": "是造物者之无尽藏也，而吾与子之所共适", "hl": "适", "word": "适", "meaning": "享有", "analogy": "★《赤壁赋》", "sentence": "是造物者之无尽藏也，而吾与子之所共适"},
  {"front": "泰山之阳，汶水西流；其阴，济水东流", "hl": "阳/阴", "word": "阳/阴", "meaning": "山南/山北", "analogy": "★《登泰山记》", "sentence": "泰山之阳，汶水西流；其阴，济水东流"},
  {"front": "自京师乘风雪，历齐河、长清", "hl": "乘", "word": "乘", "meaning": "冒着", "analogy": "★《登泰山记》", "sentence": "自京师乘风雪，历齐河、长清"},
  {"front": "越长城之限，至于泰安", "hl": "限", "word": "限", "meaning": "界限/门槛", "analogy": "★《登泰山记》", "sentence": "越长城之限，至于泰安"},
  {"front": "苍山负雪，明烛天南", "hl": "烛", "word": "烛", "meaning": "照", "analogy": "★《登泰山记》", "sentence": "苍山负雪，明烛天南"},
  {"front": "戊申晦，五鼓，与子颍坐日观亭", "hl": "晦", "word": "晦", "meaning": "农历每月最后一天", "analogy": "★《登泰山记》", "sentence": "戊申晦，五鼓，与子颍坐日观亭"},
  {"front": "对酒当歌，人生几何", "hl": "几何", "word": "几何", "meaning": "多少", "analogy": "★《短歌行》", "sentence": "对酒当歌，人生几何"},
  {"front": "越陌度阡，枉用相存", "hl": "存", "word": "存", "meaning": "问候、探望", "analogy": "★《短歌行》", "sentence": "越陌度阡，枉用相存"},
  {"front": "山不厌高，海不厌深", "hl": "厌", "word": "厌", "meaning": "满足", "analogy": "★《短歌行》", "sentence": "山不厌高，海不厌深"},
  {"front": "少无适俗韵，性本爱丘山", "hl": "韵", "word": "韵", "meaning": "气质、情致", "analogy": "★《归园田居》", "sentence": "少无适俗韵，性本爱丘山"},
  {"front": "开荒南野际，守拙归园田", "hl": "守拙", "word": "守拙", "meaning": "持守愚拙本性", "analogy": "★《归园田居》", "sentence": "开荒南野际，守拙归园田"},
  {"front": "海客谈瀛洲，烟涛微茫信难求", "hl": "信", "word": "信", "meaning": "实在", "analogy": "★《梦游天姥吟留别》", "sentence": "海客谈瀛洲，烟涛微茫信难求"},
  {"front": "势拔五岳掩赤城", "hl": "拔", "word": "拔", "meaning": "超出", "analogy": "★《梦游天姥吟留别》", "sentence": "势拔五岳掩赤城"},
  {"front": "熊咆龙吟殷岩泉", "hl": "殷", "word": "殷(yǐn)", "meaning": "震动", "analogy": "★《梦游天姥吟留别》", "sentence": "熊咆龙吟殷岩泉"},
  {"front": "予左迁九江郡司马", "hl": "左迁", "word": "左迁", "meaning": "降职", "analogy": "★《琵琶行》", "sentence": "予左迁九江郡司马"},
  {"front": "年长色衰，委身为贾人妇", "hl": "委身", "word": "委身", "meaning": "嫁人", "analogy": "★《琵琶行》", "sentence": "年长色衰，委身为贾人妇"},
  {"front": "低眉信手续续弹，说尽心中无限事", "hl": "信手", "word": "信手", "meaning": "随手", "analogy": "★《琵琶行》", "sentence": "低眉信手续续弹，说尽心中无限事"},
  {"front": "人生如梦，一尊还酹江月", "hl": "酹", "word": "酹(lèi)", "meaning": "洒酒祭奠", "analogy": "★《念奴娇》", "sentence": "人生如梦，一尊还酹江月"},
  {"front": "今齐地方千里", "hl": "地方", "word": "地方(古)", "meaning": "土地/方圆", "analogy": "★古今异义", "sentence": "今齐地方千里"},
  {"front": "未尝不叹息痛恨于桓、灵也", "hl": "痛恨", "word": "痛恨(古)", "meaning": "痛心/遗憾", "analogy": "★古今异义", "sentence": "未尝不叹息痛恨于桓、灵也"},
  {"front": "乃不知有汉，无论魏晋", "hl": "无论", "word": "无论(古)", "meaning": "不要说", "analogy": "★古今异义", "sentence": "乃不知有汉，无论魏晋"},
  {"front": "因为长句，歌以赠之", "hl": "因为", "word": "因为(古)", "meaning": "因此/创作", "analogy": "★古今异义", "sentence": "因为长句，歌以赠之"},
];

const DECK_GZSHICI = [
  {"front": "学不可以已", "hl": "已", "word": "已", "meaning": "停止", "analogy": "★《劝学》", "sentence": "学不可以已"},
  {"front": "木直中绳，其曲中规", "hl": "中", "word": "中(zhòng)", "meaning": "合乎", "analogy": "★《劝学》", "sentence": "木直中绳，其曲中规"},
  {"front": "虽有槁暴，不复挺者", "hl": "挺", "word": "挺", "meaning": "直", "analogy": "★《劝学》", "sentence": "虽有槁暴，不复挺者"},
  {"front": "君子生非异也，善假于物也", "hl": "假", "word": "假", "meaning": "借助", "analogy": "★《劝学》", "sentence": "君子生非异也，善假于物也"},
  {"front": "假舟楫者，非能水也，而绝江河", "hl": "绝", "word": "绝", "meaning": "横渡", "analogy": "★《劝学》", "sentence": "假舟楫者，非能水也，而绝江河"},
  {"front": "锲而不舍，金石可镂", "hl": "镂", "word": "镂", "meaning": "雕刻", "analogy": "★《劝学》", "sentence": "锲而不舍，金石可镂"},
  {"front": "古之学者必有师 / 吾从而师之", "hl": "师", "word": "师", "meaning": "老师/以……为师", "analogy": "★《师说》", "sentence": "古之学者必有师 / 吾从而师之"},
  {"front": "师者，所以传道受业解惑也", "hl": "受", "word": "受", "meaning": "通「授」,传授", "analogy": "★《师说》", "sentence": "师者，所以传道受业解惑也"},
  {"front": "人非生而知之者，孰能无惑", "hl": "惑", "word": "惑", "meaning": "疑惑", "analogy": "★《师说》", "sentence": "人非生而知之者，孰能无惑"},
  {"front": "巫医乐师百工之人，君子不齿", "hl": "不齿", "word": "不齿", "meaning": "看不起", "analogy": "★《师说》", "sentence": "巫医乐师百工之人，君子不齿"},
  {"front": "术业有专攻", "hl": "术业", "word": "术业", "meaning": "学术技艺", "analogy": "★《师说》", "sentence": "术业有专攻"},
  {"front": "壬戌之秋，七月既望", "hl": "既望", "word": "既望", "meaning": "农历每月十六日", "analogy": "★《赤壁赋》", "sentence": "壬戌之秋，七月既望"},
  {"front": "举酒属客，诵明月之诗", "hl": "属", "word": "属(zhǔ)", "meaning": "劝请", "analogy": "★《赤壁赋》", "sentence": "举酒属客，诵明月之诗"},
  {"front": "纵一苇之所如，凌万顷之茫然", "hl": "如", "word": "如", "meaning": "往", "analogy": "★《赤壁赋》", "sentence": "纵一苇之所如，凌万顷之茫然"},
  {"front": "苏子愀然，正襟危坐", "hl": "愀然", "word": "愀(qiǎo)然", "meaning": "容色改变的样子", "analogy": "★《赤壁赋》", "sentence": "苏子愀然，正襟危坐"},
  {"front": "是造物者之无尽藏也，而吾与子之所共适", "hl": "适", "word": "适", "meaning": "享有", "analogy": "★《赤壁赋》", "sentence": "是造物者之无尽藏也，而吾与子之所共适"},
  {"front": "泰山之阳，汶水西流；其阴，济水东流", "hl": "阳/阴", "word": "阳/阴", "meaning": "山南/山北", "analogy": "★《登泰山记》", "sentence": "泰山之阳，汶水西流；其阴，济水东流"},
  {"front": "自京师乘风雪，历齐河、长清", "hl": "乘", "word": "乘", "meaning": "冒着", "analogy": "★《登泰山记》", "sentence": "自京师乘风雪，历齐河、长清"},
  {"front": "越长城之限，至于泰安", "hl": "限", "word": "限", "meaning": "界限/门槛", "analogy": "★《登泰山记》", "sentence": "越长城之限，至于泰安"},
  {"front": "苍山负雪，明烛天南", "hl": "烛", "word": "烛", "meaning": "照", "analogy": "★《登泰山记》", "sentence": "苍山负雪，明烛天南"},
  {"front": "戊申晦，五鼓，与子颍坐日观亭", "hl": "晦", "word": "晦", "meaning": "农历每月最后一天", "analogy": "★《登泰山记》", "sentence": "戊申晦，五鼓，与子颍坐日观亭"},
  {"front": "对酒当歌，人生几何", "hl": "几何", "word": "几何", "meaning": "多少", "analogy": "★《短歌行》", "sentence": "对酒当歌，人生几何"},
  {"front": "越陌度阡，枉用相存", "hl": "存", "word": "存", "meaning": "问候、探望", "analogy": "★《短歌行》", "sentence": "越陌度阡，枉用相存"},
  {"front": "山不厌高，海不厌深", "hl": "厌", "word": "厌", "meaning": "满足", "analogy": "★《短歌行》", "sentence": "山不厌高，海不厌深"},
  {"front": "少无适俗韵，性本爱丘山", "hl": "韵", "word": "韵", "meaning": "气质、情致", "analogy": "★《归园田居》", "sentence": "少无适俗韵，性本爱丘山"},
  {"front": "开荒南野际，守拙归园田", "hl": "守拙", "word": "守拙", "meaning": "持守愚拙本性", "analogy": "★《归园田居》", "sentence": "开荒南野际，守拙归园田"},
  {"front": "海客谈瀛洲，烟涛微茫信难求", "hl": "信", "word": "信", "meaning": "实在", "analogy": "★《梦游天姥吟留别》", "sentence": "海客谈瀛洲，烟涛微茫信难求"},
  {"front": "势拔五岳掩赤城", "hl": "拔", "word": "拔", "meaning": "超出", "analogy": "★《梦游天姥吟留别》", "sentence": "势拔五岳掩赤城"},
  {"front": "熊咆龙吟殷岩泉", "hl": "殷", "word": "殷(yǐn)", "meaning": "震动", "analogy": "★《梦游天姥吟留别》", "sentence": "熊咆龙吟殷岩泉"},
  {"front": "予左迁九江郡司马", "hl": "左迁", "word": "左迁", "meaning": "降职", "analogy": "★《琵琶行》", "sentence": "予左迁九江郡司马"},
  {"front": "年长色衰，委身为贾人妇", "hl": "委身", "word": "委身", "meaning": "嫁人", "analogy": "★《琵琶行》", "sentence": "年长色衰，委身为贾人妇"},
  {"front": "低眉信手续续弹，说尽心中无限事", "hl": "信手", "word": "信手", "meaning": "随手", "analogy": "★《琵琶行》", "sentence": "低眉信手续续弹，说尽心中无限事"},
  {"front": "人生如梦，一尊还酹江月", "hl": "酹", "word": "酹(lèi)", "meaning": "洒酒祭奠", "analogy": "★《念奴娇》", "sentence": "人生如梦，一尊还酹江月"},
  {"front": "今齐地方千里", "hl": "地方", "word": "地方(古)", "meaning": "土地/方圆", "analogy": "★古今异义", "sentence": "今齐地方千里"},
  {"front": "未尝不叹息痛恨于桓、灵也", "hl": "痛恨", "word": "痛恨(古)", "meaning": "痛心/遗憾", "analogy": "★古今异义", "sentence": "未尝不叹息痛恨于桓、灵也"},
  {"front": "乃不知有汉，无论魏晋", "hl": "无论", "word": "无论(古)", "meaning": "不要说", "analogy": "★古今异义", "sentence": "乃不知有汉，无论魏晋"},
  {"front": "因为长句，歌以赠之", "hl": "因为", "word": "因为(古)", "meaning": "因此/创作", "analogy": "★古今异义", "sentence": "因为长句，歌以赠之"},
  {"front": "屈平疾王听之不聪也", "hl": "疾", "word": "疾", "meaning": "痛心", "analogy": "★《屈原列传》", "sentence": "屈平疾王听之不聪也"},
  {"front": "人穷则反本，故劳苦倦极，未尝不呼天也", "hl": "反本", "word": "反本", "meaning": "追念根本", "analogy": "★《屈原列传》", "sentence": "人穷则反本，故劳苦倦极，未尝不呼天也"},
  {"front": "信而见疑，忠而被谤，能无怨乎？", "hl": "见", "word": "见", "meaning": "被", "analogy": "★《屈原列传》", "sentence": "信而见疑，忠而被谤，能无怨乎？"},
  {"front": "其文约，其辞微，其志洁，其行廉", "hl": "约", "word": "约", "meaning": "简约", "analogy": "★《屈原列传》", "sentence": "其文约，其辞微，其志洁，其行廉"},
  {"front": "皭然泥而不滓者也", "hl": "泥", "word": "泥", "meaning": "染黑", "analogy": "★《屈原列传》", "sentence": "皭然泥而不滓者也"},
  {"front": "明年，秦割汉中地与楚以和", "hl": "明年", "word": "明年", "meaning": "第二年", "analogy": "★《屈原列传》", "sentence": "明年，秦割汉中地与楚以和"},
  {"front": "而设诡辩于怀王之宠姬郑袖", "hl": "诡辩", "word": "诡辩", "meaning": "说假话", "analogy": "★《屈原列传》", "sentence": "而设诡辩于怀王之宠姬郑袖"},
  {"front": "被发行吟泽畔，颜色憔悴", "hl": "颜色", "word": "颜色(古)", "meaning": "脸色", "analogy": "★《屈原列传》", "sentence": "被发行吟泽畔，颜色憔悴"},
  {"front": "颜色憔悴，形容枯槁", "hl": "形容", "word": "形容(古)", "meaning": "形体容貌", "analogy": "★《屈原列传》", "sentence": "颜色憔悴，形容枯槁"},
  {"front": "匈奴使来，汉亦留之以相当", "hl": "相当", "word": "相当(古)", "meaning": "相抵", "analogy": "★《苏武传》", "sentence": "匈奴使来，汉亦留之以相当"},
  {"front": "武帝嘉其义", "hl": "嘉", "word": "嘉", "meaning": "赞许", "analogy": "★《苏武传》", "sentence": "武帝嘉其义"},
  {"front": "虞常在汉时，素与副张胜相知", "hl": "相知", "word": "相知", "meaning": "熟识", "analogy": "★《苏武传》", "sentence": "虞常在汉时，素与副张胜相知"},
  {"front": "见犯乃死，重负国", "hl": "见犯", "word": "见犯", "meaning": "受到侮辱", "analogy": "★《苏武传》", "sentence": "见犯乃死，重负国"},
  {"front": "见犯乃死，重负国", "hl": "重", "word": "重", "meaning": "更加", "analogy": "★《苏武传》", "sentence": "见犯乃死，重负国"},
  {"front": "虞常果引张胜", "hl": "引", "word": "引", "meaning": "牵扯", "analogy": "★《苏武传》", "sentence": "虞常果引张胜"},
  {"front": "单于壮其节", "hl": "壮", "word": "壮", "meaning": "以……为壮", "analogy": "★《苏武传》", "sentence": "单于壮其节"},
  {"front": "副有罪，当相坐", "hl": "坐", "word": "坐", "meaning": "连坐", "analogy": "★《苏武传》", "sentence": "副有罪，当相坐"},
  {"front": "复举剑拟之，武不动", "hl": "拟", "word": "拟", "meaning": "比画", "analogy": "★《苏武传》", "sentence": "复举剑拟之，武不动"},
  {"front": "武卧啮雪，与旃毛并咽之", "hl": "啮", "word": "啮", "meaning": "咬/嚼", "analogy": "★《苏武传》", "sentence": "武卧啮雪，与旃毛并咽之"},
  {"front": "使牧羝，羝乳乃得归", "hl": "乳", "word": "乳", "meaning": "生子", "analogy": "★《苏武传》", "sentence": "使牧羝，羝乳乃得归"},
  {"front": "皆为陛下所成就", "hl": "成就", "word": "成就(古)", "meaning": "栽培/提拔", "analogy": "★《苏武传》", "sentence": "皆为陛下所成就"},
  {"front": "秦孝公据崤函之固", "hl": "固", "word": "固", "meaning": "险要地势", "analogy": "★《过秦论》", "sentence": "秦孝公据崤函之固"},
  {"front": "诸侯恐惧，会盟而谋弱秦", "hl": "弱", "word": "弱", "meaning": "削弱", "analogy": "★《过秦论》", "sentence": "诸侯恐惧，会盟而谋弱秦"},
  {"front": "不爱珍器重宝肥饶之地", "hl": "爱", "word": "爱", "meaning": "吝惜", "analogy": "★《过秦论》", "sentence": "不爱珍器重宝肥饶之地"},
  {"front": "以致天下之士，合从缔交", "hl": "致", "word": "致", "meaning": "招纳", "analogy": "★《过秦论》", "sentence": "以致天下之士，合从缔交"},
  {"front": "追亡逐北，伏尸百万", "hl": "北", "word": "北", "meaning": "败逃的军队", "analogy": "★《过秦论》", "sentence": "追亡逐北，伏尸百万"},
  {"front": "振长策而御宇内", "hl": "御", "word": "御", "meaning": "驾驭/统治", "analogy": "★《过秦论》", "sentence": "振长策而御宇内"},
  {"front": "履至尊而制六合", "hl": "履", "word": "履", "meaning": "登上", "analogy": "★《过秦论》", "sentence": "履至尊而制六合"},
  {"front": "却匈奴七百余里", "hl": "却", "word": "却", "meaning": "使……退却", "analogy": "★《过秦论》", "sentence": "却匈奴七百余里"},
  {"front": "隳名城，杀豪杰", "hl": "隳", "word": "隳(huī)", "meaning": "毁坏", "analogy": "★《过秦论》", "sentence": "隳名城，杀豪杰"},
  {"front": "斩木为兵，揭竿为旗", "hl": "揭", "word": "揭", "meaning": "举", "analogy": "★《过秦论》", "sentence": "斩木为兵，揭竿为旗"},
  {"front": "赢粮而景从", "hl": "景", "word": "景", "meaning": "同「影」", "analogy": "★《过秦论》", "sentence": "赢粮而景从"},
  {"front": "天下云集响应", "hl": "云/响", "word": "云/响", "meaning": "名词作状语", "analogy": "★《过秦论》", "sentence": "天下云集响应"},
  {"front": "原庄宗之所以得天下", "hl": "原", "word": "原", "meaning": "推其根本", "analogy": "★《伶官传序》", "sentence": "原庄宗之所以得天下"},
  {"front": "方其系燕父子以组", "hl": "系", "word": "系", "meaning": "捆绑", "analogy": "★《伶官传序》", "sentence": "方其系燕父子以组"},
  {"front": "函梁君臣之首", "hl": "函", "word": "函", "meaning": "用匣子装", "analogy": "★《伶官传序》", "sentence": "函梁君臣之首"},
  {"front": "抑本其成败之迹", "hl": "抑", "word": "抑", "meaning": "或者", "analogy": "★《伶官传序》", "sentence": "抑本其成败之迹"},
  {"front": "抑本其成败之迹", "hl": "本", "word": "本", "meaning": "探究", "analogy": "★《伶官传序》", "sentence": "抑本其成败之迹"},
  {"front": "因而和焉", "hl": "和", "word": "和(hè)", "meaning": "酬答", "analogy": "★《燕歌行》", "sentence": "因而和焉"},
  {"front": "旌旆逶迤碣石间", "hl": "逶迤", "word": "逶迤(wēiyí)", "meaning": "舒展", "analogy": "★《燕歌行》", "sentence": "旌旆逶迤碣石间"},
  {"front": "绝域苍茫无所有", "hl": "绝域", "word": "绝域", "meaning": "极远的地方", "analogy": "★《燕歌行》", "sentence": "绝域苍茫无所有"},
  {"front": "吴丝蜀桐张高秋", "hl": "张", "word": "张", "meaning": "弹奏", "analogy": "★《李凭箜篌引》", "sentence": "吴丝蜀桐张高秋"},
  {"front": "锦瑟无端五十弦", "hl": "无端", "word": "无端", "meaning": "无缘无故", "analogy": "★《锦瑟》", "sentence": "锦瑟无端五十弦"},
  {"front": "早岁那知世事艰", "hl": "那", "word": "那", "meaning": "哪", "analogy": "★《书愤》", "sentence": "早岁那知世事艰"},
  {"front": "氓之蚩蚩，抱布贸丝", "hl": "贸", "word": "贸", "meaning": "交易", "analogy": "★《氓》", "sentence": "氓之蚩蚩，抱布贸丝"},
  {"front": "匪来贸丝，来即我谋", "hl": "即", "word": "即", "meaning": "靠近/商量", "analogy": "★《氓》", "sentence": "匪来贸丝，来即我谋"},
  {"front": "匪我愆期，子无良媒", "hl": "愆", "word": "愆(qiān)", "meaning": "拖延", "analogy": "★《氓》", "sentence": "匪我愆期，子无良媒"},
  {"front": "将子无怒，秋以为期", "hl": "将", "word": "将(qiāng)", "meaning": "愿/请", "analogy": "★《氓》", "sentence": "将子无怒，秋以为期"},
  {"front": "于嗟女兮，无与士耽", "hl": "耽", "word": "耽", "meaning": "沉溺", "analogy": "★《氓》", "sentence": "于嗟女兮，无与士耽"},
  {"front": "女之耽兮，不可说也", "hl": "说", "word": "说", "meaning": "同「脱」,脱身", "analogy": "★《氓》", "sentence": "女之耽兮，不可说也"},
  {"front": "自我徂尔，三岁食贫", "hl": "徂", "word": "徂(cú)", "meaning": "往", "analogy": "★《氓》", "sentence": "自我徂尔，三岁食贫"},
  {"front": "女也不爽，士贰其行", "hl": "爽", "word": "爽", "meaning": "差错", "analogy": "★《氓》", "sentence": "女也不爽，士贰其行"},
  {"front": "士贰其行", "hl": "贰", "word": "贰", "meaning": "不专一", "analogy": "★《氓》", "sentence": "士贰其行"},
  {"front": "帝高阳之苗裔兮", "hl": "苗裔", "word": "苗裔", "meaning": "后代", "analogy": "★《离骚》", "sentence": "帝高阳之苗裔兮"},
  {"front": "皇览揆余初度兮", "hl": "揆", "word": "揆(kuí)", "meaning": "测量/衡量", "analogy": "★《离骚》", "sentence": "皇览揆余初度兮"},
  {"front": "肇锡余以嘉名", "hl": "肇", "word": "肇(zhào)", "meaning": "开始", "analogy": "★《离骚》", "sentence": "肇锡余以嘉名"},
  {"front": "春与秋其代序", "hl": "代序", "word": "代序", "meaning": "时序更替", "analogy": "★《离骚》", "sentence": "春与秋其代序"},
  {"front": "謇朝谇而夕替", "hl": "替", "word": "替", "meaning": "废弃", "analogy": "★《离骚》", "sentence": "謇朝谇而夕替"},
  {"front": "忍尤而攘诟", "hl": "尤", "word": "尤", "meaning": "责备", "analogy": "★《离骚》", "sentence": "忍尤而攘诟"},
  {"front": "为仲卿母所遣", "hl": "遣", "word": "遣", "meaning": "夫家休弃妻子", "analogy": "★《孔雀东南飞》", "sentence": "为仲卿母所遣"},
  {"front": "便可白公姥", "hl": "白", "word": "白", "meaning": "告诉/禀告", "analogy": "★《孔雀东南飞》", "sentence": "便可白公姥"},
  {"front": "谢家来贵门", "hl": "谢", "word": "谢", "meaning": "辞别", "analogy": "★《孔雀东南飞》", "sentence": "谢家来贵门"},
  {"front": "始适还家门", "hl": "适", "word": "适", "meaning": "出嫁", "analogy": "★《孔雀东南飞》", "sentence": "始适还家门"},
  {"front": "便言多令才", "hl": "令", "word": "令", "meaning": "美好", "analogy": "★《孔雀东南飞》", "sentence": "便言多令才"},
  {"front": "可以横绝峨眉巅", "hl": "绝", "word": "绝", "meaning": "横越", "analogy": "★《蜀道难》", "sentence": "可以横绝峨眉巅"},
  {"front": "上有六龙回日之高标", "hl": "回", "word": "回", "meaning": "回转", "analogy": "★《蜀道难》", "sentence": "上有六龙回日之高标"},
  {"front": "使人听此凋朱颜", "hl": "凋", "word": "凋", "meaning": "使……凋谢", "analogy": "★《蜀道难》", "sentence": "使人听此凋朱颜"},
  {"front": "连峰去天不盈尺", "hl": "去", "word": "去", "meaning": "距离", "analogy": "★《蜀道难》", "sentence": "连峰去天不盈尺"},
  {"front": "臣以险衅，夙遭闵凶", "hl": "险衅", "word": "险衅(xìnxìn)", "meaning": "艰难祸患", "analogy": "★《陈情表》", "sentence": "臣以险衅，夙遭闵凶"},
  {"front": "慈父见背", "hl": "见背", "word": "见背", "meaning": "指尊长去世", "analogy": "★《陈情表》", "sentence": "慈父见背"},
  {"front": "终鲜兄弟", "hl": "鲜", "word": "鲜(xiǎn)", "meaning": "少/没有", "analogy": "★《陈情表》", "sentence": "终鲜兄弟"},
  {"front": "而刘夙婴疾病", "hl": "婴", "word": "婴", "meaning": "缠绕", "analogy": "★《陈情表》", "sentence": "而刘夙婴疾病"},
  {"front": "除臣洗马", "hl": "除", "word": "除", "meaning": "授官", "analogy": "★《陈情表》", "sentence": "除臣洗马"},
  {"front": "则刘病日笃", "hl": "笃", "word": "笃(dǔ)", "meaning": "病重", "analogy": "★《陈情表》", "sentence": "则刘病日笃"},
  {"front": "过蒙拔擢", "hl": "拔擢", "word": "拔擢(bá zhuó)", "meaning": "提拔", "analogy": "★《陈情表》", "sentence": "过蒙拔擢"},
  {"front": "日薄西山", "hl": "薄", "word": "薄", "meaning": "迫近", "analogy": "★《陈情表》", "sentence": "日薄西山"},
  {"front": "余稍为修葺", "hl": "修葺", "word": "修葺(xiūqì)", "meaning": "修补", "analogy": "★《项脊轩志》", "sentence": "余稍为修葺"},
  {"front": "室始洞然", "hl": "洞然", "word": "洞然", "meaning": "明亮的样子", "analogy": "★《项脊轩志》", "sentence": "室始洞然"},
  {"front": "迨诸父异爨", "hl": "异爨", "word": "异爨(yìcuàn)", "meaning": "分家", "analogy": "★《项脊轩志》", "sentence": "迨诸父异爨"},
  {"front": "乳二世", "hl": "乳", "word": "乳", "meaning": "哺育", "analogy": "★《项脊轩志》", "sentence": "乳二世"},
  {"front": "吾妻归宁", "hl": "归宁", "word": "归宁", "meaning": "女子回娘家省亲", "analogy": "★《项脊轩志》", "sentence": "吾妻归宁"},
  {"front": "今已亭亭如盖矣", "hl": "盖", "word": "盖", "meaning": "伞盖", "analogy": "★《项脊轩志》", "sentence": "今已亭亭如盖矣"},
  {"front": "群贤毕至", "hl": "毕", "word": "毕", "meaning": "全/都", "analogy": "★《兰亭集序》", "sentence": "群贤毕至"},
  {"front": "茂林修竹", "hl": "修", "word": "修", "meaning": "高", "analogy": "★《兰亭集序》", "sentence": "茂林修竹"},
  {"front": "列坐其次", "hl": "次", "word": "次", "meaning": "旁边", "analogy": "★《兰亭集序》", "sentence": "列坐其次"},
  {"front": "信可乐也", "hl": "信", "word": "信", "meaning": "实在", "analogy": "★《兰亭集序》", "sentence": "信可乐也"},
  {"front": "若合一契", "hl": "契", "word": "契(qì)", "meaning": "符契", "analogy": "★《兰亭集序》", "sentence": "若合一契"},
  {"front": "一死生为虚诞", "hl": "一", "word": "一", "meaning": "把……看作一样", "analogy": "★《兰亭集序》", "sentence": "一死生为虚诞"},
  {"front": "悟已往之不谏", "hl": "谏", "word": "谏", "meaning": "挽回", "analogy": "★《归去来兮辞》", "sentence": "悟已往之不谏"},
  {"front": "知来者之可追", "hl": "追", "word": "追", "meaning": "补救", "analogy": "★《归去来兮辞》", "sentence": "知来者之可追"},
  {"front": "三径就荒", "hl": "就", "word": "就", "meaning": "荒芜", "analogy": "★《归去来兮辞》", "sentence": "三径就荒"},
  {"front": "眄庭柯以怡颜", "hl": "眄", "word": "眄(miǎn)", "meaning": "看", "analogy": "★《归去来兮辞》", "sentence": "眄庭柯以怡颜"},
  {"front": "云无心以出岫", "hl": "岫", "word": "岫(xiù)", "meaning": "山峰", "analogy": "★《归去来兮辞》", "sentence": "云无心以出岫"},
  {"front": "曷不委心任去留", "hl": "委心", "word": "委心", "meaning": "随心所欲", "analogy": "★《归去来兮辞》", "sentence": "曷不委心任去留"},
  {"front": "驼业种树", "hl": "业", "word": "业", "meaning": "以……为业", "analogy": "★《种树郭橐驼传》", "sentence": "驼业种树"},
  {"front": "早实以蕃", "hl": "蕃", "word": "蕃(fán)", "meaning": "多", "analogy": "★《种树郭橐驼传》", "sentence": "早实以蕃"},
  {"front": "以致其性焉尔", "hl": "致", "word": "致", "meaning": "使达到", "analogy": "★《种树郭橐驼传》", "sentence": "以致其性焉尔"},
  {"front": "字而幼孩", "hl": "字", "word": "字", "meaning": "养育", "analogy": "★《种树郭橐驼传》", "sentence": "字而幼孩"},
  {"front": "遂而鸡豚", "hl": "遂", "word": "遂", "meaning": "成/养好", "analogy": "★《种树郭橐驼传》", "sentence": "遂而鸡豚"},
  {"front": "微风鼓浪", "hl": "鼓", "word": "鼓", "meaning": "激荡", "analogy": "★《石钟山记》", "sentence": "微风鼓浪"},
  {"front": "余自齐安舟行适临汝", "hl": "适", "word": "适", "meaning": "往", "analogy": "★《石钟山记》", "sentence": "余自齐安舟行适临汝"},
  {"front": "汝识之乎", "hl": "识", "word": "识(zhì)", "meaning": "知道", "analogy": "★《石钟山记》", "sentence": "汝识之乎"},
  {"front": "痴儿了却公家事", "hl": "了却", "word": "了却", "meaning": "办完", "analogy": "★《登快阁》", "sentence": "痴儿了却公家事"},
  {"front": "夜雪初霁", "hl": "霁", "word": "霁(jì)", "meaning": "天刚晴", "analogy": "★《临安春雨初霁》", "sentence": "夜雪初霁"},
  {"front": "晴窗细乳戏分茶", "hl": "分茶", "word": "分茶", "meaning": "宋代烹茶法", "analogy": "★《临安春雨初霁》", "sentence": "晴窗细乳戏分茶"},
  {"front": "敏于事而慎于言", "hl": "敏", "word": "敏", "meaning": "勤勉", "analogy": "★《论语》", "sentence": "敏于事而慎于言"},
  {"front": "就有道而正焉", "hl": "就有道", "word": "就有道", "meaning": "到有道的人那里去", "analogy": "★《论语》", "sentence": "就有道而正焉"},
  {"front": "君子喻于义，小人喻于利", "hl": "喻", "word": "喻", "meaning": "知晓、明白", "analogy": "★《论语》", "sentence": "君子喻于义，小人喻于利"},
  {"front": "见贤思齐焉", "hl": "齐", "word": "齐", "meaning": "等同", "analogy": "★《论语》", "sentence": "见贤思齐焉"},
  {"front": "质胜文则野，文胜质则史", "hl": "质/文/野/史", "word": "质文野史", "meaning": "质朴/文采/粗野/虚浮", "analogy": "★《论语》", "sentence": "质胜文则野，文胜质则史"},
  {"front": "士不可以不弘毅", "hl": "弘毅", "word": "弘毅", "meaning": "志向远大，意志坚强", "analogy": "★《论语》", "sentence": "士不可以不弘毅"},
  {"front": "譬如为山，未成一篑", "hl": "一篑", "word": "一篑", "meaning": "一筐土", "analogy": "★《论语》", "sentence": "譬如为山，未成一篑"},
  {"front": "克己复礼为仁", "hl": "克己复礼", "word": "克己复礼", "meaning": "约束自我，归复于礼", "analogy": "★《论语》", "sentence": "克己复礼为仁"},
  {"front": "回虽不敏，请事斯语矣", "hl": "事", "word": "事", "meaning": "实践、从事", "analogy": "★《论语》", "sentence": "回虽不敏，请事斯语矣"},
  {"front": "《诗》可以兴，可以观，可以群，可以怨", "hl": "兴观群怨", "word": "兴观群怨", "meaning": "激发/观察/合群/怨刺", "analogy": "★《论语》", "sentence": "《诗》可以兴，可以观，可以群，可以怨"},
  {"front": "大学之道，在明明德", "hl": "明明德", "word": "明明德", "meaning": "彰明美德", "analogy": "★《大学》", "sentence": "大学之道，在明明德"},
  {"front": "在止于至善 / 知止而后有定", "hl": "止", "word": "止", "meaning": "达到/停止", "analogy": "★《大学》", "sentence": "在止于至善 / 知止而后有定"},
  {"front": "安而后能虑，虑而后能得", "hl": "虑", "word": "虑", "meaning": "思虑精详", "analogy": "★《大学》", "sentence": "安而后能虑，虑而后能得"},
  {"front": "欲治其国者，先齐其家", "hl": "齐", "word": "齐", "meaning": "使整齐有序", "analogy": "★《大学》", "sentence": "欲治其国者，先齐其家"},
  {"front": "致知在格物", "hl": "格物", "word": "格物", "meaning": "推究事物原理", "analogy": "★《大学》", "sentence": "致知在格物"},
  {"front": "今人乍见孺子将入于井", "hl": "乍", "word": "乍", "meaning": "突然", "analogy": "★《孟子》", "sentence": "今人乍见孺子将入于井"},
  {"front": "皆有怵惕恻隐之心", "hl": "怵惕恻隐", "word": "怵惕恻隐", "meaning": "惊骇恐惧/哀痛怜悯", "analogy": "★《孟子》", "sentence": "皆有怵惕恻隐之心"},
  {"front": "非所以要誉于乡党朋友也", "hl": "要", "word": "要(yāo)", "meaning": "博取/求取", "analogy": "★《孟子》", "sentence": "非所以要誉于乡党朋友也"},
  {"front": "有是四端而自谓不能者，自贼者也", "hl": "贼", "word": "贼", "meaning": "伤害", "analogy": "★《孟子》", "sentence": "有是四端而自谓不能者，自贼者也"},
  {"front": "恻隐之心，仁之端也", "hl": "端", "word": "端", "meaning": "萌芽/发端", "analogy": "★《孟子》", "sentence": "恻隐之心，仁之端也"},
  {"front": "若火之始然，泉之始达", "hl": "达", "word": "达", "meaning": "流通/涌出", "analogy": "★《孟子》", "sentence": "若火之始然，泉之始达"},
  {"front": "三十辐共一毂", "hl": "毂", "word": "毂(gǔ)", "meaning": "车轮中心", "analogy": "★《老子》", "sentence": "三十辐共一毂"},
  {"front": "埏埴以为器", "hl": "埏埴", "word": "埏埴(shānzhí)", "meaning": "和泥制作陶器", "analogy": "★《老子》", "sentence": "埏埴以为器"},
  {"front": "企者不立，跨者不行", "hl": "企/跨", "word": "企跨", "meaning": "踮起脚/迈大步", "analogy": "★《老子》", "sentence": "企者不立，跨者不行"},
  {"front": "自伐者无功，自矜者不长", "hl": "伐/矜", "word": "伐矜", "meaning": "夸耀", "analogy": "★《老子》", "sentence": "自伐者无功，自矜者不长"},
  {"front": "知足者富，强行者有志", "hl": "强行", "word": "强行", "meaning": "勤勉而行", "analogy": "★《老子》", "sentence": "知足者富，强行者有志"},
  {"front": "其脆易泮", "hl": "泮", "word": "泮(pàn)", "meaning": "同「判」,分离", "analogy": "★《老子》", "sentence": "其脆易泮"},
  {"front": "常于几成而败之", "hl": "几", "word": "几(jī)", "meaning": "接近", "analogy": "★《老子》", "sentence": "常于几成而败之"},
  {"front": "我树之成而实五石", "hl": "树", "word": "树", "meaning": "种植", "analogy": "★《庄子》", "sentence": "我树之成而实五石"},
  {"front": "剖之以为瓢，则瓠落无所容", "hl": "瓠落", "word": "瓠落(huòluò)", "meaning": "宽大空廓", "analogy": "★《庄子》", "sentence": "剖之以为瓢，则瓠落无所容"},
  {"front": "吾为其无用而掊之", "hl": "掊", "word": "掊(pǒu)", "meaning": "击破", "analogy": "★《庄子》", "sentence": "吾为其无用而掊之"},
  {"front": "宋人有善为不龟手之药者", "hl": "龟", "word": "龟(jūn)", "meaning": "同「皲」,皮肤冻裂", "analogy": "★《庄子》", "sentence": "宋人有善为不龟手之药者"},
  {"front": "世世以洴澼纩为事", "hl": "洴澼纩", "word": "洴澼纩(píngpìkuàng)", "meaning": "漂洗丝絮", "analogy": "★《庄子》", "sentence": "世世以洴澼纩为事"},
  {"front": "客得之，以说吴王", "hl": "说", "word": "说(shuì)", "meaning": "劝说/取悦", "analogy": "★《庄子》", "sentence": "客得之，以说吴王"},
  {"front": "何不虑以为大樽而浮乎江湖", "hl": "虑", "word": "虑", "meaning": "结缀/考虑", "analogy": "★《庄子》", "sentence": "何不虑以为大樽而浮乎江湖"},
  {"front": "譬之如医之攻人之疾者然", "hl": "攻", "word": "攻", "meaning": "治疗", "analogy": "★《墨子》", "sentence": "譬之如医之攻人之疾者然"},
  {"front": "必知乱之所自起，焉能治之", "hl": "焉", "word": "焉", "meaning": "于是", "analogy": "★《墨子》", "sentence": "必知乱之所自起，焉能治之"},
  {"front": "当察乱何自起", "hl": "当", "word": "当(cháng)", "meaning": "尝试", "analogy": "★《墨子》", "sentence": "当察乱何自起"},
  {"front": "故亏父而自利", "hl": "亏", "word": "亏", "meaning": "使受损失", "analogy": "★《墨子》", "sentence": "故亏父而自利"},
  {"front": "视父兄与君若其身，恶施不孝", "hl": "恶施", "word": "恶施(wūshī)", "meaning": "怎么实行", "analogy": "★《墨子》", "sentence": "视父兄与君若其身，恶施不孝"},
  {"front": "恶得不禁恶而劝爱", "hl": "劝", "word": "劝", "meaning": "鼓励", "analogy": "★《墨子》", "sentence": "恶得不禁恶而劝爱"},
  {"front": "岂曰无衣？与子同袍", "hl": "同袍", "word": "同袍", "meaning": "长袍/战友", "analogy": "★《无衣》", "sentence": "岂曰无衣？与子同袍"},
  {"front": "修我戈矛，与子同仇", "hl": "同仇", "word": "同仇", "meaning": "共同对敌", "analogy": "★《无衣》", "sentence": "修我戈矛，与子同仇"},
  {"front": "与子偕作", "hl": "偕作", "word": "偕作", "meaning": "一同行动", "analogy": "★《无衣》", "sentence": "与子偕作"},
  {"front": "滟滟随波千万里", "hl": "滟滟", "word": "滟滟(yànyàn)", "meaning": "波光荡漾", "analogy": "★《春江花月夜》", "sentence": "滟滟随波千万里"},
  {"front": "江流宛转绕芳甸", "hl": "芳甸", "word": "芳甸(fāngdiàn)", "meaning": "花草茂盛的原野", "analogy": "★《春江花月夜》", "sentence": "江流宛转绕芳甸"},
  {"front": "会须一饮三百杯", "hl": "会须", "word": "会须", "meaning": "应当", "analogy": "★《将进酒》", "sentence": "会须一饮三百杯"},
  {"front": "钟鼓馔玉不足贵", "hl": "馔玉", "word": "馔玉(zhuànyù)", "meaning": "珍美的食品", "analogy": "★《将进酒》", "sentence": "钟鼓馔玉不足贵"},
  {"front": "斗酒十千恣欢谑", "hl": "恣", "word": "恣(zì)", "meaning": "尽情", "analogy": "★《将进酒》", "sentence": "斗酒十千恣欢谑"},
  {"front": "径须沽取对君酌", "hl": "径须", "word": "径须", "meaning": "应当", "analogy": "★《将进酒》", "sentence": "径须沽取对君酌"},
  {"front": "十年生死两茫茫", "hl": "茫茫", "word": "茫茫", "meaning": "茫然不相知", "analogy": "★《江城子》", "sentence": "十年生死两茫茫"},
  {"front": "夜来幽梦忽还乡", "hl": "幽梦", "word": "幽梦", "meaning": "隐约迷离的梦", "analogy": "★《江城子》", "sentence": "夜来幽梦忽还乡"},
  {"front": "以吾一日长乎尔，毋吾以也", "hl": "以", "word": "以", "meaning": "因为/同「已」,停止", "analogy": "★《侍坐》", "sentence": "以吾一日长乎尔，毋吾以也"},
  {"front": "居则曰：不吾知也", "hl": "居", "word": "居", "meaning": "平日", "analogy": "★《侍坐》", "sentence": "居则曰：不吾知也"},
  {"front": "且知方也 / 方六七十", "hl": "方", "word": "方", "meaning": "准则/计量土地", "analogy": "★《侍坐》", "sentence": "且知方也 / 方六七十"},
  {"front": "如五六十 / 如其礼乐", "hl": "如", "word": "如", "meaning": "或者/至于", "analogy": "★《侍坐》", "sentence": "如五六十 / 如其礼乐"},
  {"front": "以俟君子", "hl": "俟", "word": "俟(sì)", "meaning": "等待", "analogy": "★《侍坐》", "sentence": "以俟君子"},
  {"front": "异乎三子者之撰", "hl": "撰", "word": "撰(zhuàn)", "meaning": "才能", "analogy": "★《侍坐》", "sentence": "异乎三子者之撰"},
  {"front": "舍瑟而作", "hl": "作", "word": "作", "meaning": "站起来", "analogy": "★《侍坐》", "sentence": "舍瑟而作"},
  {"front": "吾与点也", "hl": "与", "word": "与(yǔ)", "meaning": "赞成", "analogy": "★《侍坐》", "sentence": "吾与点也"},
  {"front": "仲尼之徒无道桓文之事者", "hl": "道", "word": "道", "meaning": "讲述", "analogy": "★《齐桓晋文》", "sentence": "仲尼之徒无道桓文之事者"},
  {"front": "保民而王，莫之能御也", "hl": "保", "word": "保", "meaning": "安民", "analogy": "★《齐桓晋文》", "sentence": "保民而王，莫之能御也"},
  {"front": "牛何之", "hl": "之", "word": "之", "meaning": "往", "analogy": "★《齐桓晋文》", "sentence": "牛何之"},
  {"front": "将以衅钟", "hl": "衅", "word": "衅(xìn)", "meaning": "血祭", "analogy": "★《齐桓晋文》", "sentence": "将以衅钟"},
  {"front": "舍之！吾不忍其觳觫", "hl": "舍", "word": "舍", "meaning": "释放", "analogy": "★《齐桓晋文》", "sentence": "舍之！吾不忍其觳觫"},
  {"front": "若无罪而就死地", "hl": "就", "word": "就", "meaning": "走向", "analogy": "★《齐桓晋文》", "sentence": "若无罪而就死地"},
  {"front": "百姓皆以王为爱也", "hl": "爱", "word": "爱", "meaning": "吝惜", "analogy": "★《齐桓晋文》", "sentence": "百姓皆以王为爱也"},
  {"front": "王无异于百姓之以王为爱也", "hl": "异", "word": "异", "meaning": "奇怪", "analogy": "★《齐桓晋文》", "sentence": "王无异于百姓之以王为爱也"},
  {"front": "彼恶知之", "hl": "恶", "word": "恶(wū)", "meaning": "怎么", "analogy": "★《齐桓晋文》", "sentence": "彼恶知之"},
  {"front": "他人有心，予忖度之", "hl": "度", "word": "度(duó)", "meaning": "揣测/称量", "analogy": "★《齐桓晋文》", "sentence": "他人有心，予忖度之"},
  {"front": "百姓之不见保", "hl": "见", "word": "见", "meaning": "被", "analogy": "★《齐桓晋文》", "sentence": "百姓之不见保"},
  {"front": "刑于寡妻", "hl": "刑", "word": "刑", "meaning": "做榜样", "analogy": "★《齐桓晋文》", "sentence": "刑于寡妻"},
  {"front": "欲辟土地 / 放辟邪侈", "hl": "辟", "word": "辟(pì)", "meaning": "开辟/不正", "analogy": "★《齐桓晋文》", "sentence": "欲辟土地 / 放辟邪侈"},
  {"front": "殆有甚焉", "hl": "殆", "word": "殆(dài)", "meaning": "恐怕", "analogy": "★《齐桓晋文》", "sentence": "殆有甚焉"},
  {"front": "盖亦反其本矣", "hl": "盖", "word": "盖(hé)", "meaning": "何不", "analogy": "★《齐桓晋文》", "sentence": "盖亦反其本矣"},
  {"front": "是罔民也", "hl": "罔", "word": "罔(wǎng)", "meaning": "陷害", "analogy": "★《齐桓晋文》", "sentence": "是罔民也"},
  {"front": "俯足以畜妻子", "hl": "畜", "word": "畜(xù)", "meaning": "养活", "analogy": "★《齐桓晋文》", "sentence": "俯足以畜妻子"},
  {"front": "此惟救死而恐不赡", "hl": "赡", "word": "赡(shàn)", "meaning": "足", "analogy": "★《齐桓晋文》", "sentence": "此惟救死而恐不赡"},
  {"front": "莫不中音", "hl": "中", "word": "中(zhòng)", "meaning": "合乎", "analogy": "★《庖丁解牛》", "sentence": "莫不中音"},
  {"front": "乃中《经首》之会", "hl": "会", "word": "会", "meaning": "节奏", "analogy": "★《庖丁解牛》", "sentence": "乃中《经首》之会"},
  {"front": "进乎技矣", "hl": "进", "word": "进", "meaning": "超过", "analogy": "★《庖丁解牛》", "sentence": "进乎技矣"},
  {"front": "臣以神遇而不以目视", "hl": "遇", "word": "遇", "meaning": "接触", "analogy": "★《庖丁解牛》", "sentence": "臣以神遇而不以目视"},
  {"front": "批大郤", "hl": "批", "word": "批", "meaning": "击入", "analogy": "★《庖丁解牛》", "sentence": "批大郤"},
  {"front": "导大窾", "hl": "导", "word": "导", "meaning": "引导/引刀进入", "analogy": "★《庖丁解牛》", "sentence": "导大窾"},
  {"front": "族庖月更刀 / 每至于族", "hl": "族", "word": "族", "meaning": "众/聚结处", "analogy": "★《庖丁解牛》", "sentence": "族庖月更刀 / 每至于族"},
  {"front": "彼节者有间", "hl": "间", "word": "间(jiàn)", "meaning": "空隙", "analogy": "★《庖丁解牛》", "sentence": "彼节者有间"},
  {"front": "如土委地", "hl": "委", "word": "委", "meaning": "散落", "analogy": "★《庖丁解牛》", "sentence": "如土委地"},
  {"front": "善刀而藏之", "hl": "善", "word": "善", "meaning": "揩拭", "analogy": "★《庖丁解牛》", "sentence": "善刀而藏之"},
  {"front": "晋军函陵", "hl": "军", "word": "军", "meaning": "驻扎", "analogy": "★《烛之武》", "sentence": "晋军函陵"},
  {"front": "且贰于楚也", "hl": "贰", "word": "贰", "meaning": "亲附", "analogy": "★《烛之武》", "sentence": "且贰于楚也"},
  {"front": "辞曰：臣之壮也，犹不如人", "hl": "辞", "word": "辞", "meaning": "推辞", "analogy": "★《烛之武》", "sentence": "辞曰：臣之壮也，犹不如人"},
  {"front": "越国以鄙远", "hl": "鄙", "word": "鄙", "meaning": "边邑", "analogy": "★《烛之武》", "sentence": "越国以鄙远"},
  {"front": "焉用亡郑以陪邻", "hl": "陪", "word": "陪", "meaning": "增加", "analogy": "★《烛之武》", "sentence": "焉用亡郑以陪邻"},
  {"front": "共其乏困", "hl": "共", "word": "共(gōng)", "meaning": "供给", "analogy": "★《烛之武》", "sentence": "共其乏困"},
  {"front": "且君尝为晋君赐矣", "hl": "赐", "word": "赐", "meaning": "恩惠", "analogy": "★《烛之武》", "sentence": "且君尝为晋君赐矣"},
  {"front": "朝济而夕设版焉", "hl": "济", "word": "济", "meaning": "渡河", "analogy": "★《烛之武》", "sentence": "朝济而夕设版焉"},
  {"front": "既东封郑", "hl": "封", "word": "封", "meaning": "疆界", "analogy": "★《烛之武》", "sentence": "既东封郑"},
  {"front": "又欲肆其西封", "hl": "肆", "word": "肆", "meaning": "扩张", "analogy": "★《烛之武》", "sentence": "又欲肆其西封"},
  {"front": "若不阙秦", "hl": "阙", "word": "阙(jué)", "meaning": "侵损", "analogy": "★《烛之武》", "sentence": "若不阙秦"},
  {"front": "微夫人之力不及此", "hl": "微", "word": "微", "meaning": "没有", "analogy": "★《烛之武》", "sentence": "微夫人之力不及此"},
  {"front": "失其所与，不知", "hl": "与", "word": "与", "meaning": "同盟者", "analogy": "★《烛之武》", "sentence": "失其所与，不知"},
  {"front": "沛公欲王关中", "hl": "王", "word": "王(wàng)", "meaning": "称王", "analogy": "★《鸿门宴》", "sentence": "沛公欲王关中"},
  {"front": "妇女无所幸", "hl": "幸", "word": "幸", "meaning": "宠爱", "analogy": "★《鸿门宴》", "sentence": "妇女无所幸"},
  {"front": "素善留侯张良", "hl": "善", "word": "善", "meaning": "交好", "analogy": "★《鸿门宴》", "sentence": "素善留侯张良"},
  {"front": "距关，毋内诸侯", "hl": "距/内", "word": "距内", "meaning": "据守/接纳", "analogy": "★《鸿门宴》", "sentence": "距关，毋内诸侯"},
  {"front": "料大王士卒足以当项王乎", "hl": "当", "word": "当(dāng)", "meaning": "对等", "analogy": "★《鸿门宴》", "sentence": "料大王士卒足以当项王乎"},
  {"front": "项伯杀人，臣活之", "hl": "活", "word": "活", "meaning": "使……活命", "analogy": "★《鸿门宴》", "sentence": "项伯杀人，臣活之"},
  {"front": "张良出，要项伯", "hl": "要", "word": "要(yāo)", "meaning": "邀请", "analogy": "★《鸿门宴》", "sentence": "张良出，要项伯"},
  {"front": "籍吏民，封府库", "hl": "籍", "word": "籍", "meaning": "造册登记", "analogy": "★《鸿门宴》", "sentence": "籍吏民，封府库"},
  {"front": "备他盗之出入与非常也", "hl": "非常", "word": "非常(古)", "meaning": "意外变故", "analogy": "★《鸿门宴》", "sentence": "备他盗之出入与非常也"},
  {"front": "愿伯具言臣之不敢倍德也", "hl": "倍", "word": "倍", "meaning": "背弃", "analogy": "★《鸿门宴》", "sentence": "愿伯具言臣之不敢倍德也"},
  {"front": "旦日不可不蚤自来谢项王", "hl": "谢", "word": "谢", "meaning": "道歉/辞别", "analogy": "★《鸿门宴》", "sentence": "旦日不可不蚤自来谢项王"},
  {"front": "然不自意能先入关破秦", "hl": "意", "word": "意", "meaning": "料想", "analogy": "★《鸿门宴》", "sentence": "然不自意能先入关破秦"},
  {"front": "范增数目项王", "hl": "目", "word": "目", "meaning": "递眼色", "analogy": "★《鸿门宴》", "sentence": "范增数目项王"},
  {"front": "常以身翼蔽沛公", "hl": "翼蔽", "word": "翼蔽(yìbì)", "meaning": "遮护", "analogy": "★《鸿门宴》", "sentence": "常以身翼蔽沛公"},
  {"front": "哙遂入，披帷西向立", "hl": "披", "word": "披", "meaning": "分开", "analogy": "★《鸿门宴》", "sentence": "哙遂入，披帷西向立"},
  {"front": "项王按剑而跽", "hl": "跽", "word": "跽(jì)", "meaning": "挺直身子", "analogy": "★《鸿门宴》", "sentence": "项王按剑而跽"},
  {"front": "刑人如恐不胜 / 不胜杯杓", "hl": "胜", "word": "胜", "meaning": "尽/承受", "analogy": "★《鸿门宴》", "sentence": "刑人如恐不胜 / 不胜杯杓"},
  {"front": "大礼不辞小让", "hl": "让", "word": "让", "meaning": "责备", "analogy": "★《鸿门宴》", "sentence": "大礼不辞小让"},
  {"front": "大王来何操", "hl": "操", "word": "操", "meaning": "拿", "analogy": "★《鸿门宴》", "sentence": "大王来何操"},
  {"front": "道芷阳间行", "hl": "道/间", "word": "道间", "meaning": "取道/秘密地", "analogy": "★《鸿门宴》", "sentence": "道芷阳间行"},
  {"front": "闻大王有意督过之", "hl": "督过", "word": "督过", "meaning": "责备", "analogy": "★《鸿门宴》", "sentence": "闻大王有意督过之"},
  {"front": "并国二十", "hl": "并", "word": "并", "meaning": "兼并", "analogy": "★《谏逐客书》", "sentence": "并国二十"},
  {"front": "举地千里", "hl": "举", "word": "举", "meaning": "攻克", "analogy": "★《谏逐客书》", "sentence": "举地千里"},
  {"front": "拔三川之地", "hl": "拔", "word": "拔", "meaning": "攻取", "analogy": "★《谏逐客书》", "sentence": "拔三川之地"},
  {"front": "向使四君却客而不内", "hl": "内", "word": "内(nà)", "meaning": "接纳", "analogy": "★《谏逐客书》", "sentence": "向使四君却客而不内"},
  {"front": "服太阿之剑", "hl": "服", "word": "服", "meaning": "佩带", "analogy": "★《谏逐客书》", "sentence": "服太阿之剑"},
  {"front": "而陛下说之", "hl": "说", "word": "说(yuè)", "meaning": "喜欢", "analogy": "★《谏逐客书》", "sentence": "而陛下说之"},
  {"front": "今乃弃黔首以资敌国", "hl": "资", "word": "资", "meaning": "资助", "analogy": "★《谏逐客书》", "sentence": "今乃弃黔首以资敌国"},
  {"front": "却宾客以业诸侯", "hl": "业", "word": "业", "meaning": "使成就霸业", "analogy": "★《谏逐客书》", "sentence": "却宾客以业诸侯"},
  {"front": "藉寇兵而赍盗粮", "hl": "赍", "word": "赍(jī)", "meaning": "送给", "analogy": "★《谏逐客书》", "sentence": "藉寇兵而赍盗粮"},
  {"front": "臣闻求木之长者，必固其根本", "hl": "长", "word": "长(zhǎng)", "meaning": "生长", "analogy": "★《谏太宗十思疏》", "sentence": "臣闻求木之长者，必固其根本"},
  {"front": "必浚其泉源", "hl": "浚", "word": "浚(jùn)", "meaning": "疏通", "analogy": "★《谏太宗十思疏》", "sentence": "必浚其泉源"},
  {"front": "人君当神器之重", "hl": "当", "word": "当", "meaning": "掌握", "analogy": "★《谏太宗十思疏》", "sentence": "人君当神器之重"},
  {"front": "永保无疆之休", "hl": "休", "word": "休", "meaning": "喜庆", "analogy": "★《谏太宗十思疏》", "sentence": "永保无疆之休"},
  {"front": "能克终者盖寡", "hl": "克", "word": "克", "meaning": "能够", "analogy": "★《谏太宗十思疏》", "sentence": "能克终者盖寡"},
  {"front": "既得志，则纵情以傲物", "hl": "物", "word": "物", "meaning": "人", "analogy": "★《谏太宗十思疏》", "sentence": "既得志，则纵情以傲物"},
  {"front": "虽董之以严刑", "hl": "董", "word": "董(dǒng)", "meaning": "督察", "analogy": "★《谏太宗十思疏》", "sentence": "虽董之以严刑"},
  {"front": "振之以威怒", "hl": "振", "word": "振", "meaning": "威吓", "analogy": "★《谏太宗十思疏》", "sentence": "振之以威怒"},
  {"front": "简能而任之", "hl": "简", "word": "简", "meaning": "选拔", "analogy": "★《谏太宗十思疏》", "sentence": "简能而任之"},
  {"front": "所操之术多异故也", "hl": "操", "word": "操", "meaning": "持", "analogy": "★《答司马谏议书》", "sentence": "所操之术多异故也"},
  {"front": "终必不蒙见察", "hl": "察", "word": "察", "meaning": "理解", "analogy": "★《答司马谏议书》", "sentence": "终必不蒙见察"},
  {"front": "故略上报", "hl": "报", "word": "报", "meaning": "回信", "analogy": "★《答司马谏议书》", "sentence": "故略上报"},
  {"front": "不复一一自辩", "hl": "辩", "word": "辩", "meaning": "分辩", "analogy": "★《答司马谏议书》", "sentence": "不复一一自辩"},
  {"front": "故今具道所以", "hl": "具", "word": "具", "meaning": "详细", "analogy": "★《答司马谏议书》", "sentence": "故今具道所以"},
  {"front": "难壬人", "hl": "难", "word": "难(nàn)", "meaning": "排斥", "analogy": "★《答司马谏议书》", "sentence": "难壬人"},
  {"front": "盘庚不为怨者故改其度", "hl": "度", "word": "度(dù)", "meaning": "计划", "analogy": "★《答司马谏议书》", "sentence": "盘庚不为怨者故改其度"},
  {"front": "度义而后动", "hl": "度", "word": "度(duó)", "meaning": "考虑", "analogy": "★《答司马谏议书》", "sentence": "度义而后动"},
  {"front": "以膏泽斯民", "hl": "膏泽", "word": "膏泽(gāozé)", "meaning": "施恩惠", "analogy": "★《答司马谏议书》", "sentence": "以膏泽斯民"},
  {"front": "六王毕，四海一", "hl": "一", "word": "一", "meaning": "统一", "analogy": "★《阿房宫赋》", "sentence": "六王毕，四海一"},
  {"front": "蜀山兀，阿房出", "hl": "兀", "word": "兀(wù)", "meaning": "光秃", "analogy": "★《阿房宫赋》", "sentence": "蜀山兀，阿房出"},
  {"front": "直走咸阳", "hl": "走", "word": "走", "meaning": "通达", "analogy": "★《阿房宫赋》", "sentence": "直走咸阳"},
  {"front": "矗不知其几千万落", "hl": "矗", "word": "矗(chù)", "meaning": "矗立", "analogy": "★《阿房宫赋》", "sentence": "矗不知其几千万落"},
  {"front": "而望幸焉", "hl": "幸", "word": "幸", "meaning": "帝王到某处", "analogy": "★《阿房宫赋》", "sentence": "而望幸焉"},
  {"front": "剽掠其人", "hl": "剽", "word": "剽(piāo)", "meaning": "抢劫", "analogy": "★《阿房宫赋》", "sentence": "剽掠其人"},
  {"front": "函谷举", "hl": "举", "word": "举", "meaning": "攻占", "analogy": "★《阿房宫赋》", "sentence": "函谷举"},
  {"front": "族秦者秦也", "hl": "族", "word": "族", "meaning": "灭族", "analogy": "★《阿房宫赋》", "sentence": "族秦者秦也"},
  {"front": "则递三世可至万世而为君", "hl": "递", "word": "递", "meaning": "依次", "analogy": "★《阿房宫赋》", "sentence": "则递三世可至万世而为君"},
  {"front": "弊在赂秦", "hl": "弊", "word": "弊", "meaning": "弊端", "analogy": "★《六国论》", "sentence": "弊在赂秦"},
  {"front": "不能独完", "hl": "完", "word": "完", "meaning": "保全", "analogy": "★《六国论》", "sentence": "不能独完"},
  {"front": "故不战而强弱胜负已判矣", "hl": "判", "word": "判", "meaning": "确定", "analogy": "★《六国论》", "sentence": "故不战而强弱胜负已判矣"},
  {"front": "与嬴而不助五国也", "hl": "与", "word": "与", "meaning": "亲附", "analogy": "★《六国论》", "sentence": "与嬴而不助五国也"},
  {"front": "始速祸焉", "hl": "速", "word": "速", "meaning": "招致", "analogy": "★《六国论》", "sentence": "始速祸焉"},
  {"front": "李牧连却之", "hl": "却", "word": "却", "meaning": "打退", "analogy": "★《六国论》", "sentence": "李牧连却之"},
  {"front": "洎牧以谗诛", "hl": "洎", "word": "洎(jì)", "meaning": "等到", "analogy": "★《六国论》", "sentence": "洎牧以谗诛"},
  {"front": "为秦人积威之所劫", "hl": "劫", "word": "劫", "meaning": "胁迫", "analogy": "★《六国论》", "sentence": "为秦人积威之所劫"},
  {"front": "下而从六国破亡之故事", "hl": "故事", "word": "故事(古)", "meaning": "旧事", "analogy": "★《六国论》", "sentence": "下而从六国破亡之故事"},
];
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
    dbLocal.run("CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, label TEXT NOT NULL, icon TEXT DEFAULT '', sort_order INTEGER DEFAULT 0)");
    dbLocal.run("CREATE TABLE IF NOT EXISTS streak (id INTEGER PRIMARY KEY CHECK(id=1), count INTEGER DEFAULT 0, last_active TEXT)");
    dbLocal.run("INSERT OR IGNORE INTO streak VALUES (1,0,'')");
    dbLocal.run("CREATE TABLE IF NOT EXISTS flashcard_log (id INTEGER PRIMARY KEY AUTOINCREMENT, deck TEXT, card_word TEXT, rating TEXT, reviewed_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS template_log (id INTEGER PRIMARY KEY AUTOINCREMENT, combo_a TEXT, combo_b TEXT, combo_c TEXT, topic TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS grammar_log (id INTEGER PRIMARY KEY AUTOINCREMENT, sentence TEXT, example_idx INTEGER, module TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS card_srs (deck TEXT, card_idx INTEGER, interval_days INTEGER DEFAULT 0, repetitions INTEGER DEFAULT 0, next_review TEXT, mastered INTEGER DEFAULT 0, PRIMARY KEY(deck, card_idx))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS assessments (item TEXT, week INTEGER, score INTEGER DEFAULT 0, updated_at TEXT DEFAULT (datetime('now','localtime')), PRIMARY KEY(item, week))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS training_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, module TEXT, duration_min INTEGER, created_at TEXT DEFAULT (datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS daily_tasks (date TEXT, task TEXT, PRIMARY KEY(date, task))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS wrong_items (id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id INTEGER, module TEXT, question_type TEXT DEFAULT '', question TEXT, user_answer TEXT, correct_answer TEXT, explanation TEXT DEFAULT '', wrong_count INTEGER DEFAULT 1, wrong_at TEXT DEFAULT (datetime('now','localtime')), reviewed INTEGER DEFAULT 0)");
    dbLocal.run("CREATE TABLE IF NOT EXISTS training_log (id INTEGER PRIMARY KEY AUTOINCREMENT, module TEXT, exercise_id INTEGER DEFAULT 0, question TEXT, user_answer TEXT, correct_answer TEXT, is_correct INTEGER DEFAULT 0, score INTEGER DEFAULT 0, correction_note TEXT DEFAULT '', reviewed INTEGER DEFAULT 0, attempt_count INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now','localtime')))");
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
    window.apiAvailable = apiAvailable;
    if (apiAvailable) console.log('✅ API connected:', API_BASE);
  } catch(e) {
    apiAvailable = false;
    window.apiAvailable = false;
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
];const DECKS = {shici:DECK_SHIPIN, xuci:DECK_XUCI, wenxue:DECK_WENXUE, gzshici:DECK_GZSHICI};const PLAN_WEEKS = {
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
    ["晨文学常识10条","午重读W1文章对比标记","晚语言运用"],
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
];
// 断句题库 — 从后端数据库动态加载
var DUANJU_EXAMPLES = [];
async function loadDuanjuFromDB() {
  if (DUANJU_EXAMPLES.length > 0) return DUANJU_EXAMPLES;
  try {
    var data = await fetchExercises('classical_reading', 'duanju');
    if (data && data.items && data.items.length) {
      DUANJU_EXAMPLES = data.items.map(function(item, i) {
        var opts = [];
        try { opts = JSON.parse(item.options_json); } catch(e) {}
        var answerIdx = (item.answer || 'A').charCodeAt(0) - 65;
        if (answerIdx < 0 || answerIdx > 3) answerIdx = 0;
        var src = '';
        try { var ext = JSON.parse(item.extra_json); src = ext.source || ''; } catch(e) {}
        return {
          sentence: item.content || '',
          options: opts,
          answer: answerIdx,
          analysis: (item.explanation || '') + (src ? '\n📚 出处：' + src : '')
        };
      });
      window.DUANJU_EXAMPLES = DUANJU_EXAMPLES;  // sync after map completes
    }
  } catch(e) { console.warn('断句数据加载失败', e); }
  return DUANJU_EXAMPLES;
}
;

const TRANSLATION_EXAMPLES = [
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
  params.set('limit', '2000');
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

// Export to global (apiAvailable synced in checkApi)
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
window.loadDuanjuFromDB = loadDuanjuFromDB;
window.DUANJU_EXAMPLES = DUANJU_EXAMPLES;
window.DECKS = DECKS;
window.DECK_XUCI = DECK_XUCI;
window.PLAN_WEEKS = PLAN_WEEKS;
window.SYNTAX_EXAMPLES = SYNTAX_EXAMPLES;
window.TRANSLATION_EXAMPLES = TRANSLATION_EXAMPLES;
})();
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
// ================================================================
//  Mac / iPad 键盘快捷键（空格翻卡，数字键评分）
// ================================================================
document.addEventListener('keydown', function(e) {
  if (typeof S === 'undefined' || !S.currentPage || S.currentPage !== 'classical') return;
  if (typeof deckQueue === 'undefined' || deckQueue.length === 0) return;
  var tag = document.activeElement ? document.activeElement.tagName : '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      flipCard();
      break;
    case 'Digit1': case 'Numpad1':
      if (S.flipped) rateCard('again');
      break;
    case 'Digit2': case 'Numpad2':
      if (S.flipped) rateCard('hard');
      break;
    case 'Digit3': case 'Numpad3':
      if (S.flipped) rateCard('easy');
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (!S.flipped) flipCard();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (S.flipped) rateCard('again');
      break;
  }
});
// exercises.js — 训练练习模块
// Depends on: config.js, utils.js, data.js, api.js
// Provides: reading, daily, templates, grammar, syntax, rhetoric, translation, novel analysis

(function(){
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
    html += '<p style="font-size:15px;margin-bottom:8px;"><strong>材料：</strong>' + htmlesc(ex.content) + '</p>';
    if (ex.question) html += '<p><strong>' + htmlesc(ex.question) + '</strong></p>';
    if (ex.options_json && ex.options_json !== '[]') {
      try {
        JSON.parse(ex.options_json).forEach(function(o, i) {
          html += '<div class="ex-option"><input type="radio" name="dailyQ" value="' + i + '" onchange="checkDailyAnswer(\'grammar\',' + i + ',\'' + ex.answer + '\')"> ' + htmlesc(o) + '</label>';
        });
      } catch(e) {}
    } else {
      html += '<input class="gram-input" id="dailyInput" placeholder="输入你的答案…"><button class="btn-primary" onclick="checkDailyText(\'grammar\')">提交</button>';
    }
    html += '<div class="ex-answer" id="dailyQ-result" style="display:none;margin-top:8px;"></div>';
    if (ex.explanation) {
      html += '<div id="dailyQ-explanation" style="display:none;margin-top:8px;background:#faf8f5;padding:10px;border-radius:6px;font-size:13px;">' + htmlesc(ex.explanation).replace(/\n/g,'<br>') + '</div>';
    }
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
  apiCall('POST', '/api/training/session', {date: today, module: '语言文字运用', duration_min: 5});
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
  apiCall('POST', '/api/training/session', {date: today, module: '语言文字运用', duration_min: 5});
  dbRun("INSERT INTO grammar_log (sentence, example_idx, module) VALUES (?, -1, 'language')", [input]);
  grammarCount = getGrammarCount();
  checkStreak(); updateHomeStats();
}
function loadSyntaxExample(idx) {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('syntaxInput').value = SYNTAX_EXAMPLES[idx].sentence;
  document.getElementById('syntaxResult').innerHTML = `<div class="gram-step"><h4>🧩 拆解结果</h4><pre class="analysis">${SYNTAX_EXAMPLES[idx].analysis}</pre></div>`;
  apiCall('POST', '/api/grammar/log', {sentence: SYNTAX_EXAMPLES[idx].sentence, example_idx: idx, module: '古诗文'});
  apiCall('POST', '/api/training/session', {date: today, module: '语言文字运用', duration_min: 5});
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
  apiCall('POST', '/api/training/session', {date: today, module: '语言文字运用', duration_min: 5});
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
  {id:'classical_reading', icon:'🏛️', title:'古诗文阅读', desc:'断句·文化常识·默写·翻译·内容概括', count:10, time:'20分钟'},
  {id:'modern_reading', icon:'📖', title:'现代文阅读', desc:'论述类文本', count:3, time:'10分钟'},
  {id:'grammar', icon:'✍️', title:'语言文字运用', desc:'语用辨析', count:5, time:'8分钟'},
  {id:'writing', icon:'📝', title:'写作训练', desc:'审题立意·结构搭建', count:1, time:'5分钟'}
];

function updateGreeting() {
  var now = new Date();
  var weekdays = ['日','一','二','三','四','五','六'];
  var wd = '星期' + weekdays[now.getDay()];
  var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
  var timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  var hour = now.getHours();
  var msgs = [
    '🌅 一日之计在于晨，开始今天的训练吧！',
    '☀️ 上午好！保持专注，每天进步一点点。',
    '🌤 下午好！坚持就是胜利。',
    '🌙 晚上好！利用碎片时间，查漏补缺。'
  ];
  var msg = msgs[0];
  if (hour >= 6 && hour < 11) msg = msgs[0];
  else if (hour >= 11 && hour < 13) msg = msgs[1];
  else if (hour >= 13 && hour < 18) msg = msgs[2];
  else msg = msgs[3];

  var elD = document.getElementById('greetingDate');
  var elT = document.getElementById('greetingTime');
  var elM = document.getElementById('greetingMsg');
  if (elD) elD.textContent = dateStr + ' ' + wd;
  if (elT) elT.textContent = '🕐 ' + timeStr;
  if (elM) elM.textContent = msg;
}

function renderTrainingModules() {
  updateGreeting();
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
  var wrap = document.getElementById('trainingStartWrap');
  var start = document.getElementById('trainingStart');
  if (wrap && start) {
    start.style.display = 'none';
    // 隐藏模块选择区，收缩 wrapper 以免撑开巨大间隙
    wrap.style.display = 'none';
  }
  document.getElementById('trainingProgress').style.display = 'block';
  document.getElementById('trainingQuiz').style.display = 'block';
  document.getElementById('trainingResult').style.display = 'none';
  
  var url = '/api/daily/session';
  if (moduleName) {
    url += '?module=' + encodeURIComponent(moduleName);
  }
  // 模块名称显示在进度条内，不动 header
  var modLabel = '';
  TRAINING_MODULES.forEach(function(m) { if (m.id === moduleName) modLabel = m.icon + ' ' + m.title; });
  var labelEl = document.getElementById('trainingModLabel');
  if (labelEl) labelEl.textContent = modLabel || '📅 综合训练';
  
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
  var typeNames = {discourse:"论述类",literary:"文学类",practical:"实用类",duanju:'断句', wenhua:'文化常识', moxie:'默写', translation:'翻译', neirong:'内容概括', bingju:'病句辨析', chengyu:'成语辨析', biaodian:'标点符号', buxie:'补写句子', yasuo:'语段压缩', essay:'写作审题', scaffold:'写作脚手架', semi_open:'半开放写作'};
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
  } else if (item.type === 'discourse' || item.type === 'literary' || item.type === 'practical' || item.type === 'chengyu' || item.type === 'biaodian' || item.type === 'buxie' || item.type === 'yasuo') {
    // 现代文/语言运用：显示原文 + 题目
    var raw = item.content || '';
    var isGrammar = item.module === 'grammar';
    if (raw) {
      html += '<div style="background:#fafafa;padding:14px 18px;border-radius:6px;margin-bottom:10px;font-size:14px;line-height:2;border-left:3px solid var(--primary);' + (isGrammar ? '' : 'max-height:300px;overflow-y:auto;') + '">' + htmlesc(raw) + '</div>';
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
    var raw = item.content || '';
    if (raw) {
      html += '<div style="background:#fafafa;padding:14px 18px;border-radius:6px;margin-bottom:10px;font-size:14px;line-height:2;border-left:3px solid var(--primary);">' + htmlesc(raw).replace(/\n/g,'<br>') + '</div>';
    }
    if (item.question) {
      html += '<div style="background:#f0f4ff;padding:10px 14px;border-radius:6px;margin-bottom:10px;border-left:3px solid #1a73e8;">';
      html += '<p style="font-size:14px;font-weight:600;margin:0;">📝 ' + htmlesc(item.question) + '</p>';
      html += '</div>';
    }
    if (item.explanation) {
      html += '<details style="margin-bottom:10px;font-size:12px;"><summary style="cursor:pointer;color:var(--accent);">💡 查看写作指导（立意+高分元素）</summary>';
      html += '<div style="background:#fafafa;padding:10px;border-radius:6px;margin-top:6px;line-height:1.8;">' + htmlesc(item.explanation).replace(/\n/g,'<br>') + '</div>';
      html += '</details>';
    }
    html += '<textarea id="train-input-' + idx + '" class="gram-input" rows="12" style="font-size:14px;width:100%;" placeholder="在此写作（不少于800字）…"></textarea>';
    html += '<button class="btn-small" onclick="checkTrainingAnswer(' + idx + ',-1)" style="margin-top:8px;font-size:13px;">✅ 提交（提交后视作完成）</button>';
  } else if (item.type === 'neirong') {
    // 内容概括：显示原文 + 问题
    var raw = item.content || '';
    if (raw) {
      html += '<div style="background:#f0f4f0;padding:14px 18px;border-radius:6px;margin-bottom:10px;font-size:14px;line-height:2;font-family:serif;border-left:3px solid #27ae60;max-height:260px;overflow-y:auto;">' + htmlesc(raw) + '</div>';
    }
    html += '<p style="font-size:14px;line-height:1.7;margin-bottom:12px;">' + htmlesc(item.question || '下列对文章内容的概括和分析，不正确的一项是') + '</p>';
  } else if (item.type === 'wenhua') {
    // 文化常识：显示问题（通常没有长文content）
    var raw = item.content || '';
    if (raw) {
      html += '<div style="background:#fff8e1;padding:10px 14px;border-radius:6px;margin-bottom:8px;font-size:14px;line-height:1.8;border-left:3px solid #f1c40f;">' + htmlesc(raw) + '</div>';
    }
    html += '<p style="font-size:14px;line-height:1.7;margin-bottom:12px;">' + htmlesc(item.question || '') + '</p>';
  } else {
    // 其他类型：显示题目
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
      try { renderTrainingQuestion(idx + 1); } catch(e) { console.error('advance', e); }
    }
  }, 1500);
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
  var wrap = document.getElementById('trainingStartWrap');
  if (wrap) wrap.style.display = '';
  document.getElementById('trainingStart').style.display = 'block';
  document.getElementById('trainingProgress').style.display = 'none';
  document.getElementById('trainingQuiz').style.display = 'none';
  document.getElementById('trainingResult').style.display = 'none';
  document.getElementById('trainingDate').textContent = '';
  document.getElementById('trainingModLabel').textContent = '';
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
})();
var htmlesc = App.htmlesc;
var sanitizeHTML = App.sanitizeHTML;

// ================================================================
//  app.js — 语文提高训练 · 核心逻辑
//  Section: ① Core → ② State → ③ Daily → ④ Pages → ⑤ Data
// ================================================================

(function(){
// ================================================================
//  ① CORE: 全局事件委托 + 导航 + 侧边栏 + 计时器
// ================================================================
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
  if (S.lastActive !== today && S.lastActive !== '') {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    S.streak = S.lastActive === yesterday ? S.streak + 1 : 0;
  } else if (S.lastActive === '') { S.streak = 1; }
  S.lastActive = today;
  syncStreak(S.streak, today);
  document.getElementById('streakBadge').textContent = `🔥 ${S.streak}天`;
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
  S.currentPage = page;
  document.getElementById('sidebar').classList.remove('open');
  // 切换页面时重置滚动位置，防止内容被"遮挡"
  var mc = document.getElementById('mainContent');
  if (mc) mc.scrollTop = 0;
  if (page === 'calendar') { renderCalendar(); }
  if (page === 'records') { renderRecords(); }
  if (page === 'classical' && deckQueue && deckQueue.length > 0) { showCard(); }
  if (page === 'method') { renderMethodPage(); }
  if (page === 'wrong') { renderWrongPage(); }
  if (page === 'training') { checkTrainingStatus(); }
  if (page === 'methods') { renderMethodStats(); renderTrainingSessions(); }
  if (page === 'reference') { renderReferenceBooks(); }
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

var S = App.state;  // shared state object (minification-safe)

// ================================================================
//  ② STATE: 全局状态变量 (通过 App.state + getter/setter 共享)
// ================================================================






S.currentPage = 'overview'; S.currentDeck = 'shici'; S.deckIndex = 0; S.deckQueue = []; S.flipped = false;
S.cardTimer = null; S.cardSeconds = 20;
S.streak = 0; S.lastActive = ''; S.templateCount = 0; S.grammarCount = 0;
S.timerSeconds = 25 * 60; S.timerRunning = false; S.timerInterval = null;

// ================================================================
//  ③ DAILY: 每日任务清单 + 进度条 + 庆祝页
// ================================================================
const DAILY_TASKS = ['flashcard', 'modern_reading', 'classical_reading'];
S.completedTasks = {};
async function loadCompletedTasks() {
  const today = new Date().toISOString().slice(0, 10);
  S.completedTasks = {};
  // Try server first
  if (apiAvailable) {
    try {
      const r = await fetch(API_BASE + '/api/query', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({sql: "SELECT task FROM daily_tasks WHERE date = ?", params: [today]})
      });
      const data = await r.json();
      if (data && data.rows) { data.rows.forEach(r => { S.completedTasks[r[0]] = true; }); }
    } catch(e) {}
  }
  // Local fallback
  const rows = dbGet("SELECT task FROM daily_tasks WHERE date = ?", [today]);
  rows.forEach(r => { S.completedTasks[r[0]] = true; });
  renderDailyChecklist();
}
function markTaskDone(task) {
  const today = new Date().toISOString().slice(0, 10);
  dbRun("INSERT OR IGNORE INTO daily_tasks (date, task) VALUES (?, ?)", [today, task]);
  apiCall('POST', '/api/training/session', {date: today, module: task, duration_min: 5});
  S.completedTasks[task] = true;
  renderDailyChecklist();
}
function saveQuota(el) {
  var v = parseInt(el.value) || 1;
  el.value = Math.max(parseInt(el.min)||1, Math.min(parseInt(el.max)||99, v));
  var key = el.id.replace('quota-','');
  try { localStorage.setItem('quota_'+key, el.value); } catch(e) {}
  updateTaskCounts();
}
var _taskCounts = null;
async function fetchTaskCounts() {
  if (_taskCounts) return _taskCounts;
  try {
    var r = await fetch(API_BASE + '/api/exercises/counts');
    var data = await r.json();
    _taskCounts = data.counts || {};
  } catch(e) { _taskCounts = {}; }
  return _taskCounts;
}
async function updateTaskCounts() {
  var counts = await fetchTaskCounts();
  var modMap = {
    flashcard: 'flashcard', modern_reading: 'modern_reading',
    classical_reading: 'classical_reading'
  };
  // Map frontend task IDs to backend module names
  var taskTotals = {
    flashcard: (counts.flashcard||0),
    modern_reading: (counts.modern_reading||0),
    classical_reading: (counts.classical_reading||0)
  };
  for (var t in taskTotals) {
    var el = document.getElementById('taskCnt-'+t);
    var inp = document.getElementById('quota-'+t);
    var d = inp ? parseInt(inp.value)||1 : (App.DAILY_COUNTS[t]||1);
    if (el) { el.textContent = ' · ' + d + '/' + taskTotals[t] + '题'; }
  }
}
function renderDailyChecklist() {
  const done = Object.keys(S.completedTasks).length;
  const total = DAILY_TASKS.length;
  const pct = Math.round(done / total * 100);
  document.getElementById('progressLabel').textContent = `已完成 ${done} / ${total} 项`;
  document.getElementById('progressFill').style.width = pct + '%';
  DAILY_TASKS.forEach(task => {
    const el = document.querySelector(`.daily-task[data-task="${task}"]`);
    if (el) el.classList.toggle('done', !!S.completedTasks[task]);
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
    document.getElementById('celebCards').textContent = DECKS[S.currentDeck].length;
    document.getElementById('celebTemplates').textContent = getTemplateCount();
    document.getElementById('celebGrammar').textContent = getGrammarCount();
    document.getElementById('celebDay').textContent = S.streak;
    document.getElementById('celebMeta').textContent = '完成于 ' + dateStr + ' ' + timeStr + ' · 训练用时 ' + totalMin + ' 分钟';
  }
}
function startTask(page) {
  // Map legacy names to training
  var trainingPage = 'training';
  if (page === 'reading') { page = 'modern_reading'; }
  if (page === 'classical') { page = 'classical_reading'; }
  // All daily tasks go to unified training
  navigate('training');
  if (document.getElementById('trainingStart').style.display !== 'none') {
    startDailyTraining();
  }
  // Route all daily tasks to the unified daily training flow
  navigate('training');
  // Auto-launch training if not yet started
  setTimeout(function() {
    var startBtn = document.getElementById('trainingStart');
    if (startBtn && startBtn.style.display !== 'none') {
      if (typeof startDailyTraining === 'function') startDailyTraining();
    }
  }, 600);
}

document.addEventListener('DOMContentLoaded', async () => {
  await checkApi();
  var st = await getStreak();
  S.streak = st.count;
  S.lastActive = st.lastActive;
  await loadCompletedTasks();
  checkStreak();
  renderSymbols();
  updateTaskCounts();
  renderReadingTabs();
  renderBooks();
  renderPlan();
  renderSelfAssessment();
  renderTemplates();
  await initDeck('shici');
  updateHomeStats();
  // Restore saved daily quotas
  ['flashcard','reading','classical','language','writing'].forEach(function(t) {
    var v = localStorage.getItem('quota_'+t);
    if (v) { var el = document.getElementById('quota-'+t); if (el) el.value = v; }
  });
});

// ================================================================
//  ④ PAGES: 各页面渲染函数 (书籍/计划/评估/选项卡/统计)
// ================================================================
function renderBooks() {
  var l = document.getElementById('bookList');
  if (!l) return;
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
  ['每天坚持闪卡？', '阅读主动标记？', '作文用上模板？', '语言运用越来越快？'].forEach((item) => {
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
  var cardCount = dbGet("SELECT COUNT(*) FROM flashcard_log WHERE deck=? AND date(reviewed_at)=?", [S.currentDeck, todayStr]);
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
      {id:3,sort_order:3,icon:'🧩',title:'语言成分解构图',source:'结构主义语言学',description:'三步法:提主干→配逻辑→画结构',target_page:'语言文字运用页',extra_json:'{}'},
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
  var MOD_LABEL = { modern_reading: '现代文', classical_reading: '古诗文', grammar: '语言文字运用', writing: '写作' };

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
          icon: '✍️', label: '语言运用 · ' + (g.sentence||'').substring(0,30),
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
      allLocal.push({ date: (r[0]||'').slice(0,10), icon: '✍️', label: '语言运用·'+(r[1]||'').substring(0,25), result: '📝' });
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
  S.timerSeconds = mins * 60;
  resetTimer(true);
}
function formatTime(s) { const m = Math.floor(s / 60), sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }
function startTimer() {
  if (S.timerRunning) {
    clearInterval(S.timerInterval); S.timerRunning = false;
    document.getElementById('timerStartBtn').textContent = '▶ 开始';
    document.getElementById('timerStartBtn').classList.replace('pause', 'start');
    document.getElementById('timerDisplay').classList.remove('running');
  } else {
    S.timerRunning = true;
    document.getElementById('timerStartBtn').textContent = '⏸ 暂停';
    document.getElementById('timerStartBtn').classList.replace('start', 'pause');
    document.getElementById('timerDisplay').classList.add('running');
    document.getElementById('timerResetBtn').style.display = 'block';
    S.timerInterval = setInterval(() => {
      S.timerSeconds--;
      document.getElementById('timerDisplay').textContent = formatTime(S.timerSeconds);
      if (S.timerSeconds <= 0) {
        clearInterval(S.timerInterval); S.timerRunning = false;
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
  clearInterval(S.timerInterval); S.timerRunning = false;
  if (!keepMins) { const activeBtn = document.querySelector('.timer-presets button.active'); S.timerSeconds = (parseInt(activeBtn?.textContent) || 15) * 60; }
  document.getElementById('timerDisplay').textContent = formatTime(S.timerSeconds);
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
    // Also persist to DB exercises table
    for (const card of newCards) {
      const extra = JSON.stringify({hl: card.hl, word: card.word, meaning: card.meaning, analogy: card.analogy});
      apiCall('POST', '/api/exercises', {
        module: 'flashcard', type: deck, title: '', content: card.front,
        options_json: '[]', answer: '', explanation: '', extra_json: extra
      });
    }
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
  // 语言运用题库 — CSV 列: question_type, sentence, options_json, answer, explanation, points
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
  // 方法库导入 — CSV 列: sort_order, icon, title, source, description, target_module, target_page, extra_json
  } else if (deck === 'methods') {
    for (const row of importData) {
      if (row.length < 3) continue;
      const r = await apiCall('POST', '/api/methods', {
        sort_order: parseInt(row[0])||99, icon: row[1]||'', title: row[2]||'',
        source: row[3]||'', description: row[4]||'',
        target_module: row[5]||'', target_page: row[6]||'', extra_json: row[7]||'{}'
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
window.exportData = exportData;

window.saveQuota = saveQuota;

// ====== 数据导出 ======
function exportData(dataset) {
  var url = API_BASE + '/api/export/' + dataset + '?token=' + AUTH_TOKEN;
  var a = document.createElement('a');
  a.href = url;
  a.download = dataset + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ================================================================
//  ⑤ DATA: 答题记录 + 错题本 + 训练记录 + 数据维护
// ================================================================
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

  // Load analysis
  var analysisHtml = '';
  apiCall('GET', '/api/wrong/analysis').then(function(a) {
    if (a) {
      analysisHtml = '<div class="card" style="background:linear-gradient(135deg,#fef9e7,#fdf2f2);padding:16px;">';
      analysisHtml += '<h3 style="margin-bottom:10px;">📊 错题分析</h3>';
      analysisHtml += '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px;">';
      analysisHtml += '<div><span style="font-size:24px;font-weight:700;color:#e74c3c;">' + (a.total||0) + '</span><span style="font-size:11px;color:var(--text-light);"> 总错题</span></div>';
      analysisHtml += '<div><span style="font-size:24px;font-weight:700;color:#f39c12;">' + (a.unreviewed||0) + '</span><span style="font-size:11px;color:var(--text-light);"> 待复习</span></div>';
      analysisHtml += '<div><span style="font-size:24px;font-weight:700;color:var(--primary);">' + (a.today||0) + '</span><span style="font-size:11px;color:var(--text-light);"> 今日新增</span></div>';
      analysisHtml += '</div>';
      // By method
      if (a.by_method && a.by_method.length) {
        analysisHtml += '<div style="margin-top:8px;"><strong style="font-size:12px;">薄弱方法：</strong>';
        a.by_method.slice(0,5).forEach(function(m) {
          analysisHtml += '<span style="display:inline-block;background:#fde8e8;color:#c0392b;font-size:11px;padding:2px 8px;border-radius:8px;margin:2px 4px;">' + htmlesc(m.method) + ' ×' + m.count + '</span>';
        });
        analysisHtml += '</div>';
      }
      analysisHtml += '</div>';
      document.getElementById('wrongAnalysis').innerHTML = analysisHtml;
    }
  });

  var html = '<div id="wrongAnalysis"></div>';
  html += '<div class="card"><h3>📋 错题列表 (' + items.length + '题)</h3></div>';
  items.forEach(function(item, i) {
    html += '<div class="card" id="wrong-' + item.id + '" style="margin-top:8px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:start;">';
    html += '<div style="flex:1;"><p style="font-size:13px;color:var(--text-light);margin-bottom:4px;">#' + (i+1) + ' · 错' + (item.wrong_count||1) + '次</p>';
    html += '<p style="font-size:14px;margin-bottom:6px;"><strong>' + htmlesc(item.question) + '</strong></p>';
    html += '<p style="font-size:12px;margin-bottom:2px;"><span style="color:#e74c3c;">❌ 你的答案：' + htmlesc(item.user_answer||'') + '</span></p>';
    html += '<p style="font-size:12px;color:#27ae60;">✅ 正确答案：' + htmlesc(item.correct_answer||'') + '</p>';
    if (item.explanation) html += '<p style="font-size:11px;color:var(--text-light);margin-top:4px;">💡 ' + htmlesc(item.explanation) + '</p>';
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
// Export shared state via getter/setter (minification-safe, no eval)
var _stateVars = ['currentPage','currentDeck','deckIndex','deckQueue','flipped','cardTimer','cardSeconds','streak','lastActive','templateCount','grammarCount','timerSeconds','timerRunning','timerInterval','completedTasks'];

// ================================================================
// ================================================================
// ================================================================
//  REFERENCE BOOKS — 参考书模块
// ================================================================
var refState = { bookId: null, page: 1, size: 300, totalPages: 1 };

async function renderReferenceBooks() {
  var el = document.getElementById('refBookList');
  if (!el) { console.error('refBookList not found'); return; }
  var reader = document.getElementById('refReader');
  if (reader) reader.style.display = 'none';
  el.style.display = '';
  refState.bookId = null;

  try {
    var resp = await fetch('/api/books');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var data = await resp.json();
    var books = data.books || [];
    var html = '';
    for (var i = 0; i < books.length; i++) {
      var b = books[i];
      var availAttr = b.exists ? '' : ' style="opacity:0.4"';
      var badgeHtml = b.exists ? '<span class="tag" style="background:var(--primary);color:#fff">可读</span>'
                               : '<span class="tag" style="background:var(--text-light)">缺失</span>';
      var linesInfo = b.lines ? b.lines.toLocaleString() + ' 行' : (b.format === 'pdf' ? 'PDF' : '');
      html += '<div class="book-row"' + availAttr + ' data-book-id="' + b.id + '" style="cursor:pointer;border-bottom:1px solid var(--border);padding:14px 16px;display:flex;align-items:center;gap:14px;transition:background .2s">'
        + '<div style="font-size:32px">' + b.icon + '</div>'
        + '<div style="flex:1;min-width:0">'
        + '<h4 style="margin:0 0 4px 0">' + b.title + '</h4>'
        + '<div style="font-size:12px;color:var(--text-light)">' + b.author + '</div>'
        + '<div style="font-size:12px;color:var(--text-light);margin-top:2px">' + b.desc + '</div>'
        + '<div style="font-size:11px;color:var(--text-light)">' + linesInfo + '</div>'
        + '</div>'
        + badgeHtml
        + '</div>';
    }
    el.innerHTML = html;
    // Event delegation via addEventListener (only once)
    if (!el._refClickBound) {
      el.addEventListener('click', function(e) {
        var row = e.target.closest('.book-row');
        if (row) {
          var bookId = row.getAttribute('data-book-id');
          if (bookId) {
            // book opened
            openBookReader(bookId);
          }
        }
      });
      el._refClickBound = true;
    }
  } catch (e) {
    console.error('renderReferenceBooks error:', e);
    el.innerHTML = '<div style="padding:20px;color:red">加载失败: ' + e.message + '</div>';
  }
}
window.renderReferenceBooks = renderReferenceBooks;

async function openBookReader(bookId) {
  // book reader opened
  refState.bookId = bookId;
  refState.page = 1;
  var listEl = document.getElementById('refBookList');
  var readerEl = document.getElementById('refReader');
  if (listEl) listEl.style.display = 'none';
  if (readerEl) readerEl.style.display = '';

  var titleEl = document.getElementById('refReaderTitle');
  var contentEl = document.getElementById('refReaderContent');
  var pdfFrame = document.getElementById('refPdfFrame');
  if (titleEl) titleEl.textContent = '加载中…';

  // Reset visibility defaults
  if (contentEl) contentEl.style.display = '';
  if (pdfFrame) { pdfFrame.style.display = 'none'; pdfFrame.removeAttribute('src'); }
  var paginationEls = document.querySelectorAll('#refPageSize, #refPrevBtn, #refNextBtn, #refPageInfo, #refPageJump');
  for (var j = 0; j < paginationEls.length; j++) { paginationEls[j].style.display = ''; }

  try {
    var resp = await fetch('/api/books');
    var data = await resp.json();
    var book = (data.books || []).find(function(b) { return b.id === bookId; });
    var title = book ? book.icon + ' ' + book.title + ' — ' + book.author : bookId;
    if (titleEl) titleEl.textContent = title;
    refState._format = book ? book.format : 'md';

    if (book && book.format === 'pdf') {
      if (contentEl) contentEl.style.display = 'none';
      if (pdfFrame) {
        pdfFrame.style.display = '';
        pdfFrame.setAttribute('src', '/api/books/' + bookId + '/file');
      }
      for (var k = 0; k < paginationEls.length; k++) { paginationEls[k].style.display = 'none'; }
      return;
    }
  } catch (e) {
    console.error('openBookReader metadata error:', e);
    if (titleEl) titleEl.textContent = bookId;
  }

  await loadRefPage();
}
window.openBookReader = openBookReader;

async function loadRefPage() {
  if (!refState.bookId) return;
  var contentEl = document.getElementById('refReaderContent');
  if (contentEl) contentEl.textContent = '加载中…';
  try {
    var url = '/api/books/' + refState.bookId + '?page=' + refState.page + '&size=' + refState.size;
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var text = await resp.text();

    var totalPages = 1;
    var match = text.match(/第 (\d+)\/(\d+) 页/);
    if (match) totalPages = parseInt(match[2]);  // group[2] = total pages
    refState.totalPages = totalPages;

    if (contentEl) contentEl.textContent = text;
    var infoEl = document.getElementById('refPageInfo');
    if (infoEl) infoEl.textContent = '第 ' + refState.page + ' / ' + totalPages + ' 页';

    var jumpEl = document.getElementById('refPageJump');
    if (jumpEl) {
      if (jumpEl.options.length !== totalPages) {
        jumpEl.innerHTML = '';
        for (var i = 1; i <= totalPages; i++) {
          var opt = document.createElement('option');
          opt.value = i; opt.textContent = '第 ' + i + ' 页';
          if (i === refState.page) opt.selected = true;
          jumpEl.appendChild(opt);
        }
      } else {
        jumpEl.value = refState.page;
      }
    }

    var prevBtn = document.getElementById('refPrevBtn');
    var nextBtn = document.getElementById('refNextBtn');
    if (prevBtn) { prevBtn.disabled = refState.page <= 1; prevBtn.style.opacity = refState.page <= 1 ? '0.4' : '1'; }
    if (nextBtn) { nextBtn.disabled = refState.page >= totalPages; nextBtn.style.opacity = refState.page >= totalPages ? '0.4' : '1'; }
  } catch (e) {
    console.error('loadRefPage error:', e);
    if (contentEl) contentEl.textContent = '加载失败: ' + e.message;
  }
}

function flipRefPage(delta) {
  var newPage = refState.page + delta;
  if (newPage < 1 || newPage > refState.totalPages) return;
  refState.page = newPage;
  loadRefPage();
}
window.flipRefPage = flipRefPage;

function jumpRefPage(pageStr) {
  refState.page = parseInt(pageStr) || 1;
  loadRefPage();
}
window.jumpRefPage = jumpRefPage;

function changeRefPageSize(newSize) {
  refState.size = parseInt(newSize) || 300;
  refState.page = 1;
  loadRefPage();
}
window.changeRefPageSize = changeRefPageSize;

function closeBookReader() {
  var pdfFrame = document.getElementById('refPdfFrame');
  if (pdfFrame) { pdfFrame.removeAttribute('src'); pdfFrame.style.display = 'none'; }
  var paginationEls = document.querySelectorAll('#refPageSize, #refPrevBtn, #refNextBtn, #refPageInfo, #refPageJump');
  for (var i = 0; i < paginationEls.length; i++) { paginationEls[i].style.display = ''; }
  renderReferenceBooks();
}
window.closeBookReader = closeBookReader;
_stateVars.forEach(function(k) {
  Object.defineProperty(window, k, {
    get: function() { return S[k]; },
    set: function(v) { S[k] = v; },
    configurable: true, enumerable: true
  });
});
})();
