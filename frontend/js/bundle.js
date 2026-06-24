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
const DECK_GUHANYU = [
  {"front": "言", "hl": "言", "word": "言", "meaning": "动词。说话，说。", "sentence": "赵括自少时学兵法、言兵事。", "analogy": "王力《古代汉语》"},
  {"front": "语", "hl": "语", "word": "语", "meaning": "动词。谈话。", "sentence": "食不语，寝不言。", "analogy": "王力《古代汉语》"},
  {"front": "谓", "hl": "谓", "word": "谓", "meaning": "对〔某人〕说。左传僖公三十二年：\\\"公使～之曰。", "sentence": "公使谓之曰。", "analogy": "王力《古代汉语》"},
  {"front": "访", "hl": "访", "word": "访", "meaning": "咨询。尚书洪范：\\\"王～于箕子。", "sentence": "王访于箕子。", "analogy": "王力《古代汉语》"},
  {"front": "请", "hl": "请", "word": "请", "meaning": "请", "sentence": "亟请於武公", "analogy": "王力《古代汉语》"},
  {"front": "召", "hl": "召", "word": "召", "meaning": "召", "sentence": "召孟明、西乞、白乙，使出师於东门之外。", "analogy": "王力《古代汉语》"},
  {"front": "报", "hl": "报", "word": "报", "meaning": "断狱，判决罪人。韩非子五蠹：\\\"～而罪之。", "sentence": "报而罪之。", "analogy": "王力《古代汉语》"},
  {"front": "告", "hl": "告", "word": "告", "meaning": "告诉。左传隐公元年：\\\"且～之悔。", "sentence": "且告之悔。", "analogy": "王力《古代汉语》"},
  {"front": "谏", "hl": "谏", "word": "谏", "meaning": "谏", "sentence": "宣子骤谏。", "analogy": "王力《古代汉语》"},
  {"front": "讨", "hl": "讨", "word": "讨", "meaning": "研究。论语宪问：\\\"世叔～论之。", "sentence": "其君无日不讨国人而训之。", "analogy": "王力《古代汉语》"},
  {"front": "反", "hl": "反", "word": "反", "meaning": "翻转，颠倒。诗经周南关雎：\\\"辗转～侧。", "sentence": "辗转反侧。", "analogy": "王力《古代汉语》"},
  {"front": "复", "hl": "复", "word": "复", "meaning": "动词。回来，回去。", "sentence": "反复", "analogy": "王力《古代汉语》"},
  {"front": "舍", "hl": "舍", "word": "舍", "meaning": "宾馆，招待所。庄子说剑：\\\"夫子休就～。", "sentence": "夫子休就舍。", "analogy": "王力《古代汉语》"},
  {"front": "次", "hl": "次", "word": "次", "meaning": "依顺序排列。左传成公三年：\\\"～及於事。", "sentence": "次及於事。", "analogy": "王力《古代汉语》"},
  {"front": "如", "hl": "如", "word": "如", "meaning": "往，到......去。左传僖公四年：\\\"楚子使屈完～师。", "sentence": "楚子使屈完如师。", "analogy": "王力《古代汉语》"},
  {"front": "驰", "hl": "驰", "word": "驰", "meaning": "马快跑。左传宣公十二年：\\\"遂疾进师，车～卒奔。", "sentence": "骐骥骅骝，一日而驰千里。", "analogy": "王力《古代汉语》"},
  {"front": "骤", "hl": "骤", "word": "骤", "meaning": "马跑。诗经小雅四牡：\\\"载～骎骎。", "sentence": "骤雨不终日。", "analogy": "王力《古代汉语》"},
  {"front": "侵", "hl": "侵", "word": "侵", "meaning": "侵", "sentence": "齐侯以诸侯之师侵蔡。", "analogy": "王力《古代汉语》"},
  {"front": "袭", "hl": "袭", "word": "袭", "meaning": "衣一套叫一袭。汉书昭帝纪：\\\"赐衣被一～。", "sentence": "赐衣被一袭。", "analogy": "王力《古代汉语》"},
  {"front": "奔", "hl": "奔", "word": "奔", "meaning": "跑。庄子田子方：\\\"夫子～逸绝尘。", "sentence": "夫子奔逸绝尘。", "analogy": "王力《古代汉语》"},
  {"front": "亡", "hl": "亡", "word": "亡", "meaning": "逃跑。左传宣公二年：\\\"问其名居，不告而退，遂自～也。", "sentence": "亡羊而补牢，未为迟也。", "analogy": "王力《古代汉语》"},
  {"front": "逐", "hl": "逐", "word": "逐", "meaning": "追赶，追捕，追回来。尚书费誓：\\\"臣妾逋逃，无敢越～。", "sentence": "丧马勿逐。", "analogy": "王力《古代汉语》"},
  {"front": "及", "hl": "及", "word": "及", "meaning": "追赶上。左传成公二年：\\\"故不能推车而～。", "sentence": "故不能推车而及。", "analogy": "王力《古代汉语》"},
  {"front": "执", "hl": "执", "word": "执", "meaning": "捉拿，拘捕，擒获。左传僖公五年：\\\"遂袭虞，灭之，～虞公。", "sentence": "遂袭虞，灭之，执虞公。", "analogy": "王力《古代汉语》"},
  {"front": "免", "hl": "免", "word": "免", "meaning": "脱身，使脱身。礼记曲礼上：\\\"临财毋苟得，临难毋苟～。", "sentence": "临财毋苟得，临难毋苟免。", "analogy": "王力《古代汉语》"},
  {"front": "享", "hl": "享", "word": "享", "meaning": "享", "sentence": "王用享于西山。", "analogy": "王力《古代汉语》"},
  {"front": "图", "hl": "图", "word": "图", "meaning": "考虑，反复考虑。左传僖公三十年：\\\"阙秦以利晋，唯君～之。", "sentence": "阙秦以利晋，唯君图之。", "analogy": "王力《古代汉语》"},
  {"front": "虞", "hl": "虞", "word": "虞", "meaning": "意料。左传僖公四年：\\\"不～君之涉吾地也。", "sentence": "用戒不虞。", "analogy": "王力《古代汉语》"},
  {"front": "克", "hl": "克", "word": "克", "meaning": "战胜，攻破。左传隐公元年：\\\"郑伯～段于鄢。", "sentence": "郑伯克段于鄢。", "analogy": "王力《古代汉语》"},
  {"front": "堪", "hl": "堪", "word": "堪", "meaning": "堪", "sentence": "君将不堪。", "analogy": "王力《古代汉语》"},
  {"front": "有", "hl": "有", "word": "有", "meaning": "有。左传隐公元年：\\\"小人～母\\\"。", "sentence": "小人有母", "analogy": "王力《古代汉语》"},
  {"front": "无", "hl": "无", "word": "无", "meaning": "动词。没有。", "sentence": "无", "analogy": "王力《古代汉语》"},
  {"front": "昭", "hl": "昭", "word": "昭", "meaning": "明亮。诗经大雅抑：\\\"昊天孔～。", "sentence": "是以清庙茅屋......昭其俭也。", "analogy": "王力《古代汉语》"},
  {"front": "穆", "hl": "穆", "word": "穆", "meaning": "和。诗经大雅烝民：\\\"～如清风。", "sentence": "穆如清风。", "analogy": "王力《古代汉语》"},
  {"front": "勤", "hl": "勤", "word": "勤", "meaning": "疲劳，辛苦。跟\\\"逸\\\"相对。", "sentence": "逸", "analogy": "王力《古代汉语》"},
  {"front": "乏", "hl": "乏", "word": "乏", "meaning": "乏", "sentence": "行李之往来，供其乏困。", "analogy": "王力《古代汉语》"},
  {"front": "乱", "hl": "乱", "word": "乱", "meaning": "没有秩序，跟\\\"整\\\"相对。左传僖公三十年：\\\"以～易整，不武。", "sentence": "整", "analogy": "王力《古代汉语》"},
  {"front": "整", "hl": "整", "word": "整", "meaning": "整", "sentence": "乱", "analogy": "王力《古代汉语》"},
  {"front": "两", "hl": "两", "word": "两", "meaning": "数词。成对的两个，双方。", "sentence": "两臂重於天下也，身亦重於两臂。", "analogy": "王力《古代汉语》"},
  {"front": "贰", "hl": "贰", "word": "贰", "meaning": "副的。与\\\"正\\\"相对。", "sentence": "皆受其贰而藏之。", "analogy": "王力《古代汉语》"},
  {"front": "兵", "hl": "兵", "word": "兵", "meaning": "兵器，武器。左传隐公元年：\\\"缮甲～。", "sentence": "缮甲兵。", "analogy": "王力《古代汉语》"},
  {"front": "车", "hl": "车", "word": "车", "meaning": "车子。上古的车，除用於运输和旅行以外，还有一种重要的用途，就是用於战争（兵车）。", "sentence": "命子封师车二百乘以伐京。", "analogy": "王力《古代汉语》"},
  {"front": "甲", "hl": "甲", "word": "甲", "meaning": "古代军人穿的皮做的护身衣服。左传成公二年：\\\"擐～执兵。", "sentence": "擐甲执兵。", "analogy": "王力《古代汉语》"},
  {"front": "介", "hl": "介", "word": "介", "meaning": "疆界。诗经周颂思文：\\\"无此疆尔～。", "sentence": "子服惠伯为介。", "analogy": "王力《古代汉语》"},
  {"front": "卒", "hl": "卒", "word": "卒", "meaning": "步兵。左传隐公元年：\\\"具～乘。", "sentence": "具卒乘。", "analogy": "王力《古代汉语》"},
  {"front": "乘", "hl": "乘", "word": "乘", "meaning": "平声，读chéng。动词。", "sentence": "二子乘舟，泛泛其景。", "analogy": "王力《古代汉语》"},
  {"front": "君", "hl": "君", "word": "君", "meaning": "封建时代天子和诸侯的通称。跟\\\"臣\\\"相对。", "sentence": "谓之君子而射之，非礼也。", "analogy": "王力《古代汉语》"},
  {"front": "师", "hl": "师", "word": "师", "meaning": "军队二千五百人为一师。一般泛指军队。", "sentence": "齐侯以诸侯之师侵蔡。", "analogy": "王力《古代汉语》"},
  {"front": "姑", "hl": "姑", "word": "姑", "meaning": "父之姊妹。诗经邶风泉水：\\\"问我诸～。", "sentence": "问我诸姑。", "analogy": "王力《古代汉语》"},
  {"front": "女", "hl": "女", "word": "女", "meaning": "妇女。特指未嫁的女子。", "sentence": "窈窕淑女，君子好逑。", "analogy": "王力《古代汉语》"},
  {"front": "族", "hl": "族", "word": "族", "meaning": "亲属。一般指同姓的亲属。", "sentence": "宫之奇以其族行。", "analogy": "王力《古代汉语》"},
  {"front": "党", "hl": "党", "word": "党", "meaning": "上古时代，五百家为党。论语雍也：\\\"以与尔邻里乡～乎。", "sentence": "以与尔邻里乡党乎。", "analogy": "王力《古代汉语》"},
  {"front": "河", "hl": "河", "word": "河", "meaning": "河", "sentence": "东至于海，西至于河。", "analogy": "王力《古代汉语》"},
  {"front": "防", "hl": "防", "word": "防", "meaning": "名词。河堤，河坝。", "sentence": "巨防容蝼而漂邑杀人。", "analogy": "王力《古代汉语》"},
  {"front": "城", "hl": "城", "word": "城", "meaning": "城", "sentence": "都城过百雉，国之害也。", "analogy": "王力《古代汉语》"},
  {"front": "池", "hl": "池", "word": "池", "meaning": "护城河。左传僖公四年：\\\"楚国方城以为城，汉水以为～。", "sentence": "楚国方城以为城，汉水以为池。", "analogy": "王力《古代汉语》"},
  {"front": "田", "hl": "田", "word": "田", "meaning": "农田。孟子梁惠王上：\\\"百亩之～，勿夺其时。", "sentence": "田彼南山。", "analogy": "王力《古代汉语》"},
  {"front": "馆", "hl": "馆", "word": "馆", "meaning": "馆", "sentence": "乃筑诸侯之馆。", "analogy": "王力《古代汉语》"},
  {"front": "辞", "hl": "辞", "word": "辞", "meaning": "口供。尚书吕刑：\\\"两造具备，师听五～。", "sentence": "两造具备，师听五辞。", "analogy": "王力《古代汉语》"},
  {"front": "谢", "hl": "谢", "word": "谢", "meaning": "道歉。战国策齐策四：\\\"宣王～曰：\\'寡人有罪国家。", "sentence": "宣王谢曰：\\'寡人有罪国家。\\'", "analogy": "王力《古代汉语》"},
  {"front": "责", "hl": "责", "word": "责", "meaning": "读zhài，债务，债款。战国策齐策四：\\\"先生不羞，乃有意欲为文收～於薛者乎？", "sentence": "先生不羞，乃有意欲为文收责於薛者乎？", "analogy": "王力《古代汉语》"},
  {"front": "让", "hl": "让", "word": "让", "meaning": "责备。左传僖公五年：\\\"公使～之。", "sentence": "公使让之。", "analogy": "王力《古代汉语》"},
  {"front": "争", "hl": "争", "word": "争", "meaning": "跟别人抢着要同一个东西。左传隐公十一年：\\\"公孙阏(è)与颍考叔～车。", "sentence": "引申为竞争。左传成公三年：", "analogy": "王力《古代汉语》"},
  {"front": "使", "hl": "使", "word": "使", "meaning": "使，叫，让。左传僖公三十年：\\\"～杞子、逢孙、杨孙戍之。", "sentence": "使杞子、逢孙、杨孙戍之。", "analogy": "王力《古代汉语》"},
  {"front": "令", "hl": "令", "word": "令", "meaning": "发出命令。论语子路：\\\"其身正，不～而行", "sentence": "其身正，不令而行；其身不正，虽令不从。", "analogy": "王力《古代汉语》"},
  {"front": "属", "hl": "属", "word": "属", "meaning": "读zhǔ，动词。连接。", "sentence": "万物群生，连属其乡。", "analogy": "王力《古代汉语》"},
  {"front": "托", "hl": "托", "word": "托", "meaning": "寄托。战国策赵策四：\\\"长安君何以自～於赵？", "sentence": "长安君何以自托於赵？", "analogy": "王力《古代汉语》"},
  {"front": "往", "hl": "往", "word": "往", "meaning": "往", "sentence": "行李之往来。", "analogy": "王力《古代汉语》"},
  {"front": "来", "hl": "来", "word": "来", "meaning": "小麦。诗经周颂思文：\\\"贻我～牟。", "sentence": "於皇来牟！", "analogy": "王力《古代汉语》"},
  {"front": "去", "hl": "去", "word": "去", "meaning": "离开。左传僖公三十年：\\\"亦～之。", "sentence": "纣之去武丁未久也。", "analogy": "王力《古代汉语》"},
  {"front": "从", "hl": "从", "word": "从", "meaning": "跟随。论语微子：\\\"子路～而后。", "sentence": "子路从而后。", "analogy": "王力《古代汉语》"},
  {"front": "违", "hl": "违", "word": "违", "meaning": "离开，避开。左传成公十六年：\\\"有淖於前，乃皆左右，相～於淖。", "sentence": "虽遇执事，其弗敢违。", "analogy": "王力《古代汉语》"},
  {"front": "即", "hl": "即", "word": "即", "meaning": "动词。走近，靠近，走向。", "sentence": "若即若离", "analogy": "王力《古代汉语》"},
  {"front": "就", "hl": "就", "word": "就", "meaning": "走近，靠近，接近，亲近，趋向，走向，走上。跟\\\"去\\\"相对（因为\\\"去\\\"是离开）", "sentence": "避", "analogy": "王力《古代汉语》"},
  {"front": "趋", "hl": "趋", "word": "趋", "meaning": "快步走。论语微子：\\\"～而辟之，不得与之言。", "sentence": "入而徐趋。", "analogy": "王力《古代汉语》"},
  {"front": "赴", "hl": "赴", "word": "赴", "meaning": "奔向，投向。庄子秋水：\\\"～水则接腋持颐。", "sentence": "则连有赴东海而死耳。", "analogy": "王力《古代汉语》"},
  {"front": "战", "hl": "战", "word": "战", "meaning": "打仗。左传僖公四年：\\\"以此众～，谁能御之？", "sentence": "以此众战，谁能御之？", "analogy": "王力《古代汉语》"},
  {"front": "击", "hl": "击", "word": "击", "meaning": "击", "sentence": "击鼓其镗。", "analogy": "王力《古代汉语》"},
  {"front": "引", "hl": "引", "word": "引", "meaning": "开弓。孟子尽心下：\\\"君子～而不发。", "sentence": "子子孙孙，勿替引之。", "analogy": "王力《古代汉语》"},
  {"front": "冯", "hl": "冯", "word": "冯", "meaning": "读píng。依凭，汉书郦食其传：\\\"食其～轼下齐七十馀城\\\"。", "sentence": "食其冯轼下齐七十馀城", "analogy": "王力《古代汉语》"},
  {"front": "约", "hl": "约", "word": "约", "meaning": "缠，束缚。诗经小雅斯干：\\\"～之阁阁。", "sentence": "攘袖见素手，皓腕约金环。", "analogy": "王力《古代汉语》"},
  {"front": "解", "hl": "解", "word": "解", "meaning": "分解，指分解动物（原义是解牛）。庄子养生主：\\\"庖丁为文惠君～牛。", "sentence": "庖丁为文惠君解牛。", "analogy": "王力《古代汉语》"},
  {"front": "释", "hl": "释", "word": "释", "meaning": "解开，放下［原来拿着或背着的东西］，放掉。庄子养生主：\\\"庖丁～刀对曰。", "sentence": "庖丁释刀对曰。", "analogy": "王力《古代汉语》"},
  {"front": "具", "hl": "具", "word": "具", "meaning": "设食，准备酒席。礼记内则：\\\"若未食，则佐长者视～。", "sentence": "食以草具。", "analogy": "王力《古代汉语》"},
  {"front": "给", "hl": "给", "word": "给", "meaning": "读jǐ。形容词。", "sentence": "乏", "analogy": "王力《古代汉语》"},
  {"front": "计", "hl": "计", "word": "计", "meaning": "计", "sentence": "问门下诸客：谁习计会。", "analogy": "王力《古代汉语》"},
  {"front": "谋", "hl": "谋", "word": "谋", "meaning": "考虑，计画，商议。左传庄公十年：\\\"肉食者～之。", "sentence": "肉食者谋之。", "analogy": "王力《古代汉语》"},
  {"front": "会", "hl": "会", "word": "会", "meaning": "动词。会合，聚会，特指盟会、宴会等。", "sentence": "公会齐侯于艾。", "analogy": "王力《古代汉语》"},
  {"front": "习", "hl": "习", "word": "习", "meaning": "鸟反复地飞，频繁地飞。礼记月令：\\\"鹰乃学～。", "sentence": "鹰乃学习。", "analogy": "王力《古代汉语》"},
  {"front": "疾", "hl": "疾", "word": "疾", "meaning": "病。论语泰伯：\\\"曾子有～。", "sentence": "曾子有疾。", "analogy": "王力《古代汉语》"},
  {"front": "病", "hl": "病", "word": "病", "meaning": "重病。左传宣公二年：\\\"见灵辄饿，问其～。", "sentence": "见灵辄饿，问其病。", "analogy": "王力《古代汉语》"},
  {"front": "饿", "hl": "饿", "word": "饿", "meaning": "饿", "sentence": "见灵辄饿。", "analogy": "王力《古代汉语》"},
  {"front": "厌", "hl": "厌", "word": "厌", "meaning": "饱。\\\"厌\\\"字用於\\\"吃饱\\\"的意义时，一般写作\\\"餍\\\"。", "sentence": "厌", "analogy": "王力《古代汉语》"},
  {"front": "衰", "hl": "衰", "word": "衰", "meaning": "力量减退。跟\\\"盛\\\"相对。", "sentence": "盛", "analogy": "王力《古代汉语》"},
  {"front": "崩", "hl": "崩", "word": "崩", "meaning": "崩", "sentence": "梁山崩。", "analogy": "王力《古代汉语》"},
  {"front": "匮", "hl": "匮", "word": "匮", "meaning": "匣，近似后代的柜。庄子櫃箧：\\\"将为胠箧探囊发～之盗而为守备。", "sentence": "将为胠箧探囊发匮之盗而为守备。", "analogy": "王力《古代汉语》"},
  {"front": "困", "hl": "困", "word": "困", "meaning": "无路可走。\\\"～穷\\\"指生活艰难。", "sentence": "困穷", "analogy": "王力《古代汉语》"},
  {"front": "侈", "hl": "侈", "word": "侈", "meaning": "侈", "sentence": "骈拇枝指，出乎性哉，而侈於德。", "analogy": "王力《古代汉语》"},
  {"front": "靡", "hl": "靡", "word": "靡", "meaning": "无。诗经大雅荡：\\\"～不有初，鲜克有终。", "sentence": "靡室靡家。", "analogy": "王力《古代汉语》"},
  {"front": "寡", "hl": "寡", "word": "寡", "meaning": "少。战国策齐策四：\\\"视吾家所～有者。", "sentence": "视吾家所寡有者。", "analogy": "王力《古代汉语》"},
  {"front": "少", "hl": "少", "word": "少", "meaning": "多的反面。孟子梁惠王上：\\\"邻国之民不加～，寡人之民不加多。", "sentence": "稍", "analogy": "王力《古代汉语》"},
  {"front": "微", "hl": "微", "word": "微", "meaning": "隐蔽，藏匿。左传哀公十六年：\\\"白公奔山而缢，其徒～之。", "sentence": "微谏不倦。", "analogy": "王力《古代汉语》"},
  {"front": "固", "hl": "固", "word": "固", "meaning": "坚固，特指地理险要，或城郭坚固，便於防守。论语季氏：\\\"今夫颛臾，～而近於费。", "sentence": "固守", "analogy": "王力《古代汉语》"},
  {"front": "再", "hl": "再", "word": "再", "meaning": "再", "sentence": "一鼓作气，再而衰，三而竭。", "analogy": "王力《古代汉语》"},
  {"front": "三", "hl": "三", "word": "三", "meaning": "三", "sentence": "狡兔有三窟。", "analogy": "王力《古代汉语》"},
  {"front": "帝", "hl": "帝", "word": "帝", "meaning": "天神，整个宇宙的主宰者（迷信）。尚书洪范：\\\"～乃震怒。", "sentence": "帝乃震怒。", "analogy": "王力《古代汉语》"},
  {"front": "后", "hl": "后", "word": "后", "meaning": "君主，人君，天子。左传僖公三十二年：\\\"其南陵，夏～皋之墓也。", "sentence": "皇天后土。", "analogy": "王力《古代汉语》"},
  {"front": "王", "hl": "王", "word": "王", "meaning": "帝王，天子。左传僖公四年：\\\"尔贡包茅不入，～祭不共，无以缩酒。", "sentence": "尔贡包茅不入，王祭不共，无以缩酒。", "analogy": "王力《古代汉语》"},
  {"front": "侯", "hl": "侯", "word": "侯", "meaning": "侯", "sentence": "晋侯秦伯围郑", "analogy": "王力《古代汉语》"},
  {"front": "子", "hl": "子", "word": "子", "meaning": "儿女。一般指儿子。", "sentence": "子", "analogy": "王力《古代汉语》"},
  {"front": "息", "hl": "息", "word": "息", "meaning": "气息（一呼一吸为一息）。庄子逍遥游：\\\"生物之以～相吹也。", "sentence": "生物之以息相吹也。", "analogy": "王力《古代汉语》"},
  {"front": "宗", "hl": "宗", "word": "宗", "meaning": "祖庙。左传成公三年：\\\"首其请於寡君而以戮於～。", "sentence": "首其请於寡君而以戮於宗。", "analogy": "王力《古代汉语》"},
  {"front": "庙", "hl": "庙", "word": "庙", "meaning": "庙", "sentence": "一夫作难而七庙隳。", "analogy": "王力《古代汉语》"},
  {"front": "诗", "hl": "诗", "word": "诗", "meaning": "文体的一种。尚书舜典：\\\"～言志。", "sentence": "诗言志。", "analogy": "王力《古代汉语》"},
  {"front": "书", "hl": "书", "word": "书", "meaning": "写，写字。左传宣公二年：\\\"大史～曰：\\'赵盾弑其君。", "sentence": "书足以记名姓而已。", "analogy": "王力《古代汉语》"},
  {"front": "礼", "hl": "礼", "word": "礼", "meaning": "剥削阶级社会的典章制度与传统习惯。论语为政：\\\"殷因於夏～，所损益可知也。", "sentence": "为国以礼。", "analogy": "王力《古代汉语》"},
  {"front": "乐", "hl": "乐", "word": "乐", "meaning": "读yuè。音乐。", "sentence": "事不成，则礼乐不兴。", "analogy": "王力《古代汉语》"},
  {"front": "知", "hl": "知", "word": "知", "meaning": "知道，懂得，了解。论语学而：\\\"人不～而不愠。", "sentence": "人不知而不愠。", "analogy": "王力《古代汉语》"},
  {"front": "识", "hl": "识", "word": "识", "meaning": "知道，认识，能辨别。孟子梁惠王上：\\\"不～有诸？", "sentence": "不识有诸？", "analogy": "王力《古代汉语》"},
  {"front": "见", "hl": "见", "word": "见", "meaning": "看见。论语里仁：\\\"～贤思齐焉，～不贤而内自省也。", "sentence": "见贤思齐焉，见不贤而内自省也。", "analogy": "王力《古代汉语》"},
  {"front": "示", "hl": "示", "word": "示", "meaning": "示", "sentence": "国之利器不可以示人。", "analogy": "王力《古代汉语》"},
  {"front": "视", "hl": "视", "word": "视", "meaning": "看。礼记大学：\\\"十目所～，十手所指。", "sentence": "盖当时视他驿为壮。", "analogy": "王力《古代汉语》"},
  {"front": "观", "hl": "观", "word": "观", "meaning": "有目的地看，观察。左传僖公二十三年：\\\"曹共公闻其骈胁，欲～其裸", "sentence": "今吾於人也，听其言而观其行。", "analogy": "王力《古代汉语》"},
  {"front": "望", "hl": "望", "word": "望", "meaning": "向远处看。左传庄公十年：\\\"登轼而～之。", "sentence": "故愿望见太后。", "analogy": "王力《古代汉语》"},
  {"front": "矜", "hl": "矜", "word": "矜", "meaning": "矛柄。贾谊过秦论上：\\\"锄耰棘～，非铦於钩戟长铩也。", "sentence": "矜", "analogy": "王力《古代汉语》"},
  {"front": "哀", "hl": "哀", "word": "哀", "meaning": "哀", "sentence": "有妇人哭於墓者而哀。", "analogy": "王力《古代汉语》"},
  {"front": "憾", "hl": "憾", "word": "憾", "meaning": "憾", "sentence": "敝之而无憾。", "analogy": "王力《古代汉语》"},
  {"front": "恕", "hl": "恕", "word": "恕", "meaning": "恕", "sentence": "其恕乎！己所不欲，勿施於人。", "analogy": "王力《古代汉语》"},
  {"front": "愤", "hl": "愤", "word": "愤", "meaning": "愤", "sentence": "是仆终已不得舒愤懑以晓左右。", "analogy": "王力《古代汉语》"},
  {"front": "患", "hl": "患", "word": "患", "meaning": "患", "sentence": "季康子患盗。", "analogy": "王力《古代汉语》"},
  {"front": "持", "hl": "持", "word": "持", "meaning": "持", "sentence": "子之持戟之士一日而三失伍。", "analogy": "王力《古代汉语》"},
  {"front": "措", "hl": "措", "word": "措", "meaning": "措", "sentence": "则民无所措手足。", "analogy": "王力《古代汉语》"},
  {"front": "拱", "hl": "拱", "word": "拱", "meaning": "拱", "sentence": "子路拱而立。", "analogy": "王力《古代汉语》"},
  {"front": "攻", "hl": "攻", "word": "攻", "meaning": "进攻，攻打。左传僖公四年：\\\"以此～城，何城不克？", "sentence": "以此攻城，何城不克？", "analogy": "王力《古代汉语》"},
  {"front": "窃", "hl": "窃", "word": "窃", "meaning": "偷。论语颜渊：\\\"苟子之不欲，虽赏之不～。", "sentence": "苟子之不欲，虽赏之不窃。", "analogy": "王力《古代汉语》"},
  {"front": "诛", "hl": "诛", "word": "诛", "meaning": "谴责。论语公冶长：\\\"於予与何～？", "sentence": "於予与何诛？", "analogy": "王力《古代汉语》"},
  {"front": "翦", "hl": "翦", "word": "翦", "meaning": "翦", "sentence": "勿翦勿伐。", "analogy": "王力《古代汉语》"},
  {"front": "讲", "hl": "讲", "word": "讲", "meaning": "讲和，和解。战国策西周策：\\\"而秦未与魏～也。", "sentence": "而秦未与魏讲也。", "analogy": "王力《古代汉语》"},
  {"front": "设", "hl": "设", "word": "设", "meaning": "安排，摆设，建立。礼记礼运：\\\"以～制度，以立田里。", "sentence": "以设制度，以立田里。", "analogy": "王力《古代汉语》"},
  {"front": "立", "hl": "立", "word": "立", "meaning": "站着。论语微子：\\\"子路拱而～。", "sentence": "子路拱而立。", "analogy": "王力《古代汉语》"},
  {"front": "忠", "hl": "忠", "word": "忠", "meaning": "忠", "sentence": "忠之属也。", "analogy": "王力《古代汉语》"},
  {"front": "信", "hl": "信", "word": "信", "meaning": "言语真实，不虚伪。老子八十一章：\\\"～言不美，美言不～。", "sentence": "与朋友交而不信乎？", "analogy": "王力《古代汉语》"},
  {"front": "谅", "hl": "谅", "word": "谅", "meaning": "形容词。诚实。", "sentence": "岂若匹夫匹妇之为谅也？", "analogy": "王力《古代汉语》"},
  {"front": "正", "hl": "正", "word": "正", "meaning": "不偏，跟\\\"偏\\\"相对；不斜，跟\\\"斜\\\"、\\\"邪\\\"相对（邪就是斜）。", "sentence": "席不正不坐。", "analogy": "王力《古代汉语》"},
  {"front": "邪", "hl": "邪", "word": "邪", "meaning": "斜的。诗经小雅采菽：\\\"～幅在下。", "sentence": "邪幅在下。", "analogy": "王力《古代汉语》"},
  {"front": "辟", "hl": "辟", "word": "辟", "meaning": "读bì，法。诗经小雅雨无正：\\\"～言不信。", "sentence": "辟言不信。", "analogy": "王力《古代汉语》"},
  {"front": "好", "hl": "好", "word": "好", "meaning": "貌美。战国策赵策三：\\\"鬼侯有子而～。", "sentence": "鬼侯有子而好。", "analogy": "王力《古代汉语》"},
  {"front": "恶", "hl": "恶", "word": "恶", "meaning": "罪恶，不良的行为，跟\\\"善\\\"相对。左传宣公二年：\\\"为法受～。", "sentence": "善", "analogy": "王力《古代汉语》"},
  {"front": "敬", "hl": "敬", "word": "敬", "meaning": "严肃。左传宣公二年：\\\"不忘恭～。", "sentence": "不忘恭敬。", "analogy": "王力《古代汉语》"},
  {"front": "慎", "hl": "慎", "word": "慎", "meaning": "慎", "sentence": "敏於事而慎於言。", "analogy": "王力《古代汉语》"},
  {"front": "苟", "hl": "苟", "word": "苟", "meaning": "苟且，不严肃。跟\\\"敬\\\"相对。", "sentence": "敬", "analogy": "王力《古代汉语》"},
  {"front": "显", "hl": "显", "word": "显", "meaning": "显", "sentence": "不显其光。", "analogy": "王力《古代汉语》"},
  {"front": "著", "hl": "著", "word": "著", "meaning": "显露。礼记中庸：\\\"诚则形，形则～，～则明。", "sentence": "诚则形，形则著，著则明。", "analogy": "王力《古代汉语》"},
  {"front": "相", "hl": "相", "word": "相", "meaning": "仔细看，审察。诗经鄘风相鼠：\\\"～鼠有皮\\\"。", "sentence": "相鼠有皮", "analogy": "王力《古代汉语》"},
  {"front": "帅", "hl": "帅", "word": "帅", "meaning": "帅", "sentence": "命子封帅车二百乘以伐京。", "analogy": "王力《古代汉语》"},
  {"front": "士", "hl": "士", "word": "士", "meaning": "男子，特指未婚的男子。跟\\\"女\\\"相对。", "sentence": "女", "analogy": "王力《古代汉语》"},
  {"front": "仆", "hl": "仆", "word": "仆", "meaning": "奴隶的一个等级。左传昭公七年：\\\"天有十日，人有十等，......故王臣公，公臣大夫，大夫臣士，士臣皁，皁臣舆，舆臣隶，隶臣僚，僚臣～，～臣台。", "sentence": "民之无辜，并其臣仆。", "analogy": "王力《古代汉语》"},
  {"front": "御", "hl": "御", "word": "御", "meaning": "驾驶车马。论语为政：\\\"樊迟～。", "sentence": "樊迟御。", "analogy": "王力《古代汉语》"},
  {"front": "右", "hl": "右", "word": "右", "meaning": "右边。左传成公二年：\\\"射其左，越於车下", "sentence": "兼爱，尚贤，右鬼，非命，墨子之所立也。", "analogy": "王力《古代汉语》"},
  {"front": "盗", "hl": "盗", "word": "盗", "meaning": "盗", "sentence": "盗器为奸", "analogy": "王力《古代汉语》"},
  {"front": "贼", "hl": "贼", "word": "贼", "meaning": "毁，害。论语先进：\\\"～夫人之子。", "sentence": "使鉏麑贼之。", "analogy": "王力《古代汉语》"},
  {"front": "国", "hl": "国", "word": "国", "meaning": "国家。孟子梁惠王上：\\\"寡人之於～也，尽心焉耳矣。", "sentence": "寡人之於国也，尽心焉耳矣。", "analogy": "王力《古代汉语》"},
  {"front": "家", "hl": "家", "word": "家", "meaning": "家，家庭。与现代的\\\"家\\\"字同义。", "sentence": "家", "analogy": "王力《古代汉语》"},
  {"front": "杜", "hl": "杜", "word": "杜", "meaning": "杜", "sentence": "后土", "analogy": "王力《古代汉语》"},
  {"front": "稷", "hl": "稷", "word": "稷", "meaning": "谷名，跟黍相似，但不黏。诗经王风黍离：\\\"彼～之穗。", "sentence": "彼稷之穗。", "analogy": "王力《古代汉语》"},
  {"front": "仁", "hl": "仁", "word": "仁", "meaning": "仁", "sentence": "若圣与仁，则吾岂敢？", "analogy": "王力《古代汉语》"},
  {"front": "义", "hl": "义", "word": "义", "meaning": "合理的事，应该做的事。跟仁一样，这是封建的伦理道德之一。", "sentence": "闻义不能徙，不善不能改，是吾忧也。", "analogy": "王力《古代汉语》"},
  {"front": "道", "hl": "道", "word": "道", "meaning": "路，道路。战国策齐策四：\\\"民扶老携幼，迎君～中。", "sentence": "交邻国有道乎？", "analogy": "王力《古代汉语》"},
  {"front": "德", "hl": "德", "word": "德", "meaning": "道德，修养。论语子罕：\\\"吾未见好～如好色者也。", "sentence": "吾未见好德如好色者也。", "analogy": "王力《古代汉语》"},
  {"front": "文", "hl": "文", "word": "文", "meaning": "彩色交错为文。孟子告子上：\\\"令闻广誉施於身，所以不愿人之～绣也。", "sentence": "圣贤书辞，总称文章，非采而何？", "analogy": "王力《古代汉语》"},
  {"front": "质", "hl": "质", "word": "质", "meaning": "读zhì，抵押。战国策赵策四：\\\"必以长安君为～，兵乃出。", "sentence": "必以长安君为质，兵乃出。", "analogy": "王力《古代汉语》"},
  {"front": "色", "hl": "色", "word": "色", "meaning": "脸上的气色，表情。孟子梁惠王上：\\\"民有饥～。", "sentence": "民有饥色。", "analogy": "王力《古代汉语》"},
  {"front": "臭", "hl": "臭", "word": "臭", "meaning": "读xiù气味。周易系辞上：\\\"其～如兰。", "sentence": "引申为坏的气味，", "analogy": "王力《古代汉语》"},
  {"front": "先", "hl": "先", "word": "先", "meaning": "动词。先行，先做某事。", "sentence": "会请先。", "analogy": "王力《古代汉语》"},
  {"front": "前", "hl": "前", "word": "前", "meaning": "动词。向前，前进。", "sentence": "酒酣，起前，以千金为鲁连寿。", "analogy": "王力《古代汉语》"},
  {"front": "后", "hl": "后", "word": "后", "meaning": "动词。走在后面，落后。", "sentence": "子路从而后。", "analogy": "王力《古代汉语》"},
  {"front": "内", "hl": "内", "word": "内", "meaning": "内，内室。诗经唐风山有枢：\\\"子有廷～，弗洒弗埽。", "sentence": "洒埽廷内。", "analogy": "王力《古代汉语》"},
  {"front": "外", "hl": "外", "word": "外", "meaning": "外", "sentence": "内", "analogy": "王力《古代汉语》"},
  {"front": "间", "hl": "间", "word": "间", "meaning": "读jiàn。夹缝，间隙。", "sentence": "肉食者谋之，又何间焉？", "analogy": "王力《古代汉语》"},
  {"front": "行", "hl": "行", "word": "行", "meaning": "名词。道路。", "sentence": "遵彼微行。", "analogy": "王力《古代汉语》"},
  {"front": "走", "hl": "走", "word": "走", "meaning": "跑，逃跑。战国策楚策一：\\\"兽见之皆～。", "sentence": "兽见之皆走。", "analogy": "王力《古代汉语》"},
  {"front": "出", "hl": "出", "word": "出", "meaning": "出", "sentence": "入", "analogy": "王力《古代汉语》"},
  {"front": "入", "hl": "入", "word": "入", "meaning": "进，进去，进来。孟子滕文公上：\\\"三过其门而不～。", "sentence": "三过其门而不入。", "analogy": "王力《古代汉语》"},
  {"front": "之", "hl": "之", "word": "之", "meaning": "动词。到〔某地〕去。", "sentence": "牛何之？", "analogy": "王力《古代汉语》"},
  {"front": "适", "hl": "适", "word": "适", "meaning": "动词。到〔某地〕去。", "sentence": "子适卫。", "analogy": "王力《古代汉语》"},
  {"front": "进", "hl": "进", "word": "进", "meaning": "向前走，推进。跟\\\"退\\\"相对。", "sentence": "退", "analogy": "王力《古代汉语》"},
  {"front": "退", "hl": "退", "word": "退", "meaning": "向后走，后退。跟\\\"进\\\"相对。", "sentence": "吾退而寒之者至矣。", "analogy": "王力《古代汉语》"},
  {"front": "逾", "hl": "逾", "word": "逾", "meaning": "逾", "sentence": "无逾我墙。", "analogy": "王力《古代汉语》"},
  {"front": "逸", "hl": "逸", "word": "逸", "meaning": "逃走。左传桓公八年：\\\"随侯～。", "sentence": "清新庾开府，俊逸鲍参军。", "analogy": "王力《古代汉语》"},
  {"front": "逼", "hl": "逼", "word": "逼", "meaning": "逼", "sentence": "禽兽逼人。", "analogy": "王力《古代汉语》"},
  {"front": "决", "hl": "决", "word": "决", "meaning": "打开缺口，导引水流。孟子滕文公上：\\\"～汝汉，排淮泗，而注之江。", "sentence": "决汝汉，排淮泗，而注之江。", "analogy": "王力《古代汉语》"},
  {"front": "治", "hl": "治", "word": "治", "meaning": "旧读平声(chí)。治水，防御它或疏导它。", "sentence": "禹之治水，水之道也。", "analogy": "王力《古代汉语》"},
  {"front": "树", "hl": "树", "word": "树", "meaning": "种植，栽种。动词。", "sentence": "五亩之宅，树之以桑。", "analogy": "王力《古代汉语》"},
  {"front": "事", "hl": "事", "word": "事", "meaning": "事情。孟子梁惠王上：\\\"齐桓晋文之～，可得闻乎？", "sentence": "齐桓晋文之事，可得闻乎？", "analogy": "王力《古代汉语》"},
  {"front": "畜", "hl": "畜", "word": "畜", "meaning": "读xù。养。", "sentence": "鸡豚狗彘之畜，无失其时。", "analogy": "王力《古代汉语》"},
  {"front": "保", "hl": "保", "word": "保", "meaning": "保", "sentence": "若保赤子。", "analogy": "王力《古代汉语》"},
  {"front": "爱", "hl": "爱", "word": "爱", "meaning": "爱。左传隐公元年：\\\"～其母。", "sentence": "爱其母。", "analogy": "王力《古代汉语》"},
  {"front": "伤", "hl": "伤", "word": "伤", "meaning": "受伤，特指战斗时遭受创伤。左传成公二年：\\\"郤克～於矢。", "sentence": "损害了什么", "analogy": "王力《古代汉语》"},
  {"front": "害", "hl": "害", "word": "害", "meaning": "损害，伤害。左传僖公三十年：\\\"君亦无所～。", "sentence": "君亦无所害。", "analogy": "王力《古代汉语》"},
  {"front": "比", "hl": "比", "word": "比", "meaning": "摆在一起。文心雕龙情采：\\\"五音～而成韶夏。", "sentence": "试使山东之国与陈涉度长絜大，比权量力，则不可同年而语矣。", "analogy": "王力《古代汉语》"},
  {"front": "喻", "hl": "喻", "word": "喻", "meaning": "晓得，了解。战国策魏策四：\\\"寡人～矣。", "sentence": "寡人喻矣。", "analogy": "王力《古代汉语》"},
  {"front": "诚", "hl": "诚", "word": "诚", "meaning": "真心，不诡诈，不虚伪。跟\\\"诈\\\"相对，又跟\\\"伪\\\"相对。", "sentence": "诈", "analogy": "王力《古代汉语》"},
  {"front": "伪", "hl": "伪", "word": "伪", "meaning": "伪", "sentence": "人之性恶，其善者伪也。", "analogy": "王力《古代汉语》"},
  {"front": "善", "hl": "善", "word": "善", "meaning": "好，指美好。庄子逍遥游：\\\"夫列子御风而行，泠然～也。", "sentence": "夫列子御风而行，泠然善也。", "analogy": "王力《古代汉语》"},
  {"front": "淫", "hl": "淫", "word": "淫", "meaning": "过分而不得当，过度。战国策楚策四：\\\"专～逸侈靡。", "sentence": "专淫逸侈靡。", "analogy": "王力《古代汉语》"},
  {"front": "凶", "hl": "凶", "word": "凶", "meaning": "不吉利。跟\\\"吉\\\"相对。", "sentence": "吉", "analogy": "王力《古代汉语》"},
  {"front": "疏", "hl": "疏", "word": "疏", "meaning": "稀疏。跟\\\"密\\\"相对，又跟\\\"数\\\"相对。", "sentence": "天网恢恢，疏而不失。", "analogy": "王力《古代汉语》"},
  {"front": "戚", "hl": "戚", "word": "戚", "meaning": "兵器之一种，像大斧。诗经大雅公刘：\\\"弓矢斯张，干戈～扬。", "sentence": "刑天舞干戚。", "analogy": "王力《古代汉语》"},
  {"front": "饥", "hl": "饥", "word": "饥", "meaning": "饥", "sentence": "因之以饥馑。", "analogy": "王力《古代汉语》"},
  {"front": "孰", "hl": "孰", "word": "孰", "meaning": "熟，煮熟了的。左传宣公二年：\\\"宰夫腼熊蹯不～。", "sentence": "宰夫腼熊蹯不孰。", "analogy": "王力《古代汉语》"},
  {"front": "滋", "hl": "滋", "word": "滋", "meaning": "增益，增长。左传隐公元年：\\\"无使～蔓。", "sentence": "无使滋蔓。", "analogy": "王力《古代汉语》"},
  {"front": "烈", "hl": "烈", "word": "烈", "meaning": "火猛。左传昭公二十年：\\\"夫火～，民望而畏之，故鲜死焉。", "sentence": "白刃交於前，视死若生者，烈士之勇也。", "analogy": "王力《古代汉语》"},
  {"front": "赡", "hl": "赡", "word": "赡", "meaning": "赡", "sentence": "以力服人者，非心服也，力不赡也。", "analogy": "王力《古代汉语》"},
  {"front": "共", "hl": "共", "word": "共", "meaning": "读gǒng，上声。通\\\"拱\\\"。", "sentence": "拱", "analogy": "王力《古代汉语》"},
  {"front": "同", "hl": "同", "word": "同", "meaning": "同", "sentence": "异", "analogy": "王力《古代汉语》"},
  {"front": "殊", "hl": "殊", "word": "殊", "meaning": "死。汉书高帝纪：\\\"其赦天下～死以下。", "sentence": "军皆殊死战，不可败。", "analogy": "王力《古代汉语》"},
  {"front": "异", "hl": "异", "word": "异", "meaning": "不同。跟\\\"同\\\"相对。", "sentence": "异日", "analogy": "王力《古代汉语》"},
  {"front": "斤", "hl": "斤", "word": "斤", "meaning": "斧子一类的工具。孟子梁惠王上：\\\"斧～以时入山林。", "sentence": "斧斤以时入山林。", "analogy": "王力《古代汉语》"},
  {"front": "钧", "hl": "钧", "word": "钧", "meaning": "三十斤。孟子梁惠王上：\\\"吾力足以举百～。", "sentence": "吾力足以举百钧。", "analogy": "王力《古代汉语》"},
  {"front": "锺", "hl": "锺", "word": "锺", "meaning": "量名。六斛四斗。", "sentence": "兄戴，盖禄万锺。", "analogy": "王力《古代汉语》"},
  {"front": "倍", "hl": "倍", "word": "倍", "meaning": "背向，背着。战国策赵策三：\\\"天子吊，主人必将～殡柩。", "sentence": "天子吊，主人必将倍殡柩。", "analogy": "王力《古代汉语》"},
  {"front": "政", "hl": "政", "word": "政", "meaning": "政", "sentence": "卫君待子而为政。", "analogy": "王力《古代汉语》"},
  {"front": "教", "hl": "教", "word": "教", "meaning": "动词。教导。", "sentence": "教以慎於接物，推贤进士为务。", "analogy": "王力《古代汉语》"},
  {"front": "法", "hl": "法", "word": "法", "meaning": "法令，法律。上古的\\\"法\\\"，着重在规定刑罚。", "sentence": "法", "analogy": "王力《古代汉语》"},
  {"front": "术", "hl": "术", "word": "术", "meaning": "道路，街巷。礼记月令：\\\"皆修封疆，审端径～。", "sentence": "园囿术路。", "analogy": "王力《古代汉语》"},
  {"front": "势", "hl": "势", "word": "势", "meaning": "力量，权力。荀子正论：\\\"天子者～位至尊，无敌於天下。", "sentence": "天子者势位至尊，无敌於天下。", "analogy": "王力《古代汉语》"},
  {"front": "数", "hl": "数", "word": "数", "meaning": "数目，数量。庄子秋水：\\\"号物之～谓之万。", "sentence": "号物之数谓之万。", "analogy": "王力《古代汉语》"},
  {"front": "朝", "hl": "朝", "word": "朝", "meaning": "读zhāo，早晨。跟\\\"暮\\\"、\\\"夕\\\"相对。", "sentence": "崇朝其雨。", "analogy": "王力《古代汉语》"},
  {"front": "野", "hl": "野", "word": "野", "meaning": "郊外，田野。孟子梁惠王上：\\\"耕者皆欲耕於王之～。", "sentence": "耕者皆欲耕於王之野。", "analogy": "王力《古代汉语》"},
  {"front": "涂", "hl": "涂", "word": "涂", "meaning": "路。论语阳货：\\\"遇诸～。", "sentence": "遇诸涂。", "analogy": "王力《古代汉语》"},
  {"front": "江", "hl": "江", "word": "江", "meaning": "江", "sentence": "决汝汉，排淮泗，而注之江。", "analogy": "王力《古代汉语》"},
  {"front": "关", "hl": "关", "word": "关", "meaning": "门闩。左传襄公二十八年：\\\"臧纥斩鹿门之～以出。", "sentence": "门虽设而常关。", "analogy": "王力《古代汉语》"},
  {"front": "宫", "hl": "宫", "word": "宫", "meaning": "房屋，住宅。论语子张：\\\"譬之～墙。", "sentence": "作阿房宫。", "analogy": "王力《古代汉语》"},
  {"front": "府", "hl": "府", "word": "府", "meaning": "藏财物的地方。孟子滕文公上：\\\"今也滕有仓廪～库，则是厉民而以自养也。", "sentence": "今也滕有仓廪府库，则是厉民而以自养也。", "analogy": "王力《古代汉语》"},
  {"front": "衣", "hl": "衣", "word": "衣", "meaning": "衣服，有时候特指上衣。诗经邶风绿衣：\\\"绿兮～兮，绿～黄裳。", "sentence": "九月授衣。", "analogy": "王力《古代汉语》"},
  {"front": "冠", "hl": "冠", "word": "冠", "meaning": "古代帽子的总称。楚辞渔父：\\\"新沐者必弹～。", "sentence": "新沐者必弹冠。", "analogy": "王力《古代汉语》"},
  {"front": "屦", "hl": "屦", "word": "屦", "meaning": "屦", "sentence": "其徒数十人，皆衣褐，捆屦织席以为食。", "analogy": "王力《古代汉语》"},
  {"front": "商", "hl": "商", "word": "商", "meaning": "做生意的人。左传僖公三十三年：\\\"郑～人弦高将市於周。", "sentence": "郑商人弦高将市於周。", "analogy": "王力《古代汉语》"},
  {"front": "贾", "hl": "贾", "word": "贾", "meaning": "读gǔ。卖。", "sentence": "平子每岁贾马。", "analogy": "王力《古代汉语》"},
  {"front": "旅", "hl": "旅", "word": "旅", "meaning": "军队五百人为旅。左传哀公元年：\\\"有田一成，有众一～。", "sentence": "有田一成，有众一旅。", "analogy": "王力《古代汉语》"},
  {"front": "徒", "hl": "徒", "word": "徒", "meaning": "步行。周易贲卦：\\\"舍车而～。", "sentence": "舍车而徒。", "analogy": "王力《古代汉语》"},
  {"front": "年", "hl": "年", "word": "年", "meaning": "年成，收成。春秋宣公十六年：\\\"冬，大有～。", "sentence": "冬，大有年。", "analogy": "王力《古代汉语》"},
  {"front": "岁", "hl": "岁", "word": "岁", "meaning": "木星。古人分黄道为十二个星次，大致和西洋的十二宫相当。", "sentence": "星纪", "analogy": "王力《古代汉语》"},
  {"front": "说", "hl": "说", "word": "说", "meaning": "说明，解释。论语八佾：\\\"成事不～。", "sentence": "若以此说往，杀十人，十重不义，必有十死罪矣。", "analogy": "王力《古代汉语》"},
  {"front": "听", "hl": "听", "word": "听", "meaning": "读tīng，又读tìng。听。", "sentence": "夫子式而听之。", "analogy": "王力《古代汉语》"},
  {"front": "毁", "hl": "毁", "word": "毁", "meaning": "损坏，伤害。论语季氏：\\\"龟玉～於椟中，是谁之过与？", "sentence": "龟玉毁於椟中，是谁之过与？", "analogy": "王力《古代汉语》"},
  {"front": "誉", "hl": "誉", "word": "誉", "meaning": "誉", "sentence": "从而誉之，谓之义。", "analogy": "王力《古代汉语》"},
  {"front": "劝", "hl": "劝", "word": "劝", "meaning": "劝", "sentence": "惩", "analogy": "王力《古代汉语》"},
  {"front": "居", "hl": "居", "word": "居", "meaning": "坐。论语阳货：\\\"～，吾语女！\\\"引申为居住的意思。", "sentence": "居，吾语女！", "analogy": "王力《古代汉语》"},
  {"front": "登", "hl": "登", "word": "登", "meaning": "从低处走上高处。荀子劝学：\\\"故不～高山，不知天之高也。", "sentence": "故不登高山，不知天之高也。", "analogy": "王力《古代汉语》"},
  {"front": "临", "hl": "临", "word": "临", "meaning": "从高处往低处看。荀子劝学：\\\"不～深溪，不知地之厚也。", "sentence": "不临深溪，不知地之厚也。", "analogy": "王力《古代汉语》"},
  {"front": "过", "hl": "过", "word": "过", "meaning": "走过，经过。论语微子：\\\"孔子～之，使子路问津焉。", "sentence": "孔子过之，使子路问津焉。", "analogy": "王力《古代汉语》"},
  {"front": "称", "hl": "称", "word": "称", "meaning": "称量物体的轻重。庄子胠箧：\\\"为之权衡以～之。", "sentence": "为之权衡以称之。", "analogy": "王力《古代汉语》"},
  {"front": "量", "hl": "量", "word": "量", "meaning": "读liáng。动词，计算物体容积。", "sentence": "为之斗斛以量之。", "analogy": "王力《古代汉语》"},
  {"front": "鬻", "hl": "鬻", "word": "鬻", "meaning": "鬻", "sentence": "今一朝而鬻技百金，请与之。", "analogy": "王力《古代汉语》"},
  {"front": "市", "hl": "市", "word": "市", "meaning": "交易物品的场所，市场。孟子滕文公上：\\\"从许子之道，则～贾不贰。", "sentence": "从许子之道，则市贾不贰。", "analogy": "王力《古代汉语》"},
  {"front": "假", "hl": "假", "word": "假", "meaning": "借。左传僖公五年：\\\"晋侯复～道於虞以伐虢。", "sentence": "晋侯复假道於虞以伐虢。", "analogy": "王力《古代汉语》"},
  {"front": "离", "hl": "离", "word": "离", "meaning": "分散，分离。跟\\\"合\\\"相对，又跟\\\"即\\\"相对。", "sentence": "合", "analogy": "王力《古代汉语》"},
  {"front": "合", "hl": "合", "word": "合", "meaning": "闭，合拢。跟\\\"开\\\"相对。", "sentence": "开", "analogy": "王力《古代汉语》"},
  {"front": "因", "hl": "因", "word": "因", "meaning": "动词。依靠，凭藉。", "sentence": "因人之力而敝之，不仁。", "analogy": "王力《古代汉语》"},
  {"front": "改", "hl": "改", "word": "改", "meaning": "改", "sentence": "回也不改其乐。", "analogy": "王力《古代汉语》"},
  {"front": "作", "hl": "作", "word": "作", "meaning": "起来。论语先进：\\\"舍瑟而～。", "sentence": "舍瑟而作。", "analogy": "王力《古代汉语》"},
  {"front": "为", "hl": "为", "word": "为", "meaning": "做，造作。战国策齐策四：\\\"王使人～冠。", "sentence": "王使人为冠。", "analogy": "王力《古代汉语》"},
  {"front": "取", "hl": "取", "word": "取", "meaning": "拿，拿来占有。左传僖公三十年：\\\"若不阙秦，将焉～之？", "sentence": "青取之於蓝，而青於蓝。", "analogy": "王力《古代汉语》"},
  {"front": "求", "hl": "求", "word": "求", "meaning": "找，寻找。孟子梁惠王上：\\\"犹缘木而～鱼也。", "sentence": "得", "analogy": "王力《古代汉语》"},
  {"front": "奉", "hl": "奉", "word": "奉", "meaning": "两手恭敬地捧着。左传成公二年：\\\"再拜稽首，～觞加璧以进。", "sentence": "奉命", "analogy": "王力《古代汉语》"},
  {"front": "致", "hl": "致", "word": "致", "meaning": "给与，送给，献出。左传文公六年：\\\"尽具其帑，与其器用财贿，\\...\\...送～诸竟。", "sentence": "士见危致命。", "analogy": "王力《古代汉语》"},
  {"front": "得", "hl": "得", "word": "得", "meaning": "获得，得到。跟\\\"失\\\"相对。", "sentence": "失", "analogy": "王力《古代汉语》"},
  {"front": "益", "hl": "益", "word": "益", "meaning": "水漫出来，涨。吕氏春秋察今：\\\"澭水暴～，荆人弗知。", "sentence": "澭水暴益，荆人弗知。", "analogy": "王力《古代汉语》"},
  {"front": "竭", "hl": "竭", "word": "竭", "meaning": "竭", "sentence": "盈", "analogy": "王力《古代汉语》"},
  {"front": "坚", "hl": "坚", "word": "坚", "meaning": "坚", "sentence": "脆", "analogy": "王力《古代汉语》"},
  {"front": "利", "hl": "利", "word": "利", "meaning": "锐利，快。一般指兵器或工具的锐利。", "sentence": "钝", "analogy": "王力《古代汉语》"},
  {"front": "完", "hl": "完", "word": "完", "meaning": "完整，完善，没有损坏。荀子劝学：\\\"巢非不～也。", "sentence": "巢非不完也。", "analogy": "王力《古代汉语》"},
  {"front": "备", "hl": "备", "word": "备", "meaning": "完备，齐备。论语微子：\\\"无求～於一人。", "sentence": "无求备於一人。", "analogy": "王力《古代汉语》"},
  {"front": "陈", "hl": "陈", "word": "陈", "meaning": "陈列。左传隐公五年：\\\"～鱼而观之。", "sentence": "陈鱼而观之。", "analogy": "王力《古代汉语》"},
  {"front": "故", "hl": "故", "word": "故", "meaning": "原因。左传隐公元年：\\\"公语之～。", "sentence": "公语之故。", "analogy": "王力《古代汉语》"},
  {"front": "穷", "hl": "穷", "word": "穷", "meaning": "阻塞不通。跟\\\"通\\\"或\\\"达\\\"相对。", "sentence": "夫处穷闾厄巷。", "analogy": "王力《古代汉语》"},
  {"front": "难", "hl": "难", "word": "难", "meaning": "不容易，困难。跟\\\"易\\\"相对。", "sentence": "易", "analogy": "王力《古代汉语》"},
  {"front": "夷", "hl": "夷", "word": "夷", "meaning": "平，平坦。老子五十三章：\\\"大道甚～，而民好径。", "sentence": "塞井夷灶，陈於军中。", "analogy": "王力《古代汉语》"},
  {"front": "平", "hl": "平", "word": "平", "meaning": "平坦。汉书李广传：\\\"尚四五十里，得～地。", "sentence": "尚四五十里，得平地。", "analogy": "王力《古代汉语》"},
  {"front": "庸", "hl": "庸", "word": "庸", "meaning": "用。一般只见於\\\"无～\\\"这种固定形式。", "sentence": "无庸", "analogy": "王力《古代汉语》"},
  {"front": "已", "hl": "已", "word": "已", "meaning": "动词，停止。论语泰伯：\\\"死而后～。", "sentence": "必不得已而去，於斯三者何先？", "analogy": "王力《古代汉语》"},
  {"front": "必", "hl": "必", "word": "必", "meaning": "必", "sentence": "必有一死罪矣。", "analogy": "王力《古代汉语》"},
  {"front": "一", "hl": "一", "word": "一", "meaning": "基数。左传隐公元年：\\\"大都不过参国之～。", "sentence": "大都不过参国之一。", "analogy": "王力《古代汉语》"},
  {"front": "参", "hl": "参", "word": "参", "meaning": "读sān。三分。", "sentence": "大都不过参国之一。", "analogy": "王力《古代汉语》"},
  {"front": "什", "hl": "什", "word": "什", "meaning": "作为一个单位的十。军队中十人为\\\"什\\\"。", "sentence": "亦各置千长，百长，什长。", "analogy": "王力《古代汉语》"},
  {"front": "伯", "hl": "伯", "word": "伯", "meaning": "长（zhǎng），大的。孟子告子上：\\\"乡人长於～兄一岁，则谁敬？", "sentence": "乡人长於伯兄一岁，则谁敬？", "analogy": "王力《古代汉语》"},
  {"front": "晦", "hl": "晦", "word": "晦", "meaning": "阴历每月的最后一天。庄子逍遥游：\\\"朝菌不如～朔。", "sentence": "朝菌不如晦朔。", "analogy": "王力《古代汉语》"},
  {"front": "朔", "hl": "朔", "word": "朔", "meaning": "阴历每月的初一。论语八佾：\\\"子贡欲去告～之饩羊。", "sentence": "子贡欲去告朔之饩羊。", "analogy": "王力《古代汉语》"},
  {"front": "时", "hl": "时", "word": "时", "meaning": "季节（指春，夏，秋，冬）。论语阳货：\\\"天何言哉？", "sentence": "天何言哉？四时行焉，百物生焉！", "analogy": "王力《古代汉语》"},
  {"front": "世", "hl": "世", "word": "世", "meaning": "三十年为一世。论语子路：\\\"如有王者，必～而后仁。", "sentence": "君子疾没世而名不称焉。", "analogy": "王力《古代汉语》"},
  {"front": "期", "hl": "期", "word": "期", "meaning": "一定的时间，期限。诗经王风君子于役：\\\"君子于役，不知其～。", "sentence": "君子于役，不知其期。", "analogy": "王力《古代汉语》"},
  {"front": "官", "hl": "官", "word": "官", "meaning": "行政机关（指处所）。论语子张：\\\"不见宗庙之美，百～之富。", "sentence": "不见宗庙之美，百官之富。", "analogy": "王力《古代汉语》"},
  {"front": "爵", "hl": "爵", "word": "爵", "meaning": "古代酒器之一种。左传庄公二十三年：\\\"虢公请器，王与之～。", "sentence": "虢公请器，王与之爵。", "analogy": "王力《古代汉语》"},
  {"front": "权", "hl": "权", "word": "权", "meaning": "秤，秤锤。庄子胠箧：\\\"为之～衡以称之。", "sentence": "为之权衡以称之。", "analogy": "王力《古代汉语》"},
  {"front": "衡", "hl": "衡", "word": "衡", "meaning": "驾车用的工具，轭上的横木。庄子马蹄：\\\"夫加之以～扼。", "sentence": "欲以区区之越与天子抗衡为敌国。", "analogy": "王力《古代汉语》"},
  {"front": "果", "hl": "果", "word": "果", "meaning": "果子，果实。礼记曲礼上：\\\"赐～於君前。", "sentence": "赐果於君前。", "analogy": "王力《古代汉语》"},
  {"front": "实", "hl": "实", "word": "实", "meaning": "果实，种子。庄子逍遥游：\\\"魏王贻我大瓠之种，我树之成，而～五石。", "sentence": "魏王贻我大瓠之种，我树之成，而实五石。", "analogy": "王力《古代汉语》"},
  {"front": "聪", "hl": "聪", "word": "聪", "meaning": "聪", "sentence": "聋", "analogy": "王力《古代汉语》"},
  {"front": "明", "hl": "明", "word": "明", "meaning": "亮，光明。诗经齐风鸡鸣：\\\"东方～矣。", "sentence": "东方明矣。", "analogy": "王力《古代汉语》"},
  {"front": "功", "hl": "功", "word": "功", "meaning": "功", "sentence": "载缵武功。", "analogy": "王力《古代汉语》"},
  {"front": "名", "hl": "名", "word": "名", "meaning": "名字。庄子逍遥游：\\\"其～为鲲。", "sentence": "其名为鲲。", "analogy": "王力《古代汉语》"},
  {"front": "北", "hl": "北", "word": "北", "meaning": "北方。庄子逍遥游：\\\"穷发之～，有冥海者，天池也。", "sentence": "穷发之北，有冥海者，天池也。", "analogy": "王力《古代汉语》"},
  {"front": "中", "hl": "中", "word": "中", "meaning": "内部，中间，中心。论语季氏：\\\"龟玉毁於椟～，是谁之过与？", "sentence": "龟玉毁於椟中，是谁之过与？", "analogy": "王力《古代汉语》"},
  {"front": "下", "hl": "下", "word": "下", "meaning": "形容词。下面的，下级的。", "sentence": "上", "analogy": "王力《古代汉语》"},
  {"front": "遵", "hl": "遵", "word": "遵", "meaning": "遵", "sentence": "遵彼微行。", "analogy": "王力《古代汉语》"},
  {"front": "徂", "hl": "徂", "word": "徂", "meaning": "徂", "sentence": "自我徂尔，三岁食贫。", "analogy": "王力《古代汉语》"},
  {"front": "征", "hl": "征", "word": "征", "meaning": "远行。左传僖公四年：\\\"昭王南～而不复。", "sentence": "昭王南征而不复。", "analogy": "王力《古代汉语》"},
  {"front": "归", "hl": "归", "word": "归", "meaning": "女子出嫁。诗经周南桃夭：\\\"之子于～，宜其室家。", "sentence": "之子于归，宜其室家。", "analogy": "王力《古代汉语》"},
  {"front": "陟", "hl": "陟", "word": "陟", "meaning": "陟", "sentence": "陟彼高冈。", "analogy": "王力《古代汉语》"},
  {"front": "降", "hl": "降", "word": "降", "meaning": "读jiàng。从高处走下来，跟\\\"陟\\\"相对。", "sentence": "陟", "analogy": "王力《古代汉语》"},
  {"front": "流", "hl": "流", "word": "流", "meaning": "水流动。孟子滕文公上：\\\"洪水横～。", "sentence": "管叔及其群弟乃流言于国。", "analogy": "王力《古代汉语》"},
  {"front": "放", "hl": "放", "word": "放", "meaning": "驱逐。战国策齐策四：\\\"齐～其大臣孟尝君於诸侯。", "sentence": "齐放其大臣孟尝君於诸侯。", "analogy": "王力《古代汉语》"},
  {"front": "游", "hl": "游", "word": "游", "meaning": "闲逛，随意旅行。楚辞渔父：\\\"屈原既放，～於江潭。", "sentence": "宁诛锄草茅以力耕乎？将游大人以成名乎？", "analogy": "王力《古代汉语》"},
  {"front": "浮", "hl": "浮", "word": "浮", "meaning": "浮", "sentence": "沉", "analogy": "王力《古代汉语》"},
  {"front": "集", "hl": "集", "word": "集", "meaning": "鸟群停在树上。诗经唐风鸨羽：\\\"肃肃鸨羽，～于苞栩。", "sentence": "沙鸥翔集。", "analogy": "王力《古代汉语》"},
  {"front": "采", "hl": "采", "word": "采", "meaning": "用手指摘取。诗经周南关雎：\\\"参差荇菜，左右～之。", "sentence": "参差荇菜，左右采之。", "analogy": "王力《古代汉语》"},
  {"front": "叔", "hl": "叔", "word": "叔", "meaning": "用手拾取。诗经豳风七月：\\\"九月～苴。", "sentence": "九月叔苴。", "analogy": "王力《古代汉语》"},
  {"front": "振", "hl": "振", "word": "振", "meaning": "摇动，抖动。诗经豳风七月：\\\"六月莎鸡～羽。", "sentence": "振长策而御宇内。", "analogy": "王力《古代汉语》"},
  {"front": "援", "hl": "援", "word": "援", "meaning": "援", "sentence": "嫂溺援之以手。", "analogy": "王力《古代汉语》"},
  {"front": "操", "hl": "操", "word": "操", "meaning": "拿住，握在手里。楚辞国殇：\\\"～吴戈兮被犀甲。", "sentence": "操吴戈兮被犀甲。", "analogy": "王力《古代汉语》"},
  {"front": "秉", "hl": "秉", "word": "秉", "meaning": "禾把。诗经小雅大田：\\\"彼有遗～，此有滞穗。", "sentence": "岂不以僧有多稌之期，友无遗秉之报？", "analogy": "王力《古代汉语》"},
  {"front": "举", "hl": "举", "word": "举", "meaning": "举起来，抬起来。孟子梁惠王上：\\\"吾力足以～百钧，而不足以～一羽。", "sentence": "吾力足以举百钧，而不足以举一羽。", "analogy": "王力《古代汉语》"},
  {"front": "斯", "hl": "斯", "word": "斯", "meaning": "砍。诗经陈风墓门：\\\"墓门有棘，斧以～之。", "sentence": "墓门有棘，斧以斯之。", "analogy": "王力《古代汉语》"},
  {"front": "伐", "hl": "伐", "word": "伐", "meaning": "砍，砍伐。诗经周南汝坟：\\\"～其条枚。", "sentence": "伐其条枚。", "analogy": "王力《古代汉语》"},
  {"front": "稼", "hl": "稼", "word": "稼", "meaning": "禾的穗和果实。诗经豳风七月：\\\"十月纳禾～。", "sentence": "十月纳禾稼。", "analogy": "王力《古代汉语》"},
  {"front": "穑", "hl": "穑", "word": "穑", "meaning": "穑", "sentence": "稼穑", "analogy": "王力《古代汉语》"},
  {"front": "获", "hl": "获", "word": "获", "meaning": "获", "sentence": "八月其获。", "analogy": "王力《古代汉语》"},
  {"front": "纳", "hl": "纳", "word": "纳", "meaning": "收，收进。跟\\\"出\\\"相对。", "sentence": "闭门不纳", "analogy": "王力《古代汉语》"},
  {"front": "交", "hl": "交", "word": "交", "meaning": "纵横交错，交叉。孟子滕文公上：\\\"兽蹄鸟迹之道，～於中国。", "sentence": "兽蹄鸟迹之道，交於中国。", "analogy": "王力《古代汉语》"},
  {"front": "错", "hl": "错", "word": "错", "meaning": "镶嵌。在金属器物上雕镂，然后将另一种熔金倾入，待冷却后，磨错使平。", "sentence": "错刀", "analogy": "王力《古代汉语》"},
  {"front": "被", "hl": "被", "word": "被", "meaning": "被子。楚辞招魂：\\\"翡翠珠～。", "sentence": "翡翠珠被。", "analogy": "王力《古代汉语》"},
  {"front": "任", "hl": "任", "word": "任", "meaning": "旧读rén，平声。负担。", "sentence": "是任是负。", "analogy": "王力《古代汉语》"},
  {"front": "负", "hl": "负", "word": "负", "meaning": "揹，载。庄子逍遥游：\\\"水之积也不厚，则其～大舟也无力。", "sentence": "水之积也不厚，则其负大舟也无力。", "analogy": "王力《古代汉语》"},
  {"front": "施", "hl": "施", "word": "施", "meaning": "施行，实行。论语为政：\\\"～於有政。", "sentence": "施於有政。", "analogy": "王力《古代汉语》"},
  {"front": "用", "hl": "用", "word": "用", "meaning": "使用，应用。诗经大雅公刘：\\\"酌之～匏。", "sentence": "酌之用匏。", "analogy": "王力《古代汉语》"},
  {"front": "制", "hl": "制", "word": "制", "meaning": "裁制〔衣裳〕。诗经豳风东山：\\\"～彼裳衣。", "sentence": "制彼裳衣。", "analogy": "王力《古代汉语》"},
  {"front": "怀", "hl": "怀", "word": "怀", "meaning": "想念。诗经周南卷耳：\\\"嗟我～人。", "sentence": "嗟我怀人。", "analogy": "王力《古代汉语》"},
  {"front": "慕", "hl": "慕", "word": "慕", "meaning": "慕", "sentence": "人少，则慕父母。", "analogy": "王力《古代汉语》"},
  {"front": "惩", "hl": "惩", "word": "惩", "meaning": "自己受创（失败教训）而知戒。诗经周颂小毖：\\\"予其～而毖后患。", "sentence": "予其惩而毖后患。", "analogy": "王力《古代汉语》"},
  {"front": "悼", "hl": "悼", "word": "悼", "meaning": "悼", "sentence": "静言思之，躬自悼矣！", "analogy": "王力《古代汉语》"},
  {"front": "淑", "hl": "淑", "word": "淑", "meaning": "淑", "sentence": "窈窕淑女，君子好逑。", "analogy": "王力《古代汉语》"},
  {"front": "幸", "hl": "幸", "word": "幸", "meaning": "逢凶化吉，免於灾祸，形容词。论语雍也：\\\"不～短命死矣。", "sentence": "善人在上，则国无幸民。", "analogy": "王力《古代汉语》"},
  {"front": "偷", "hl": "偷", "word": "偷", "meaning": "苟且，不严肃。楚辞离骚：\\\"惟夫党人之～乐兮。", "sentence": "惟夫党人之偷乐兮。", "analogy": "王力《古代汉语》"},
  {"front": "薄", "hl": "薄", "word": "薄", "meaning": "薄，跟\\\"厚\\\"相对。诗经小雅小旻：\\\"如临深渊，如履～冰。", "sentence": "厚", "analogy": "王力《古代汉语》"},
  {"front": "险", "hl": "险", "word": "险", "meaning": "险", "sentence": "苟有险，余必下推车。", "analogy": "王力《古代汉语》"},
  {"front": "阻", "hl": "阻", "word": "阻", "meaning": "阻", "sentence": "道阻且长。", "analogy": "王力《古代汉语》"},
  {"front": "悠", "hl": "悠", "word": "悠", "meaning": "思。诗经周南关雎：\\\"～哉～哉，辗转反侧。", "sentence": "悠哉悠哉，辗转反侧。", "analogy": "王力《古代汉语》"},
  {"front": "皇", "hl": "皇", "word": "皇", "meaning": "大。楚辞离骚：\\\"朕～考曰伯庸。", "sentence": "朕皇考曰伯庸。", "analogy": "王力《古代汉语》"},
  {"front": "永", "hl": "永", "word": "永", "meaning": "永", "sentence": "江之永矣，不可方思。", "analogy": "王力《古代汉语》"},
  {"front": "孔", "hl": "孔", "word": "孔", "meaning": "孔", "sentence": "我朱孔阳。", "analogy": "王力《古代汉语》"},
  {"front": "亟", "hl": "亟", "word": "亟", "meaning": "读qì，去声。屡次，频频。", "sentence": "亟请於武公。", "analogy": "王力《古代汉语》"},
  {"front": "庶", "hl": "庶", "word": "庶", "meaning": "多，繁多，众多。论语子路：\\\"～矣哉！\\\"现代有双音词\\\"富～\\\"。", "sentence": "庶矣哉！", "analogy": "王力《古代汉语》"},
  {"front": "裘", "hl": "裘", "word": "裘", "meaning": "裘", "sentence": "取彼狐狸，为公子裘。", "analogy": "王力《古代汉语》"},
  {"front": "褐", "hl": "褐", "word": "褐", "meaning": "褐", "sentence": "无衣无褐，何以卒岁？", "analogy": "王力《古代汉语》"},
  {"front": "裳", "hl": "裳", "word": "裳", "meaning": "裳", "sentence": "衣", "analogy": "王力《古代汉语》"},
  {"front": "庭", "hl": "庭", "word": "庭", "meaning": "堂前叫庭。诗经魏风伐檀：\\\"胡瞻尔～有县貆兮？", "sentence": "不出户庭。", "analogy": "王力《古代汉语》"},
  {"front": "宇", "hl": "宇", "word": "宇", "meaning": "屋檐。诗经豳风七月：\\\"八月在～。", "sentence": "八月在宇。", "analogy": "王力《古代汉语》"},
  {"front": "所", "hl": "所", "word": "所", "meaning": "处所。诗经卫风硕鼠：\\\"爰得我～。", "sentence": "爰得我所。", "analogy": "王力《古代汉语》"},
  {"front": "骖", "hl": "骖", "word": "骖", "meaning": "骖", "sentence": "载骖载驷。", "analogy": "王力《古代汉语》"},
  {"front": "驷", "hl": "驷", "word": "驷", "meaning": "驷", "sentence": "驷不及舌。", "analogy": "王力《古代汉语》"},
  {"front": "策", "hl": "策", "word": "策", "meaning": "竹制的马鞭子。贾谊过秦论上：\\\"振长～而御宇内。", "sentence": "振长策而御宇内。", "analogy": "王力《古代汉语》"},
  {"front": "矢", "hl": "矢", "word": "矢", "meaning": "箭。左传成公二年：\\\"自始合，而～贯余手及肘。", "sentence": "自始合，而矢贯余手及肘。", "analogy": "王力《古代汉语》"},
  {"front": "躬", "hl": "躬", "word": "躬", "meaning": "躬", "sentence": "万方有罪，罪在朕躬。", "analogy": "王力《古代汉语》"},
  {"front": "身", "hl": "身", "word": "身", "meaning": "躯干。论语乡党：\\\"长一～有半。", "sentence": "长一身有半。", "analogy": "王力《古代汉语》"},
  {"front": "领", "hl": "领", "word": "领", "meaning": "脖子。诗经卫风硕人：\\\"～如蝤蛴。", "sentence": "引领北望。", "analogy": "王力《古代汉语》"},
  {"front": "武", "hl": "武", "word": "武", "meaning": "足迹。诗经大雅生民：\\\"履帝～敏歆。", "sentence": "忽奔走以先后兮，及前王之踵武。", "analogy": "王力《古代汉语》"},
  {"front": "仇", "hl": "仇", "word": "仇", "meaning": "对，俦类，俦辈。诗经周南兔：\\\"公侯好～。", "sentence": "公侯好仇。", "analogy": "王力《古代汉语》"},
  {"front": "耦", "hl": "耦", "word": "耦", "meaning": "耦", "sentence": "长沮桀溺耦而耕。", "analogy": "王力《古代汉语》"},
  {"front": "征", "hl": "征", "word": "征", "meaning": "召。特指君召臣。", "sentence": "舜生三十征庸。", "analogy": "王力《古代汉语》"},
  {"front": "收", "hl": "收", "word": "收", "meaning": "逮捕。诗经大雅瞻卬：\\\"此宜无罪，女反～之。", "sentence": "此宜无罪，女反收之。", "analogy": "王力《古代汉语》"},
  {"front": "发", "hl": "发", "word": "发", "meaning": "把箭射出去。诗经召南驺虞：\\\"壹～五?br\\> 。", "sentence": "壹发五?br\\> 。", "analogy": "王力《古代汉语》"},
  {"front": "封", "hl": "封", "word": "封", "meaning": "加土培育树木。左传昭公二年：\\\"宿（季武子）不敢～殖此树。", "sentence": "引申为聚土筑坟。左传文公三年：", "analogy": "王力《古代汉语》"},
  {"front": "弃", "hl": "弃", "word": "弃", "meaning": "弃", "sentence": "弃人用犬，虽猛何为？", "analogy": "王力《古代汉语》"},
  {"front": "徙", "hl": "徙", "word": "徙", "meaning": "迁移。论语述而：\\\"闻义不能～，不善不能改，是吾忧也。", "sentence": "闻义不能徙，不善不能改，是吾忧也。", "analogy": "王力《古代汉语》"},
  {"front": "遗", "hl": "遗", "word": "遗", "meaning": "失掉。⊙殴确纾骸捌枞纭！币晡簦雎浴Ｊ芳腔匆鹾盍写骸吧蠛晾逯〖疲煜轮笫！彼韭砬ūㄈ伟彩椋骸按沃植荒苁啊广凇！?br\\>", "sentence": "其故家遗俗，流风善政，犹有存者。", "analogy": "王力《古代汉语》"},
  {"front": "失", "hl": "失", "word": "失", "meaning": "丧失，失掉，跟\\\"得\\\"相对。孟子公孙丑上：\\\"故久而后～之也。", "sentence": "得", "analogy": "王力《古代汉语》"},
  {"front": "存", "hl": "存", "word": "存", "meaning": "存在，不及物动词，跟\\\"亡\\\"相对。史记淮阴侯列传：\\\"置之亡地而后～。", "sentence": "亡", "analogy": "王力《古代汉语》"},
  {"front": "处", "hl": "处", "word": "处", "meaning": "读chǔ，居住。左传僖公四年：\\\"君～北海，寡人～南海。", "sentence": "君处北海，寡人处南海。", "analogy": "王力《古代汉语》"},
  {"front": "坐", "hl": "坐", "word": "坐", "meaning": "古人铺席於地，两膝着席，臀部压在脚跟上，叫做\\\"坐\\\"。论语乡党：\\\"席不正不～。", "sentence": "坐", "analogy": "王力《古代汉语》"},
  {"front": "遇", "hl": "遇", "word": "遇", "meaning": "碰见（不是约会的见面）。诗经郑风野有蔓草：\\\"邂逅相。", "sentence": "邂逅相。", "analogy": "王力《古代汉语》"},
  {"front": "接", "hl": "接", "word": "接", "meaning": "交接，接触。孟子梁惠王上：\\\"兵刃既～。", "sentence": "兵刃既接。", "analogy": "王力《古代汉语》"},
  {"front": "承", "hl": "承", "word": "承", "meaning": "捧着。左传成公十六年：\\\"使行人执榼～饮。", "sentence": "持节承诏。", "analogy": "王力《古代汉语》"},
  {"front": "扶", "hl": "扶", "word": "扶", "meaning": "扶", "sentence": "危而不持，颠而不扶。", "analogy": "王力《古代汉语》"},
  {"front": "刺", "hl": "刺", "word": "刺", "meaning": "扎，用尖长的武器杀伤。孟子梁惠王上：\\\"是何异於～人而杀之。", "sentence": "是何异於刺人而杀之。", "analogy": "王力《古代汉语》"},
  {"front": "折", "hl": "折", "word": "折", "meaning": "读zhé，及物动词。把东西弄断。", "sentence": "折北不救。", "analogy": "王力《古代汉语》"},
  {"front": "戮", "hl": "戮", "word": "戮", "meaning": "杀，处决，处以死刑。左传成公三年：\\\"首其请於寡君而以～於宗。", "sentence": "首其请於寡君而以戮於宗。", "analogy": "王力《古代汉语》"},
  {"front": "问", "hl": "问", "word": "问", "meaning": "提出问题，询问。左传隐公元年：\\\"敢～何谓也？", "sentence": "敢问何谓也？", "analogy": "王力《古代汉语》"},
  {"front": "对", "hl": "对", "word": "对", "meaning": "回答在上的提问。左传隐公元年：\\\"公问之。", "sentence": "公问之。对曰：\\'小人有母，皆尝小人之食矣，未尝君之羹。\\'", "analogy": "王力《古代汉语》"},
  {"front": "许", "hl": "许", "word": "许", "meaning": "应允，跟\\\"辞\\\"相对。左传隐公元年：\\\"亟请於武公，公弗～。", "sentence": "辞", "analogy": "王力《古代汉语》"},
  {"front": "省", "hl": "省", "word": "省", "meaning": "读xǐng。视，视察，察看。", "sentence": "命有司省囹圄，去桎梏。", "analogy": "王力《古代汉语》"},
  {"front": "审", "hl": "审", "word": "审", "meaning": "详细，详尽。礼记中庸：\\\"博学之，～问之。", "sentence": "博学之，审问之。", "analogy": "王力《古代汉语》"},
  {"front": "虑", "hl": "虑", "word": "虑", "meaning": "虑", "sentence": "人无远虑，必有近忧。", "analogy": "王力《古代汉语》"},
  {"front": "怨", "hl": "怨", "word": "怨", "meaning": "心怀不满，埋怨，抱怨。左传襄公三十一年：\\\"我闻忠善以损～，不闻作威以防～。", "sentence": "我闻忠善以损怨，不闻作威以防怨。", "analogy": "王力《古代汉语》"},
  {"front": "忍", "hl": "忍", "word": "忍", "meaning": "忍耐。左传成公二年：\\\"吾子～之。", "sentence": "吾子忍之。", "analogy": "王力《古代汉语》"},
  {"front": "快", "hl": "快", "word": "快", "meaning": "快", "sentence": "然后快於心与？", "analogy": "王力《古代汉语》"},
  {"front": "兴", "hl": "兴", "word": "兴", "meaning": "起，起来。论语卫灵公：\\\"从者病，莫能～。", "sentence": "从者病，莫能兴。", "analogy": "王力《古代汉语》"},
  {"front": "废", "hl": "废", "word": "废", "meaning": "舍弃，停止，废弃。论语微子：\\\"长幼之节不可～也。", "sentence": "长幼之节不可废也。", "analogy": "王力《古代汉语》"},
  {"front": "变", "hl": "变", "word": "变", "meaning": "改变，变动，变化。战国策楚策四：\\\"襄王闻之，颜色～作。", "sentence": "襄王闻之，颜色变作。", "analogy": "王力《古代汉语》"},
  {"front": "曲", "hl": "曲", "word": "曲", "meaning": "弯曲。跟\\\"直\\\"相对。", "sentence": "直", "analogy": "王力《古代汉语》"},
  {"front": "直", "hl": "直", "word": "直", "meaning": "不弯曲，跟\\\"曲\\\"相对，又跟\\\"枉\\\"相对。荀子劝学：\\\"木～中绳。", "sentence": "能使枉者直。", "analogy": "王力《古代汉语》"},
  {"front": "长", "hl": "长", "word": "长", "meaning": "长，跟\\\"短\\\"相对。诗经秦风蒹葭：\\\"道阻且～。", "sentence": "短", "analogy": "王力《古代汉语》"},
  {"front": "小", "hl": "小", "word": "小", "meaning": "小", "sentence": "大", "analogy": "王力《古代汉语》"},
  {"front": "贪", "hl": "贪", "word": "贪", "meaning": "贪", "sentence": "廉", "analogy": "王力《古代汉语》"},
  {"front": "廉", "hl": "廉", "word": "廉", "meaning": "堂的边。仪礼乡饮酒：\\\"设席于堂～东上。", "sentence": "设席于堂廉东上。", "analogy": "王力《古代汉语》"},
  {"front": "轻", "hl": "轻", "word": "轻", "meaning": "轻", "sentence": "重", "analogy": "王力《古代汉语》"},
  {"front": "重", "hl": "重", "word": "重", "meaning": "读zhòng，分量大，跟\\\"轻\\\"相对。孟子滕文公上：\\\"麻缕丝絮轻～同，则贾相若。", "sentence": "轻", "analogy": "王力《古代汉语》"},
  {"front": "狂", "hl": "狂", "word": "狂", "meaning": "狗发疯。晋书五行志：\\\"早岁，犬多～死。", "sentence": "狂妄", "analogy": "王力《古代汉语》"},
  {"front": "殆", "hl": "殆", "word": "殆", "meaning": "危险。庄子秋水：\\\"吾非至於子之门，则～矣。", "sentence": "吾非至於子之门，则殆矣。", "analogy": "王力《古代汉语》"},
  {"front": "危", "hl": "危", "word": "危", "meaning": "高。庄子盗跖：\\\"使子路去其～冠，解其长剑。", "sentence": "使子路去其危冠，解其长剑。", "analogy": "王力《古代汉语》"},
  {"front": "面", "hl": "面", "word": "面", "meaning": "脸。庄子秋水：\\\"於是焉河伯始旋其～目。", "sentence": "於是焉河伯始旋其面目。", "analogy": "王力《古代汉语》"},
  {"front": "口", "hl": "口", "word": "口", "meaning": "嘴。孟子梁惠王上：\\\"为肥甘不足於～与？", "sentence": "山有小口，仿佛若有光。", "analogy": "王力《古代汉语》"},
  {"front": "齿", "hl": "齿", "word": "齿", "meaning": "排列於唇前的牙。左传僖公五年：\\\"唇亡～寒者，其虞虢之谓也。", "sentence": "唇亡齿寒者，其虞虢之谓也。", "analogy": "王力《古代汉语》"},
  {"front": "耳", "hl": "耳", "word": "耳", "meaning": "耳朵。荀子劝学：\\\"～不能两听而聪。", "sentence": "耳不能两听而聪。", "analogy": "王力《古代汉语》"},
  {"front": "目", "hl": "目", "word": "目", "meaning": "眼。荀子劝学：\\\"～不能两视而明。", "sentence": "目不能两视而明。", "analogy": "王力《古代汉语》"},
  {"front": "指", "hl": "指", "word": "指", "meaning": "手指，名词。庄子骈拇：\\\"骈拇枝～，出乎性哉。", "sentence": "骈拇枝指，出乎性哉。", "analogy": "王力《古代汉语》"},
  {"front": "饭", "hl": "饭", "word": "饭", "meaning": "动词，吃［饭］，论语述而：\\\"～疏食，饮水。\\\"又使动用法，给饭吃。", "sentence": "饭疏食，饮水。", "analogy": "王力《古代汉语》"},
  {"front": "食", "hl": "食", "word": "食", "meaning": "吃。左传隐公元年：\\\"～舍肉。", "sentence": "食舍肉。", "analogy": "王力《古代汉语》"},
  {"front": "服", "hl": "服", "word": "服", "meaning": "事，特指政务。诗经大雅荡：\\\"曾是在位，曾是在～。", "sentence": "服官政。", "analogy": "王力《古代汉语》"},
  {"front": "饰", "hl": "饰", "word": "饰", "meaning": "打扮，装饰。论语乡党：\\\"君子不以绀緅～。", "sentence": "夫铅黛所以饰容。", "analogy": "王力《古代汉语》"},
  {"front": "布", "hl": "布", "word": "布", "meaning": "麻布。古代\\\"布帛\\\"并称，丝织品称\\\"帛\\\"，麻织品称\\\"布\\\"。", "sentence": "布帛", "analogy": "王力《古代汉语》"},
  {"front": "斗", "hl": "斗", "word": "斗", "meaning": "有柄的酒器。诗经大雅行苇：\\\"酌以大～。", "sentence": "玉斗一双，欲与亚父。", "analogy": "王力《古代汉语》"},
  {"front": "式", "hl": "式", "word": "式", "meaning": "法式，楷模。伪古文尚书微子之命：\\\"万邦作～。", "sentence": "万邦作式。", "analogy": "王力《古代汉语》"},
  {"front": "检", "hl": "检", "word": "检", "meaning": "法则，法度，方式。曹丕典论论文：\\\"曲度虽均，节奏同～。", "sentence": "曲度虽均，节奏同检。", "analogy": "王力《古代汉语》"},
  {"front": "英", "hl": "英", "word": "英", "meaning": "花。诗经郑风有女同车：\\\"颜如舜～。", "sentence": "朝饮木兰之坠露兮，夕餐秋菊之落英。", "analogy": "王力《古代汉语》"},
  {"front": "灵", "hl": "灵", "word": "灵", "meaning": "事神的女巫。楚辞九歌东皇太一：\\\"～偃蹇兮姣服。", "sentence": "灵连蜷兮既留。", "analogy": "王力《古代汉语》"},
  {"front": "豪", "hl": "豪", "word": "豪", "meaning": "长而尖锐的毛。庄子齐物论：\\\"天下莫大於秋～之末。", "sentence": "天下莫大於秋豪之末。", "analogy": "王力《古代汉语》"},
  {"front": "然", "hl": "然", "word": "然", "meaning": "烧，引火点着。孟子公孙丑上：\\\"若火之始～，泉之始达。", "sentence": "若火之始然，泉之始达。", "analogy": "王力《古代汉语》"},
  {"front": "且", "hl": "且", "word": "且", "meaning": "连词。而且。", "sentence": "公语之故，且告之悔。", "analogy": "王力《古代汉语》"},
  {"front": "或", "hl": "或", "word": "或", "meaning": "无定代词，表示\\\"有人\\\"，但不知道姓名，或不指称姓名。孟子公孙丑上：\\\"～问乎曾西曰。", "sentence": "有人", "analogy": "王力《古代汉语》"},
  {"front": "曾", "hl": "曾", "word": "曾", "meaning": "读zēng。祖之父为\\\"曾祖\\\"，孙之子为\\\"曾孙\\\"。", "sentence": "曾祖", "analogy": "王力《古代汉语》"},
  {"front": "更", "hl": "更", "word": "更", "meaning": "读gēng，平声，改变。论语子张：\\\"君子之过也，如日月之食焉。", "sentence": "君子之过也，如日月之食焉。过也，人皆见之；更也，人皆仰之。", "analogy": "王力《古代汉语》"},
  {"front": "渐", "hl": "渐", "word": "渐", "meaning": "流入。尚书禹贡：\\\"东～于海。", "sentence": "东渐于海。", "analogy": "王力《古代汉语》"},
  {"front": "俱", "hl": "俱", "word": "俱", "meaning": "动词，在一起，同去或同来。史记魏公子列传：\\\"臣客屠者朱亥可与～。", "sentence": "臣客屠者朱亥可与俱。", "analogy": "王力《古代汉语》"},
  {"front": "并", "hl": "并", "word": "并", "meaning": "动词，平行，平列。庄子马蹄：\\\"族与万物～。", "sentence": "并殷周之迹。", "analogy": "王力《古代汉语》"},
  {"front": "而", "hl": "而", "word": "而", "meaning": "连词。连接两种性质或两种行为。", "sentence": "温故而知新。", "analogy": "王力《古代汉语》"},
  {"front": "若", "hl": "若", "word": "若", "meaning": "动词，像。论语宪问：\\\"岂～匹夫匹妇之为谅也？", "sentence": "岂若匹夫匹妇之为谅也？", "analogy": "王力《古代汉语》"},
  {"front": "尔", "hl": "尔", "word": "尔", "meaning": "代词。你，你们", "sentence": "尔爱其羊，我爱其礼。", "analogy": "王力《古代汉语》"},
  {"front": "建", "hl": "建", "word": "建", "meaning": "竖立。老子五十四章：\\\"善～者不拔。", "sentence": "建鼓整列。", "analogy": "王力《古代汉语》"},
  {"front": "置", "hl": "置", "word": "置", "meaning": "安放，放，安置。史记项羽本纪：\\\"项王则受璧，～之坐上。", "sentence": "项王则受璧，置之坐上。", "analogy": "王力《古代汉语》"},
  {"front": "罢", "hl": "罢", "word": "罢", "meaning": "停止。论语子罕：\\\"欲～不能。", "sentence": "欲罢不能。", "analogy": "王力《古代汉语》"},
  {"front": "学", "hl": "学", "word": "学", "meaning": "学习。论语述而：\\\"～而不厌。", "sentence": "学而不厌。", "analogy": "王力《古代汉语》"},
  {"front": "养", "hl": "养", "word": "养", "meaning": "养", "sentence": "矜寡孤独废疾者皆有所养。", "analogy": "王力《古代汉语》"},
  {"front": "干", "hl": "干", "word": "干", "meaning": "盾牌。礼记檀弓下：\\\"能执～戈，以卫社稷。", "sentence": "能执干戈，以卫社稷。", "analogy": "王力《古代汉语》"},
  {"front": "谒", "hl": "谒", "word": "谒", "meaning": "谒", "sentence": "惟我郑国之有请谒焉。", "analogy": "王力《古代汉语》"},
  {"front": "徇", "hl": "徇", "word": "徇", "meaning": "巡行，特指巡行以示众。左传僖公二十八年：\\\"杀颠颉以～於师。", "sentence": "杀颠颉以徇於师。", "analogy": "王力《古代汉语》"},
  {"front": "矫", "hl": "矫", "word": "矫", "meaning": "揉曲使直。荀子性恶：\\\"故枸木必将待 栝烝～然后直。", "sentence": "矫", "analogy": "王力《古代汉语》"},
  {"front": "效", "hl": "效", "word": "效", "meaning": "致，呈献。史记淮阴侯列传：\\\"诸将～首虏。", "sentence": "愿效愚忠。", "analogy": "王力《古代汉语》"},
  {"front": "留", "hl": "留", "word": "留", "meaning": "留", "sentence": "王计必欲东，能用信，信即留。", "analogy": "王力《古代汉语》"},
  {"front": "遣", "hl": "遣", "word": "遣", "meaning": "派遣，差使，打发。史记项羽本纪：\\\"乃～其子宋襄相齐。", "sentence": "赠此遣岑寂。", "analogy": "王力《古代汉语》"},
  {"front": "逢", "hl": "逢", "word": "逢", "meaning": "遭遇。诗经邶风柏舟：\\\"～彼之怒。", "sentence": "若非群玉山头见，会向瑶台月下逢。", "analogy": "王力《古代汉语》"},
  {"front": "候", "hl": "候", "word": "候", "meaning": "守望，放哨。战国策秦策四：\\\"韩必为关中之～，......而魏亦关内～矣。", "sentence": "韩必为关中之候，......而魏亦关内候矣。", "analogy": "王力《古代汉语》"},
  {"front": "延", "hl": "延", "word": "延", "meaning": "引长，延长。左传成公十三年：\\\"君亦悔祸之～。", "sentence": "君亦悔祸之延。", "analogy": "王力《古代汉语》"},
  {"front": "胜", "hl": "胜", "word": "胜", "meaning": "读shēng，阴平声。动词，用於名词的前面。", "sentence": "沛公不胜桮杓。", "analogy": "王力《古代汉语》"},
  {"front": "守", "hl": "守", "word": "守", "meaning": "防守，保卫。跟攻相对。", "sentence": "凿斯池也，筑斯城也，与民守之。", "analogy": "王力《古代汉语》"},
  {"front": "破", "hl": "破", "word": "破", "meaning": "打破。及物动词。", "sentence": "皆沈船，破釜甑。", "analogy": "王力《古代汉语》"},
  {"front": "骑", "hl": "骑", "word": "骑", "meaning": "骑［马］。史记项羽本纪：\\\"骏马名骓，常～之。", "sentence": "骏马名骓，常骑之。", "analogy": "王力《古代汉语》"},
  {"front": "伏", "hl": "伏", "word": "伏", "meaning": "趴［在地上、床上等］。礼记曲礼上：\\\"寝毋～。", "sentence": "寝毋伏。", "analogy": "王力《古代汉语》"},
  {"front": "围", "hl": "围", "word": "围", "meaning": "环绕。庄子则阳：\\\"精至於无伦，大至於不可～。", "sentence": "精至於无伦，大至於不可围。", "analogy": "王力《古代汉语》"},
  {"front": "突", "hl": "突", "word": "突", "meaning": "很急速地向前冲或向外冲。王延寿鲁灵光殿赋序：\\\"盗贼奔～。", "sentence": "盗贼奔突。", "analogy": "王力《古代汉语》"},
  {"front": "禽", "hl": "禽", "word": "禽", "meaning": "鸟兽的总名。周易屯卦：\\\"即鹿无虞，以从～也。", "sentence": "五禽戏", "analogy": "王力《古代汉语》"},
  {"front": "纵", "hl": "纵", "word": "纵", "meaning": "释放。跟\\\"禽\\\"相对。", "sentence": "禽", "analogy": "王力《古代汉语》"},
  {"front": "购", "hl": "购", "word": "购", "meaning": "购", "sentence": "吾闻汉购我头千金，邑万户。", "analogy": "王力《古代汉语》"},
  {"front": "抑", "hl": "抑", "word": "抑", "meaning": "用手压，摁。跟扬相对。", "sentence": "高者抑之，下者举之。", "analogy": "王力《古代汉语》"},
  {"front": "按", "hl": "按", "word": "按", "meaning": "用手向下压，摁(èn)。汉书霍光传：\\\"田延年前离席～剑。", "sentence": "田延年前离席按剑。", "analogy": "王力《古代汉语》"},
  {"front": "拔", "hl": "拔", "word": "拔", "meaning": "拔起来，拔出来。老子五十四章：\\\"善建者不～。", "sentence": "善建者不拔。", "analogy": "王力《古代汉语》"},
  {"front": "擢", "hl": "擢", "word": "擢", "meaning": "拔。枚乘说吴王书：\\\"夫十围之木，始生如蘖，足可搔而绝，手可～而拔。", "sentence": "夫十围之木，始生如蘖，足可搔而绝，手可擢而拔。", "analogy": "王力《古代汉语》"},
  {"front": "挟", "hl": "挟", "word": "挟", "meaning": "挟", "sentence": "挟太山以超北海。", "analogy": "王力《古代汉语》"},
  {"front": "将", "hl": "将", "word": "将", "meaning": "奉，承。诗经周颂我将：\\\"我～我享，维羊维牛。", "sentence": "乍暖还寒时候，最难将息。", "analogy": "王力《古代汉语》"},
  {"front": "烝", "hl": "烝", "word": "烝", "meaning": "火气上升。荀子性恶：\\\"枸木必将待 栝～矫然后直（这里的\\\"烝\\\"实际上就是\\\"烘\\\"。", "sentence": "蒸", "analogy": "王力《古代汉语》"},
  {"front": "亨", "hl": "亨", "word": "亨", "meaning": "读hēng。通。", "sentence": "品物咸亨。", "analogy": "王力《古代汉语》"},
  {"front": "顾", "hl": "顾", "word": "顾", "meaning": "回头看。楚辞哀郢：\\\"过夏口而西浮兮，～龙门而不见。", "sentence": "过夏口而西浮兮，顾龙门而不见。", "analogy": "王力《古代汉语》"},
  {"front": "察", "hl": "察", "word": "察", "meaning": "观察，审察。孟子梁惠王上：\\\"～邻国之政，无如寡人之用心者。", "sentence": "察邻国之政，无如寡人之用心者。", "analogy": "王力《古代汉语》"},
  {"front": "裁", "hl": "裁", "word": "裁", "meaning": "裁［衣］。杜甫白丝行：\\\"～缝灭尽针线迹。", "sentence": "裁缝灭尽针线迹。", "analogy": "王力《古代汉语》"},
  {"front": "断", "hl": "断", "word": "断", "meaning": "及物动词。砍断，截断，剪断，锯断。", "sentence": "断木为杵。", "analogy": "王力《古代汉语》"},
  {"front": "奏", "hl": "奏", "word": "奏", "meaning": "进。庄子养生主：\\\"～刀騞然。", "sentence": "争奏酒炙。", "analogy": "王力《古代汉语》"},
  {"front": "委", "hl": "委", "word": "委", "meaning": "堆积［在地］。庄子养生主：\\\"如土～地。", "sentence": "如土委地。", "analogy": "王力《古代汉语》"},
  {"front": "捐", "hl": "捐", "word": "捐", "meaning": "除去，撤去。孟子万章上：\\\"父母使舜完廪，～阶。", "sentence": "父母使舜完廪，捐阶。", "analogy": "王力《古代汉语》"},
  {"front": "详", "hl": "详", "word": "详", "meaning": "详细，详尽。孟子离娄下：\\\"博学而～说之。", "sentence": "博学而详说之。", "analogy": "王力《古代汉语》"},
  {"front": "诈", "hl": "诈", "word": "诈", "meaning": "诈", "sentence": "诈", "analogy": "王力《古代汉语》"},
  {"front": "与", "hl": "与", "word": "与", "meaning": "给。跟\\\"取\\\"相对，又跟\\\"夺\\\"相对。", "sentence": "取", "analogy": "王力《古代汉语》"},
  {"front": "夺", "hl": "夺", "word": "夺", "meaning": "夺", "sentence": "即其卧内，上夺其印符。", "analogy": "王力《古代汉语》"},
  {"front": "至", "hl": "至", "word": "至", "meaning": "到。战国策齐策四：\\\"孟尝君就国於薛，未～百里，民扶老携幼，迎君道中。", "sentence": "孟尝君就国於薛，未至百里，民扶老携幼，迎君道中。", "analogy": "王力《古代汉语》"},
  {"front": "止", "hl": "止", "word": "止", "meaning": "站住，不走了。跟行相对。", "sentence": "或百步而后止，或五十步而后止。", "analogy": "王力《古代汉语》"},
  {"front": "寤", "hl": "寤", "word": "寤", "meaning": "寤", "sentence": "窈窕淑女，寤寐求之。", "analogy": "王力《古代汉语》"},
  {"front": "寐", "hl": "寐", "word": "寐", "meaning": "寐", "sentence": "寤寐求之。", "analogy": "王力《古代汉语》"},
  {"front": "恨", "hl": "恨", "word": "恨", "meaning": "恨", "sentence": "大王失职入汉中，秦民无不恨者。", "analogy": "王力《古代汉语》"},
  {"front": "惊", "hl": "惊", "word": "惊", "meaning": "惊", "sentence": "襄子至桥而马惊。", "analogy": "王力《古代汉语》"},
  {"front": "冀", "hl": "冀", "word": "冀", "meaning": "希望。离骚：\\\"～枝叶之峻茂兮。", "sentence": "冀枝叶之峻茂兮。", "analogy": "王力《古代汉语》"},
  {"front": "贵", "hl": "贵", "word": "贵", "meaning": "贵", "sentence": "贱", "analogy": "王力《古代汉语》"},
  {"front": "贱", "hl": "贱", "word": "贱", "meaning": "贱", "sentence": "方籴贱贩贵，逐什一之利。", "analogy": "王力《古代汉语》"},
  {"front": "壮", "hl": "壮", "word": "壮", "meaning": "壮年，指三十岁以上，未到老年。右传僖公三十年：\\\"臣之～也，犹不如人。", "sentence": "臣之壮也，犹不如人。", "analogy": "王力《古代汉语》"},
  {"front": "大", "hl": "大", "word": "大", "meaning": "大，跟\\\"小\\\"相对。孟子梁惠王上：\\\"以小易～，彼恶知之？", "sentence": "有大人之事，有小人之事。", "analogy": "王力《古代汉语》"},
  {"front": "多", "hl": "多", "word": "多", "meaning": "多。跟\\\"寡\\\"或\\\"少\\\"相对。", "sentence": "寡", "analogy": "王力《古代汉语》"},
  {"front": "笃", "hl": "笃", "word": "笃", "meaning": "厚。诗经唐风椒聊：\\\"实大且～。", "sentence": "实大且笃。", "analogy": "王力《古代汉语》"},
  {"front": "专", "hl": "专", "word": "专", "meaning": "专", "sentence": "管仲得君，如彼其专也。", "analogy": "王力《古代汉语》"},
  {"front": "壹", "hl": "壹", "word": "壹", "meaning": "专一，无二心。左传成公十三年：\\\"以惩不～。", "sentence": "以惩不壹。", "analogy": "王力《古代汉语》"},
  {"front": "稍", "hl": "稍", "word": "稍", "meaning": "副词。渐。", "sentence": "项王乃疑范增与汉有私，稍夺之权。", "analogy": "王力《古代汉语》"},
  {"front": "略", "hl": "略", "word": "略", "meaning": "划定疆界。左传昭公七年：\\\"天子经～。", "sentence": "天子经略。", "analogy": "王力《古代汉语》"},
  {"front": "犹", "hl": "犹", "word": "犹", "meaning": "同，如同。诗经召南小星：\\\"实命不～。", "sentence": "实命不犹。", "analogy": "王力《古代汉语》"},
  {"front": "阴", "hl": "阴", "word": "阴", "meaning": "山北为阴，水南为阴。诗经大雅公刘：\\\"相其～阳。", "sentence": "阴", "analogy": "王力《古代汉语》"},
  {"front": "阳", "hl": "阳", "word": "阳", "meaning": "山南为阳，水北为阳。诗经大雅公刘：\\\"相其阴～。", "sentence": "相其阴阳。", "analogy": "王力《古代汉语》"},
  {"front": "休", "hl": "休", "word": "休", "meaning": "休息。诗经周南汉广：\\\"南有乔木，不可～息。", "sentence": "南有乔木，不可休息。", "analogy": "王力《古代汉语》"},
  {"front": "咎", "hl": "咎", "word": "咎", "meaning": "灾祸。跟休相对。", "sentence": "盖闻天与弗取，反受其咎。", "analogy": "王力《古代汉语》"},
  {"front": "机", "hl": "机", "word": "机", "meaning": "发动弩的机关。（弩是用机关发射的弓。", "sentence": "言行君子之枢机。", "analogy": "王力《古代汉语》"},
  {"front": "要", "hl": "要", "word": "要", "meaning": "读yāo，阴平声。古\\\"腰\\\"字。", "sentence": "要", "analogy": "王力《古代汉语》"},
  {"front": "祖", "hl": "祖", "word": "祖", "meaning": "祖先。自父之父以上都称祖。", "sentence": "人道亲亲，故尊祖；尊祖，故敬宗。", "analogy": "王力《古代汉语》"},
  {"front": "宾", "hl": "宾", "word": "宾", "meaning": "宾客。诗经小雅鹿鸣：\\\"我有嘉～。", "sentence": "我有嘉宾。", "analogy": "王力《古代汉语》"},
  {"front": "郎", "hl": "郎", "word": "郎", "meaning": "官名。有侍郎，中郎，郎中等。", "sentence": "郎", "analogy": "王力《古代汉语》"},
  {"front": "男", "hl": "男", "word": "男", "meaning": "形容词。男性的。", "sentence": "乃生男子。", "analogy": "王力《古代汉语》"},
  {"front": "部", "hl": "部", "word": "部", "meaning": "动词。统率。", "sentence": "梁部署吴中豪杰为校尉、候、司马。", "analogy": "王力《古代汉语》"},
  {"front": "曹", "hl": "曹", "word": "曹", "meaning": "左右曹，加官之一种。汉书霍光传：\\\"稍迁诸～侍中。", "sentence": "稍迁诸曹侍中。", "analogy": "王力《古代汉语》"},
  {"front": "邻", "hl": "邻", "word": "邻", "meaning": "五家为邻。论语雍也：\\\"原思为之宰，与之粟九百，辞。", "sentence": "乡邻有斗者。", "analogy": "王力《古代汉语》"},
  {"front": "里", "hl": "里", "word": "里", "meaning": "二十五家为里。里是一个住宅区，里有里门。", "sentence": "无逾我里。", "analogy": "王力《古代汉语》"},
  {"front": "狱", "hl": "狱", "word": "狱", "meaning": "官司，诉讼。诗经召南行露：\\\"何以速我～？", "sentence": "何以速我狱？", "analogy": "王力《古代汉语》"},
  {"front": "阙", "hl": "阙", "word": "阙", "meaning": "读què。城门两边的高台和建筑物。", "sentence": "郑伯享王于阙西辟。", "analogy": "王力《古代汉语》"},
  {"front": "祠", "hl": "祠", "word": "祠", "meaning": "动词。春祭。", "sentence": "以三太牢祠昌邑哀王园庙。", "analogy": "王力《古代汉语》"},
  {"front": "第", "hl": "第", "word": "第", "meaning": "次第，次序。左传哀公十六年：\\\"楚国～，我死，令尹司马，非胜而谁？", "sentence": "平阳侯曹参身被七十创，攻城略地，功最多，宜第一。", "analogy": "王力《古代汉语》"},
  {"front": "屏", "hl": "屏", "word": "屏", "meaning": "国君宫门内当门的小墙。后汉书包咸传：\\\"每进见，锡以几杖，入～不趋。", "sentence": "每进见，锡以几杖，入屏不趋。", "analogy": "王力《古代汉语》"},
  {"front": "帐", "hl": "帐", "word": "帐", "meaning": "帐幕，特指军用的帐篷。史记项羽本纪：\\\"即其～中斩宋义头。", "sentence": "即其帐中斩宋义头。", "analogy": "王力《古代汉语》"},
  {"front": "壁", "hl": "壁", "word": "壁", "meaning": "墙。史记司马相如列传：\\\"家居徒四～立。", "sentence": "家居徒四壁立。", "analogy": "王力《古代汉语》"},
  {"front": "案", "hl": "案", "word": "案", "meaning": "木制的托盘，有脚，用来盛食物。史记万石君列传：\\\"对～不食。", "sentence": "对案不食。", "analogy": "王力《古代汉语》"},
  {"front": "字", "hl": "字", "word": "字", "meaning": "生子。周易屯卦：\\\"女子贞不～。", "sentence": "女子贞不字。", "analogy": "王力《古代汉语》"},
  {"front": "书", "hl": "书", "word": "书", "meaning": "划分界限。左传襄公四年：\\\"茫茫禹迹，～为九州。", "sentence": "茫茫禹迹，书为九州。", "analogy": "王力《古代汉语》"},
  {"front": "项", "hl": "项", "word": "项", "meaning": "脖子的后部。史记魏其武安侯列传：\\\"案灌夫～，令谢。", "sentence": "案灌夫项，令谢。", "analogy": "王力《古代汉语》"},
  {"front": "乳", "hl": "乳", "word": "乳", "meaning": "动词。生子。", "sentence": "乃徙武北海上无人处，使牧羝，羝乳乃得归。", "analogy": "王力《古代汉语》"},
  {"front": "体", "hl": "体", "word": "体", "meaning": "身体的各部分，如头、手、足、肩、背、股等。孟子公孙丑上：\\\"子夏、子游、子张皆有圣人之一～，冉牛、闵子、颜渊则具～而微。", "sentence": "王翳取其头，......最其后郎中骑杨喜、骑司马吕马童、郎中吕胜、杨武各得其一体；五人共会其体，皆是。", "analogy": "王力《古代汉语》"},
  {"front": "意", "hl": "意", "word": "意", "meaning": "名词。意思。", "sentence": "用君之心，行君之意。", "analogy": "王力《古代汉语》"},
  {"front": "谄", "hl": "谄", "word": "谄", "meaning": "谄", "sentence": "贫而无谄。", "analogy": "王力《古代汉语》"},
  {"front": "谀", "hl": "谀", "word": "谀", "meaning": "谀", "sentence": "灌夫为人刚直，使酒，不好面谀。", "analogy": "王力《古代汉语》"},
  {"front": "诬", "hl": "诬", "word": "诬", "meaning": "诬", "sentence": "天实置之，而二三子以为己力，不亦诬乎！", "analogy": "王力《古代汉语》"},
  {"front": "辩", "hl": "辩", "word": "辩", "meaning": "辩论。孟子滕文公下：\\\"予岂好～哉？", "sentence": "予岂好辩哉？予不得已也。", "analogy": "王力《古代汉语》"},
  {"front": "怜", "hl": "怜", "word": "怜", "meaning": "怜悯。邹阳狱中上梁王书：\\\"愿大王孰察，少加～焉。", "sentence": "愿大王孰察，少加怜焉。", "analogy": "王力《古代汉语》"},
  {"front": "闵", "hl": "闵", "word": "闵", "meaning": "忧患，伤心的事。诗经邶风柏舟：\\\"觏～既多，受侮不少。", "sentence": "觏闵既多，受侮不少。", "analogy": "王力《古代汉语》"},
  {"front": "吊", "hl": "吊", "word": "吊", "meaning": "善。诗经小雅节南山：\\\"昊天不～。", "sentence": "昊天不吊。", "analogy": "王力《古代汉语》"},
  {"front": "除", "hl": "除", "word": "除", "meaning": "宫殿的台阶。汉书李广苏建传：\\\"从至雍棫阳宫，扶辇下～，触柱折辕。", "sentence": "从至雍棫阳宫，扶辇下除，触柱折辕。", "analogy": "王力《古代汉语》"},
  {"front": "拜", "hl": "拜", "word": "拜", "meaning": "一种表示敬意的礼节。古人的拜是先跪下，头低到手，与心平。", "sentence": "卜偃使大夫拜。", "analogy": "王力《古代汉语》"},
  {"front": "营", "hl": "营", "word": "营", "meaning": "量地。东西量地为\\\"经\\\"，周围量地为\\\"营\\\"。", "sentence": "务一心营职，以求亲媚於主上。", "analogy": "王力《古代汉语》"},
  {"front": "务", "hl": "务", "word": "务", "meaning": "动词。致力於某事，从事於。", "sentence": "君子务本。", "analogy": "王力《古代汉语》"},
  {"front": "积", "hl": "积", "word": "积", "meaning": "积聚谷物。诗经周颂良耜：\\\"～之栗栗。", "sentence": "士卒死伤如积。", "analogy": "王力《古代汉语》"},
  {"front": "聚", "hl": "聚", "word": "聚", "meaning": "使民众聚居。左传隐公元年：\\\"大叔完～，缮甲兵，具卒乘。", "sentence": "大叔完聚，缮甲兵，具卒乘。", "analogy": "王力《古代汉语》"},
  {"front": "寻", "hl": "寻", "word": "寻", "meaning": "八尺。孟子滕文公下：\\\"枉尺而直～。", "sentence": "酒债寻常行处有。", "analogy": "王力《古代汉语》"},
  {"front": "迭", "hl": "迭", "word": "迭", "meaning": "迭", "sentence": "日居月诸，胡迭而微。", "analogy": "王力《古代汉语》"},
  {"front": "代", "hl": "代", "word": "代", "meaning": "更换，代替。左传庄公八年：\\\"及瓜而～。", "sentence": "及瓜而代。", "analogy": "王力《古代汉语》"},
  {"front": "替", "hl": "替", "word": "替", "meaning": "废。诗经小雅楚茨：\\\"子子孙孙，勿～引之。", "sentence": "子子孙孙，勿替引之。", "analogy": "王力《古代汉语》"},
  {"front": "成", "hl": "成", "word": "成", "meaning": "成为事实，实现。论语子路：\\\"见小利则大事不～。", "sentence": "见小利则大事不成。", "analogy": "王力《古代汉语》"},
  {"front": "遂", "hl": "遂", "word": "遂", "meaning": "成，顺利地做到。礼记月令：\\\"百事乃～。", "sentence": "禽兽成群，草木遂长。", "analogy": "王力《古代汉语》"},
  {"front": "系", "hl": "系", "word": "系", "meaning": "缚，捆绑，拴。孟子梁惠王下：\\\"～累其子弟。", "sentence": "百越之君俯首系颈。", "analogy": "王力《古代汉语》"},
  {"front": "累", "hl": "累", "word": "累", "meaning": "读léi，阳平声。大绳子，特指用来绑人的。", "sentence": "累", "analogy": "王力《古代汉语》"},
  {"front": "系", "hl": "系", "word": "系", "meaning": "挂。论语阳货：\\\"吾岂匏瓜也哉？", "sentence": "吾岂匏瓜也哉？焉能系而不食？", "analogy": "王力《古代汉语》"},
  {"front": "牵", "hl": "牵", "word": "牵", "meaning": "牵", "sentence": "有牵牛而过堂下者。", "analogy": "王力《古代汉语》"},
  {"front": "县", "hl": "县", "word": "县", "meaning": "读xuán，阳平声。悬挂，诗经魏风伐檀：\\\"胡瞻尔庭有～貆兮！\\\"枚乘上书谏吴王：\\\"上～无极之高，下垂不测之渊。", "sentence": "胡瞻尔庭有县貆兮！", "analogy": "王力《古代汉语》"},
  {"front": "结", "hl": "结", "word": "结", "meaning": "打结。老子二十七章：\\\"善闭无关楗而不可开，善～无绳约而不可解。", "sentence": "系绝於天，不可复结。", "analogy": "王力《古代汉语》"},
  {"front": "绝", "hl": "绝", "word": "绝", "meaning": "［绳索］断。枚乘上书谏吴王：\\\"系方～，又重镇之。", "sentence": "系方绝，又重镇之。", "analogy": "王力《古代汉语》"},
  {"front": "擅", "hl": "擅", "word": "擅", "meaning": "专有，持有，领有，占有。晁错论贵粟疏：\\\"爵者上之所～。", "sentence": "爵者上之所擅。", "analogy": "王力《古代汉语》"},
  {"front": "披", "hl": "披", "word": "披", "meaning": "剖开。邹阳狱中上梁王书：\\\"～心腹，见情素。", "sentence": "披心腹，见情素。", "analogy": "王力《古代汉语》"},
  {"front": "拉", "hl": "拉", "word": "拉", "meaning": "拉", "sentence": "范睢拉胁折齿於魏。", "analogy": "王力《古代汉语》"},
  {"front": "奸", "hl": "奸", "word": "奸", "meaning": "邪恶。左传僖公二十四年：\\\"弃德崇～。", "sentence": "弃德崇奸。", "analogy": "王力《古代汉语》"},
  {"front": "回", "hl": "回", "word": "回", "meaning": "转，掉转。楚辞离骚：\\\"～朕车以复路兮。", "sentence": "回朕车以复路兮。", "analogy": "王力《古代汉语》"},
  {"front": "雅", "hl": "雅", "word": "雅", "meaning": "鸟名。乌的一种。", "sentence": "鸦", "analogy": "王力《古代汉语》"},
  {"front": "俗", "hl": "俗", "word": "俗", "meaning": "社会习惯，社会风气。孟子公孙丑上：\\\"其故家遗～，流风善政，犹有存者。", "sentence": "其故家遗俗，流风善政，犹有存者。", "analogy": "王力《古代汉语》"},
  {"front": "公", "hl": "公", "word": "公", "meaning": "公家的（统治者的）。跟\\\"私\\\"相对。", "sentence": "私", "analogy": "王力《古代汉语》"},
  {"front": "私", "hl": "私", "word": "私", "meaning": "私人的。贾谊论积贮疏：\\\"公～之积，犹可哀痛。", "sentence": "公私之积，犹可哀痛。", "analogy": "王力《古代汉语》"},
  {"front": "偏", "hl": "偏", "word": "偏", "meaning": "不正。尚书洪范：\\\"无～无颇。", "sentence": "无偏无颇。", "analogy": "王力《古代汉语》"},
  {"front": "全", "hl": "全", "word": "全", "meaning": "完备，完全，齐备。枚乘上书谏吴王：\\\"臣闻得～者昌，失～者亡。", "sentence": "臣闻得全者昌，失全者亡。", "analogy": "王力《古代汉语》"},
  {"front": "独", "hl": "独", "word": "独", "meaning": "单独，孤独。礼记大学：\\\"故君子必慎其～也。", "sentence": "故君子必慎其独也。", "analogy": "王力《古代汉语》"},
  {"front": "特", "hl": "特", "word": "特", "meaning": "公牛。三国志魏志明帝纪：\\\"遣使者以～牛祠中狱。", "sentence": "遣使者以特牛祠中狱。", "analogy": "王力《古代汉语》"},
  {"front": "丑", "hl": "丑", "word": "丑", "meaning": "难看。后汉书梁鸿传：\\\"同县孟氏有女，状肥～而黑。", "sentence": "行莫丑於辱先。", "analogy": "王力《古代汉语》"},
  {"front": "陋", "hl": "陋", "word": "陋", "meaning": "陋", "sentence": "在陋巷，人不堪其忧，回也不改其乐。", "analogy": "王力《古代汉语》"},
  {"front": "秽", "hl": "秽", "word": "秽", "meaning": "荒芜。楚辞离骚：\\\"哀众芳之芜～。", "sentence": "哀众芳之芜秽。", "analogy": "王力《古代汉语》"},
  {"front": "玄", "hl": "玄", "word": "玄", "meaning": "黑中带赤。诗经豳风七月：\\\"八月载绩，载～载黄。", "sentence": "八月载绩，载玄载黄。", "analogy": "王力《古代汉语》"},
  {"front": "素", "hl": "素", "word": "素", "meaning": "没有染色的。诗经召南羔羊：\\\"～丝五紽。", "sentence": "素丝五紽。", "analogy": "王力《古代汉语》"},
  {"front": "白", "hl": "白", "word": "白", "meaning": "白色的。诗经秦风蒹葭：\\\"～露为霜。", "sentence": "白露为霜。", "analogy": "王力《古代汉语》"},
  {"front": "方", "hl": "方", "word": "方", "meaning": "两船平行。诗经周南汉广：\\\"江之永矣，不可～思。", "sentence": "江之永矣，不可方思。", "analogy": "王力《古代汉语》"},
  {"front": "夙", "hl": "夙", "word": "夙", "meaning": "早晨，清晨。常以\\\"夙夜\\\"连用。", "sentence": "夙夜", "analogy": "王力《古代汉语》"},
  {"front": "惟", "hl": "惟", "word": "惟", "meaning": "思想。诗经大雅生民：\\\"载谋载～。", "sentence": "载谋载惟。", "analogy": "王力《古代汉语》"},
  {"front": "霄", "hl": "霄", "word": "霄", "meaning": "霄", "sentence": "涉清霄而升遐兮。", "analogy": "王力《古代汉语》"},
  {"front": "汉", "hl": "汉", "word": "汉", "meaning": "水名。孟子滕文公上：\\\"决汝～，排淮泗，而注之江。", "sentence": "决汝汉，排淮泗，而注之江。", "analogy": "王力《古代汉语》"},
  {"front": "景", "hl": "景", "word": "景", "meaning": "日光。左思咏史诗：\\\"皓天舒白日，灵～耀神州。", "sentence": "皓天舒白日，灵景耀神州。", "analogy": "王力《古代汉语》"},
  {"front": "曜", "hl": "曜", "word": "曜", "meaning": "日光。水经注庐江水：\\\"晨光初散，则延～入石。", "sentence": "晨光初散，则延曜入石。", "analogy": "王力《古代汉语》"},
  {"front": "都", "hl": "都", "word": "都", "meaning": "大邑。左传隐公元年：\\\"～城过百雉，国之害也。", "sentence": "都城过百雉，国之害也。", "analogy": "王力《古代汉语》"},
  {"front": "邑", "hl": "邑", "word": "邑", "meaning": "国。在左传里，称别人的国为\\\"大国\\\"，自称为\\\"敝～。", "sentence": "大国", "analogy": "王力《古代汉语》"},
  {"front": "鄙", "hl": "鄙", "word": "鄙", "meaning": "边邑。左传隐公元年：\\\"既而大叔命西～北～贰於己。", "sentence": "既而大叔命西鄙北鄙贰於己。", "analogy": "王力《古代汉语》"},
  {"front": "边", "hl": "边", "word": "边", "meaning": "边疆。贾谊论积贮疏：\\\"卒然～境有急。", "sentence": "卒然边境有急。", "analogy": "王力《古代汉语》"},
  {"front": "塞", "hl": "塞", "word": "塞", "meaning": "读sài。边界上的险要地方。", "sentence": "凉秋九月，塞外草衰。", "analogy": "王力《古代汉语》"},
  {"front": "殷", "hl": "殷", "word": "殷", "meaning": "众，盛。诗经郑风溱洧：\\\"士与女，～其盈矣。", "sentence": "士与女，殷其盈矣。", "analogy": "王力《古代汉语》"},
  {"front": "周", "hl": "周", "word": "周", "meaning": "环绕。左传成公二年：\\\"逐之，三～华不注。", "sentence": "远而周知天下之故。", "analogy": "王力《古代汉语》"},
  {"front": "胡", "hl": "胡", "word": "胡", "meaning": "兽颈下垂的肉。诗经豳风狼跋：\\\"狼跋其～。", "sentence": "狼跋其胡。", "analogy": "王力《古代汉语》"},
  {"front": "虏", "hl": "虏", "word": "虏", "meaning": "俘获。史记淮阴侯列传：\\\"於是汉兵夹击，大破～赵军。", "sentence": "於是汉兵夹击，大破虏赵军。", "analogy": "王力《古代汉语》"},
  {"front": "戎", "hl": "戎", "word": "戎", "meaning": "兵器。礼记月令：\\\"乃教於田猎，以习五～。", "sentence": "伏戎於莽。", "analogy": "王力《古代汉语》"},
  {"front": "倡", "hl": "倡", "word": "倡", "meaning": "读chāng，阴平声。以歌舞演戏为业的人。", "sentence": "倡优畜之。", "analogy": "王力《古代汉语》"},
  {"front": "优", "hl": "优", "word": "优", "meaning": "扮演杂戏的人。左传襄公二十八年：\\\"士皆释甲束马而饮酒，且观～。", "sentence": "士皆释甲束马而饮酒，且观优。", "analogy": "王力《古代汉语》"},
  {"front": "伎", "hl": "伎", "word": "伎", "meaning": "技艺，才能。尚书泰誓：\\\"无他～。", "sentence": "无他伎。", "analogy": "王力《古代汉语》"},
  {"front": "宦", "hl": "宦", "word": "宦", "meaning": "当贵族的仆隶。左传宣公二年：\\\"～三年矣。", "sentence": "宦三年矣。", "analogy": "王力《古代汉语》"},
  {"front": "竖", "hl": "竖", "word": "竖", "meaning": "竖立。后汉书灵帝纪：\\\"槐树自拔倒～。", "sentence": "槐树自拔倒竖。", "analogy": "王力《古代汉语》"},
  {"front": "臧", "hl": "臧", "word": "臧", "meaning": "好，良好。诗经鄘风定之方中：\\\"卜云其吉，终焉允～。", "sentence": "邂逅相遇，与子偕臧。", "analogy": "王力《古代汉语》"},
  {"front": "获", "hl": "获", "word": "获", "meaning": "猎得［禽兽］。孟子滕文公下：\\\"终日而不～一禽。", "sentence": "终日而不获一禽。", "analogy": "王力《古代汉语》"},
  {"front": "禄", "hl": "禄", "word": "禄", "meaning": "天的赏赐，食福。诗经大雅既醉：\\\"天被尔～。", "sentence": "天被尔禄。", "analogy": "王力《古代汉语》"},
  {"front": "位", "hl": "位", "word": "位", "meaning": "位", "sentence": "朝廷有位。", "analogy": "王力《古代汉语》"},
  {"front": "产", "hl": "产", "word": "产", "meaning": "生，出生。孟子滕文公上：\\\"陈良，楚～也。", "sentence": "陈良，楚产也。", "analogy": "王力《古代汉语》"},
  {"front": "业", "hl": "业", "word": "业", "meaning": "业", "sentence": "故绝宾客之知，忘室家之业。", "analogy": "王力《古代汉语》"},
  {"front": "货", "hl": "货", "word": "货", "meaning": "财物，物资。孟子梁惠王下：\\\"寡人好～。", "sentence": "寡人好货。", "analogy": "王力《古代汉语》"},
  {"front": "赂", "hl": "赂", "word": "赂", "meaning": "财物。常以\\\"货赂\\\"二字连用。", "sentence": "货赂", "analogy": "王力《古代汉语》"},
  {"front": "资", "hl": "资", "word": "资", "meaning": "钱财。周易旅卦：\\\"怀其～。", "sentence": "怀其资。", "analogy": "王力《古代汉语》"},
  {"front": "财", "hl": "财", "word": "财", "meaning": "财物，钱财。韩非子说难：\\\"暮而果大亡其～。", "sentence": "暮而果大亡其财。", "analogy": "王力《古代汉语》"},
  {"front": "贿", "hl": "贿", "word": "贿", "meaning": "财物。诗经卫风氓：\\\"以尔车来，以我～迁。", "sentence": "以尔车来，以我贿迁。", "analogy": "王力《古代汉语》"},
  {"front": "性", "hl": "性", "word": "性", "meaning": "性", "sentence": "性相近也，习相远也。", "analogy": "王力《古代汉语》"},
  {"front": "情", "hl": "情", "word": "情", "meaning": "情", "sentence": "何谓人情？喜怒哀乐爱恶欲七者，不学而能。", "analogy": "王力《古代汉语》"},
  {"front": "声", "hl": "声", "word": "声", "meaning": "声音。孟子梁惠王上：\\\"闻其～不忍食其肉。", "sentence": "闻其声不忍食其肉。", "analogy": "王力《古代汉语》"},
  {"front": "响", "hl": "响", "word": "响", "meaning": "回声。贾谊过秦论上：\\\"天下云集～应。", "sentence": "影响", "analogy": "王力《古代汉语》"},
  {"front": "拳", "hl": "拳", "word": "拳", "meaning": "动词。握拳。", "sentence": "女两手皆拳。", "analogy": "王力《古代汉语》"},
  {"front": "脚", "hl": "脚", "word": "脚", "meaning": "脚", "sentence": "乳闲股脚。", "analogy": "王力《古代汉语》"},
  {"front": "端", "hl": "端", "word": "端", "meaning": "端正，正直。孟子离娄下：\\\"夫尹公之他，～人也。", "sentence": "夫尹公之他，端人也。", "analogy": "王力《古代汉语》"},
  {"front": "绪", "hl": "绪", "word": "绪", "meaning": "丝的头绪。易林兑之坎：\\\"丝多～乱，端不可得。", "sentence": "丝多绪乱，端不可得。", "analogy": "王力《古代汉语》"},
  {"front": "节", "hl": "节", "word": "节", "meaning": "竹节，木节。左思吴都赋：\\\"竹则苞笋抽～。", "sentence": "不遇槃根错节，何以别利器乎？", "analogy": "王力《古代汉语》"},
  {"front": "度", "hl": "度", "word": "度", "meaning": "读duò，去声。量长短。", "sentence": "度，然后知长短。", "analogy": "王力《古代汉语》"},
  {"front": "议", "hl": "议", "word": "议", "meaning": "发表言论。诗经小雅北山：\\\"或出入风～。", "sentence": "或出入风议。", "analogy": "王力《古代汉语》"},
  {"front": "论", "hl": "论", "word": "论", "meaning": "评论，研究。论语宪问：\\\"世叔讨～之。", "sentence": "世叔讨论之。", "analogy": "王力《古代汉语》"},
  {"front": "讽", "hl": "讽", "word": "讽", "meaning": "背诵。周礼春官大司乐：\\\"以乐语教国子兴道～诵言语。", "sentence": "以乐语教国子兴道讽诵言语。", "analogy": "王力《古代汉语》"},
  {"front": "贬", "hl": "贬", "word": "贬", "meaning": "灭损。左传僖公二十一年：\\\"～食省用。", "sentence": "贬食省用。", "analogy": "王力《古代汉语》"},
  {"front": "谪", "hl": "谪", "word": "谪", "meaning": "谴责，责怪。左传成公十七年：\\\"国子～我。", "sentence": "国子谪我。", "analogy": "王力《古代汉语》"},
  {"front": "斥", "hl": "斥", "word": "斥", "meaning": "屏弃，不用。汉书武帝纪：\\\"与闻国政而无益於民者～，在上位而不能进贤者退。", "sentence": "与闻国政而无益於民者斥，在上位而不能进贤者退。", "analogy": "王力《古代汉语》"},
  {"front": "宣", "hl": "宣", "word": "宣", "meaning": "散布，传播。杨恽报孙会宗书：\\\"曾不能以此时有所建树，以～德化。", "sentence": "君臣宣淫。", "analogy": "王力《古代汉语》"},
  {"front": "赠", "hl": "赠", "word": "赠", "meaning": "赠送。诗经秦风渭阳：\\\"何以～之？", "sentence": "何以赠之？琼瑰玉佩。", "analogy": "王力《古代汉语》"},
  {"front": "颠", "hl": "颠", "word": "颠", "meaning": "头顶。诗经秦风车邻：\\\"有马白～。", "sentence": "采苓采苓，首阳之颠。", "analogy": "王力《古代汉语》"},
  {"front": "覆", "hl": "覆", "word": "覆", "meaning": "反。诗经小雅小明：\\\"岂不怀归？", "sentence": "岂不怀归？畏此反覆。", "analogy": "王力《古代汉语》"},
  {"front": "率", "hl": "率", "word": "率", "meaning": "循，沿着。诗经大雅绵：\\\"～西水浒。", "sentence": "率西水浒。", "analogy": "王力《古代汉语》"},
  {"front": "诣", "hl": "诣", "word": "诣", "meaning": "诣", "sentence": "乘传诣长安。", "analogy": "王力《古代汉语》"},
  {"front": "历", "hl": "历", "word": "历", "meaning": "经过。司马迁报任安书：\\\"足～王庭。", "sentence": "足历王庭。", "analogy": "王力《古代汉语》"},
  {"front": "寓", "hl": "寓", "word": "寓", "meaning": "寓", "sentence": "诸侯不臣寓公。", "analogy": "王力《古代汉语》"},
  {"front": "寄", "hl": "寄", "word": "寄", "meaning": "寄", "sentence": "未有第宅，寄居丘亭。", "analogy": "王力《古代汉语》"},
  {"front": "禁", "hl": "禁", "word": "禁", "meaning": "禁止。韩非子五蠹：\\\"赏其功，必～无用。", "sentence": "赏其功，必禁无用。", "analogy": "王力《古代汉语》"},
  {"front": "戒", "hl": "戒", "word": "戒", "meaning": "警戒，防备。周易萃卦：\\\"～不虞。", "sentence": "戒不虞。", "analogy": "王力《古代汉语》"},
  {"front": "恃", "hl": "恃", "word": "恃", "meaning": "恃", "sentence": "无母何恃？", "analogy": "王力《古代汉语》"},
  {"front": "玩", "hl": "玩", "word": "玩", "meaning": "玩弄。伪古文尚书旅獒：\\\"～人丧德，～物丧志。", "sentence": "玩人丧德，玩物丧志。", "analogy": "王力《古代汉语》"},
  {"front": "肆", "hl": "肆", "word": "肆", "meaning": "陈设。诗经大雅行苇：\\\"或～之筵。", "sentence": "或肆或将。", "analogy": "王力《古代汉语》"},
  {"front": "敷", "hl": "敷", "word": "敷", "meaning": "敷", "sentence": "敷筵席。", "analogy": "王力《古代汉语》"},
  {"front": "化", "hl": "化", "word": "化", "meaning": "变化。周易乾卦：\\\"乾道变～。", "sentence": "所守或匪亲，化为狼与豺。", "analogy": "王力《古代汉语》"},
  {"front": "加", "hl": "加", "word": "加", "meaning": "把一物放在另一物的上面。左传昭公八年：\\\"～絰於颡而逃。", "sentence": "夫加之以衡轭。", "analogy": "王力《古代汉语》"},
  {"front": "损", "hl": "损", "word": "损", "meaning": "减少。跟益相对。", "sentence": "请损之，月攘一鸡。", "analogy": "王力《古代汉语》"},
  {"front": "刻", "hl": "刻", "word": "刻", "meaning": "雕刻。礼记哀公问：\\\"器不～镂。", "sentence": "器不刻镂。", "analogy": "王力《古代汉语》"},
  {"front": "勒", "hl": "勒", "word": "勒", "meaning": "套在马头上带嚼口的笼头。汉书匈奴传：\\\"鞌～一具。", "sentence": "白马嚼啮黄金勒。", "analogy": "王力《古代汉语》"},
  {"front": "郁", "hl": "郁", "word": "郁", "meaning": "茂盛的样子。诗经秦风晨风：\\\"～彼北林。", "sentence": "郁彼北林。", "analogy": "王力《古代汉语》"},
  {"front": "舒", "hl": "舒", "word": "舒", "meaning": "展开。跟卷相对。", "sentence": "赢缩卷舒。", "analogy": "王力《古代汉语》"},
  {"front": "张", "hl": "张", "word": "张", "meaning": "把弓弦绷紧。跟弛相对。", "sentence": "琴羽张兮箫鼓陈。", "analogy": "王力《古代汉语》"},
  {"front": "弛", "hl": "弛", "word": "弛", "meaning": "弛", "sentence": "乃弛弓而自后縛之。", "analogy": "王力《古代汉语》"},
  {"front": "是", "hl": "是", "word": "是", "meaning": "对的，合理的。跟非相对。", "sentence": "自以为是。", "analogy": "王力《古代汉语》"},
  {"front": "非", "hl": "非", "word": "非", "meaning": "不对的，不合理的。孟子公孙丑下：\\\"前日之不受是，则今日之受～也。", "sentence": "前日之不受是，则今日之受非也。", "analogy": "王力《古代汉语》"},
  {"front": "能", "hl": "能", "word": "能", "meaning": "动词。能够做到。", "sentence": "非曰能之，愿学焉。", "analogy": "王力《古代汉语》"},
  {"front": "可", "hl": "可", "word": "可", "meaning": "形容词。可以，能行。", "sentence": "子贡曰：\\'贫而无谄，富而无骄，何如？\\'子曰：\\'可也。未若贫而乐，富而好礼者也。\\'", "analogy": "王力《古代汉语》"},
  {"front": "以", "hl": "以", "word": "以", "meaning": "动词。用。", "sentence": "视其所以。", "analogy": "王力《古代汉语》"},
  {"front": "凡", "hl": "凡", "word": "凡", "meaning": "平凡，平庸。孟子尽心上：\\\"待文王而后兴者～民也。", "sentence": "仙凡路阻两难留。", "analogy": "王力《古代汉语》"},
  {"front": "圣", "hl": "圣", "word": "圣", "meaning": "圣", "sentence": "母氏圣善。", "analogy": "王力《古代汉语》"},
  {"front": "残", "hl": "残", "word": "残", "meaning": "动词。杀害，伤害，害。", "sentence": "岂不欲除残而佑仁。", "analogy": "王力《古代汉语》"},
  {"front": "暴", "hl": "暴", "word": "暴", "meaning": "读pù，去声，旧读入声。晒。", "sentence": "秋阳以暴之。", "analogy": "王力《古代汉语》"},
  {"front": "甘", "hl": "甘", "word": "甘", "meaning": "好吃，味美。孟子梁惠王上：\\\"为肥～不足於口与？", "sentence": "燕王吊死问孤，与百姓同甘苦。", "analogy": "王力《古代汉语》"},
  {"front": "辛", "hl": "辛", "word": "辛", "meaning": "辛", "sentence": "大苦咸酸，辛甘行些。", "analogy": "王力《古代汉语》"},
  {"front": "鲜", "hl": "鲜", "word": "鲜", "meaning": "读xiān。鲜鱼。", "sentence": "治大国若烹小鲜。", "analogy": "王力《古代汉语》"},
  {"front": "敝", "hl": "敝", "word": "敝", "meaning": "破烂。诗经郑风缁衣：\\\"缁衣之宜兮，～予又改为兮。", "sentence": "而考之无疵，用之无敝。", "analogy": "王力《古代汉语》"},
  {"front": "寒", "hl": "寒", "word": "寒", "meaning": "寒", "sentence": "岁寒，然后知松柏之后雕也。", "analogy": "王力《古代汉语》"},
  {"front": "温", "hl": "温", "word": "温", "meaning": "暖。墨子辞过：\\\"古之民，未知为衣服时，衣皮带茭，冬则不轻而～，夏则不轻而凊。", "sentence": "缯纩无温。", "analogy": "王力《古代汉语》"},
  {"front": "幽", "hl": "幽", "word": "幽", "meaning": "暗，深暗。跟明相对，又跟显相对。", "sentence": "出自幽谷，迁於乔木。", "analogy": "王力《古代汉语》"},
  {"front": "冥", "hl": "冥", "word": "冥", "meaning": "冥", "sentence": "哕哕其冥。", "analogy": "王力《古代汉语》"},
  {"front": "奥", "hl": "奥", "word": "奥", "meaning": "屋子里的西南角。论语八佾：\\\"与其媚於～，宁媚於灶。", "sentence": "与其媚於奥，宁媚於灶。", "analogy": "王力《古代汉语》"},
  {"front": "精", "hl": "精", "word": "精", "meaning": "上等细米。跟粗相对。", "sentence": "食不厌精。", "analogy": "王力《古代汉语》"},
  {"front": "众", "hl": "众", "word": "众", "meaning": "众", "sentence": "寡固不可以敌众。", "analogy": "王力《古代汉语》"},
  {"front": "便", "hl": "便", "word": "便", "meaning": "安。墨子天志中：\\\"百姓皆得暖衣饱食，～宁无忧。", "sentence": "百姓皆得暖衣饱食，便宁无忧。", "analogy": "王力《古代汉语》"},
  {"front": "嘉", "hl": "嘉", "word": "嘉", "meaning": "嘉", "sentence": "我有嘉宾。", "analogy": "王力《古代汉语》"},
  {"front": "遽", "hl": "遽", "word": "遽", "meaning": "传车，送信的快车或快马。左传僖公三十三年：\\\"且使～告於郑。", "sentence": "且使遽告於郑。", "analogy": "王力《古代汉语》"},
  {"front": "速", "hl": "速", "word": "速", "meaning": "快。礼记檀弓上：\\\"丧欲～贫，死欲～朽。", "sentence": "丧欲速贫，死欲速朽。", "analogy": "王力《古代汉语》"},
  {"front": "弥", "hl": "弥", "word": "弥", "meaning": "满。楚辞离骚：\\\"芳菲菲其～章。", "sentence": "芳菲菲其弥章。", "analogy": "王力《古代汉语》"},
  {"front": "愈", "hl": "愈", "word": "愈", "meaning": "病好了。孟子公孙丑下：\\\"昔者疾，今日～。", "sentence": "昔者疾，今日愈。", "analogy": "王力《古代汉语》"},
  {"front": "尤", "hl": "尤", "word": "尤", "meaning": "罪过，过失。论语为政：\\\"言寡～，行寡悔。", "sentence": "言寡尤，行寡悔。", "analogy": "王力《古代汉语》"},
  {"front": "极", "hl": "极", "word": "极", "meaning": "名词。原为房屋的脊檩（在房屋的最高处），引申为房梁。", "sentence": "其邻有夫妻臣妾登极者。", "analogy": "王力《古代汉语》"},
  {"front": "甚", "hl": "甚", "word": "甚", "meaning": "形容词。厉害，达到了很厉害的程度。", "sentence": "沐甚雨，栉疾风。", "analogy": "王力《古代汉语》"},
  {"front": "最", "hl": "最", "word": "最", "meaning": "最。庄子天下：\\\"然惠施之口谈，自以为～贤。", "sentence": "然惠施之口谈，自以为最贤。", "analogy": "王力《古代汉语》"},
  {"front": "夫", "hl": "夫", "word": "夫", "meaning": "成年男人。诗经周南兔罝：\\\"赳赳武～，公侯干城。", "sentence": "赳赳武夫，公侯干城。", "analogy": "王力《古代汉语》"},
  {"front": "妇", "hl": "妇", "word": "妇", "meaning": "妻。诗经卫风氓：\\\"三岁为～。", "sentence": "三岁为妇。", "analogy": "王力《古代汉语》"},
  {"front": "婴", "hl": "婴", "word": "婴", "meaning": "缠绕，被......缠着。司马迁报任安书：\\\"其次剔毛发，～金铁受辱。", "sentence": "其次剔毛发，婴金铁受辱。", "analogy": "王力《古代汉语》"},
  {"front": "孩", "hl": "孩", "word": "孩", "meaning": "小儿笑。老子二十章：\\\"如婴儿之未～。", "sentence": "孩提之童，莫不知爱其亲者。", "analogy": "王力《古代汉语》"},
  {"front": "亲", "hl": "亲", "word": "亲", "meaning": "父母。孟子梁惠王上：\\\"未有仁而遗其～者也。", "sentence": "亲戚为戮，不可以莫之报。", "analogy": "王力《古代汉语》"},
  {"front": "眷", "hl": "眷", "word": "眷", "meaning": "回顾而表示恋恋不舍。诗经大雅皇矣：\\\"乃～西顾。", "sentence": "乃眷西顾。", "analogy": "王力《古代汉语》"},
  {"front": "竹", "hl": "竹", "word": "竹", "meaning": "竹。诗经卫风淇奥：\\\"绿～青青。", "sentence": "绿竹青青。", "analogy": "王力《古代汉语》"},
  {"front": "木", "hl": "木", "word": "木", "meaning": "树。孟子梁惠王上：\\\"犹缘～而求鱼也。", "sentence": "犹缘木而求鱼也。", "analogy": "王力《古代汉语》"},
  {"front": "谷", "hl": "谷", "word": "谷", "meaning": "两山之间的溪流。公羊传僖公三年：\\\"无障～。", "sentence": "吾闻出於幽谷，迁於乔木者，未闻下乔木而入於幽谷者。", "analogy": "王力《古代汉语》"},
  {"front": "壑", "hl": "壑", "word": "壑", "meaning": "壑", "sentence": "溪壑可盈。", "analogy": "王力《古代汉语》"},
  {"front": "亭", "hl": "亭", "word": "亭", "meaning": "古代的一种公家房舍，建在路旁，以便旅客投宿，亭上有楼，以便侦察盗贼。汉承秦制，十里一亭。", "sentence": "常数从其下乡南昌亭长寄食。", "analogy": "王力《古代汉语》"},
  {"front": "台", "hl": "台", "word": "台", "meaning": "台。一种建筑物，筑土成正方形，高一丈以上，以便观望。", "sentence": "经始灵台，经之营之。", "analogy": "王力《古代汉语》"},
  {"front": "郊", "hl": "郊", "word": "郊", "meaning": "郊。上古时代，国都百里之外为郊。", "sentence": "跨马出郊时极目，不堪人事日萧条。", "analogy": "王力《古代汉语》"},
  {"front": "墟", "hl": "墟", "word": "墟", "meaning": "大丘。这个意义本写作\\\"虚\\\"。", "sentence": "虚", "analogy": "王力《古代汉语》"},
  {"front": "材", "hl": "材", "word": "材", "meaning": "木材。孟子梁惠王上：\\\"～木不可胜用也。", "sentence": "材木不可胜用也。", "analogy": "王力《古代汉语》"},
  {"front": "才", "hl": "才", "word": "才", "meaning": "才能。论语子路：\\\"举贤～。", "sentence": "举贤才。", "analogy": "王力《古代汉语》"},
  {"front": "簿", "hl": "簿", "word": "簿", "meaning": "册子，上面记录着审问的材料或罪人的供状。史记李将军列传：\\\"大将军使长史急责广之幕府对～。", "sentence": "大将军使长史急责广之幕府对簿。", "analogy": "王力《古代汉语》"},
  {"front": "籍", "hl": "籍", "word": "籍", "meaning": "文献，书籍。孟子万章下：\\\"诸侯恶其害己也，而皆去其～。", "sentence": "若夫姬公之籍，孔父之书。", "analogy": "王力《古代汉语》"},
  {"front": "状", "hl": "状", "word": "状", "meaning": "状", "sentence": "状如不觉。", "analogy": "王力《古代汉语》"},
  {"front": "类", "hl": "类", "word": "类", "meaning": "类", "sentence": "王之不王，是折枝之类也。", "analogy": "王力《古代汉语》"},
  {"front": "寿", "hl": "寿", "word": "寿", "meaning": "长命。诗经小雅天保：\\\"如南山之～。", "sentence": "如南山之寿。", "analogy": "王力《古代汉语》"},
  {"front": "命", "hl": "命", "word": "命", "meaning": "动词。命令。", "sentence": "命子封帅车二百乘以伐京。", "analogy": "王力《古代汉语》"},
  {"front": "志", "hl": "志", "word": "志", "meaning": "心的倾向，志向，志愿。论语公冶长：\\\"盍各言尔～。", "sentence": "盍各言尔志。", "analogy": "王力《古代汉语》"},
  {"front": "趣", "hl": "趣", "word": "趣", "meaning": "读qū。朝某一方向奔去。", "sentence": "趣舍异路。", "analogy": "王力《古代汉语》"},
  {"front": "涕", "hl": "涕", "word": "涕", "meaning": "涕", "sentence": "泣涕涟涟。", "analogy": "王力《古代汉语》"},
  {"front": "泣", "hl": "泣", "word": "泣", "meaning": "眼泪。史记项羽本纪：\\\"项羽～数行下。", "sentence": "项羽泣数行下。", "analogy": "王力《古代汉语》"},
  {"front": "膏", "hl": "膏", "word": "膏", "meaning": "膏", "sentence": "膏火自煎也。", "analogy": "王力《古代汉语》"},
  {"front": "泽", "hl": "泽", "word": "泽", "meaning": "水所聚的地方，一般指湖沼。孟子滕文公上：\\\"益烈山～而焚之。", "sentence": "益烈山泽而焚之。", "analogy": "王力《古代汉语》"},
  {"front": "帷", "hl": "帷", "word": "帷", "meaning": "帷", "sentence": "今人主沈谄谀之辞，牵帷墙之制。", "analogy": "王力《古代汉语》"},
  {"front": "盖", "hl": "盖", "word": "盖", "meaning": "茅草编织物，用来盖屋的，又用来遮蔽身体保暖的。左传襄公十四年：\\\"乃祖吾离被苫～，蒙荆棘，以来归我先君。", "sentence": "乃祖吾离被苫盖，蒙荆棘，以来归我先君。", "analogy": "王力《古代汉语》"},
  {"front": "梗", "hl": "梗", "word": "梗", "meaning": "植物的枝或茎。战国策齐策三：\\\"有土偶人与桃～相与语。", "sentence": "薄宦梗犹泛。", "analogy": "王力《古代汉语》"},
  {"front": "本", "hl": "本", "word": "本", "meaning": "树的主干。跟末相对。", "sentence": "禽之而乘其车，系桑本焉。", "analogy": "王力《古代汉语》"},
  {"front": "末", "hl": "末", "word": "末", "meaning": "树杪，树梢。跟\\\"本\\\"相对。", "sentence": "本", "analogy": "王力《古代汉语》"},
  {"front": "纪", "hl": "纪", "word": "纪", "meaning": "丝的头绪，丝的条理。礼记礼器：\\\"～散而众乱。", "sentence": "纪散而众乱。", "analogy": "王力《古代汉语》"},
  {"front": "载", "hl": "载", "word": "载", "meaning": "用车装载。礼记檀弓上：\\\"南宫敬叔反，必～宝而朝。", "sentence": "南宫敬叔反，必载宝而朝。", "analogy": "王力《古代汉语》"},
  {"front": "监", "hl": "监", "word": "监", "meaning": "读jiàn。对着盆水照看自己的形象。", "sentence": "古人有言曰：\\'人无於水监，当於人监。\\'", "analogy": "王力《古代汉语》"},
  {"front": "抚", "hl": "抚", "word": "抚", "meaning": "抚摩。礼记丧服大记：\\\"主人降，北面於堂下，君～之，主人拜稽颡。", "sentence": "主人降，北面於堂下，君抚之，主人拜稽颡。", "analogy": "王力《古代汉语》"},
  {"front": "游", "hl": "游", "word": "游", "meaning": "在水面上浮行。诗经邶风谷风：\\\"就其浅矣，泳之～之。", "sentence": "就其浅矣，泳之游之。", "analogy": "王力《古代汉语》"},
  {"front": "扬", "hl": "扬", "word": "扬", "meaning": "举起来。礼记檀弓下：\\\"杜篑洗而～觯。", "sentence": "扬其目而视之。", "analogy": "王力《古代汉语》"},
  {"front": "抗", "hl": "抗", "word": "抗", "meaning": "抵御，抵抗。列子黄帝：\\\"而以道与世～。", "sentence": "而以道与世抗。", "analogy": "王力《古代汉语》"},
  {"front": "奋", "hl": "奋", "word": "奋", "meaning": "奋", "sentence": "静言思之，不能奋飞。", "analogy": "王力《古代汉语》"},
  {"front": "没", "hl": "没", "word": "没", "meaning": "读mò。沉入水中有所取。", "sentence": "始浮，行数十里乃没。", "analogy": "王力《古代汉语》"},
  {"front": "通", "hl": "通", "word": "通", "meaning": "通，通到。庄子秋水：\\\"舟车之所～。", "sentence": "舟车之所通。", "analogy": "王力《古代汉语》"},
  {"front": "达", "hl": "达", "word": "达", "meaning": "通到，到。尚书禹贡：\\\"浮於淮泗，～於河。", "sentence": "丘未达，不敢尝。", "analogy": "王力《古代汉语》"},
  {"front": "辨", "hl": "辨", "word": "辨", "meaning": "判别，分别。荀子荣辱：\\\"目～白黑美恶，耳～音声清浊，口～酸咸甘苦。", "sentence": "目辨白黑美恶，耳辨音声清浊，口辨酸咸甘苦。", "analogy": "王力《古代汉语》"},
  {"front": "析", "hl": "析", "word": "析", "meaning": "析", "sentence": "析薪如之何？匪斧不克。", "analogy": "王力《古代汉语》"},
  {"front": "判", "hl": "判", "word": "判", "meaning": "分，分开，分离。国语周语：\\\"若七德离～，民乃携贰。", "sentence": "强弱胜负已判矣。", "analogy": "王力《古代汉语》"},
  {"front": "切", "hl": "切", "word": "切", "meaning": "读qiē。用刀切开。", "sentence": "请一切逐客。", "analogy": "王力《古代汉语》"},
  {"front": "推", "hl": "推", "word": "推", "meaning": "以手从后用力使物体前移。左传成公二年：\\\"苟有险，余必下～车。", "sentence": "苟有险，余必下推车。", "analogy": "王力《古代汉语》"},
  {"front": "移", "hl": "移", "word": "移", "meaning": "迁移，移动。孟子梁惠王上：\\\"河内凶，则～其民於河东。", "sentence": "河内凶，则移其民於河东。", "analogy": "王力《古代汉语》"},
  {"front": "革", "hl": "革", "word": "革", "meaning": "去毛的兽皮。诗经召南羔羊：\\\"羔羊之～。", "sentence": "羔羊之革。", "analogy": "王力《古代汉语》"},
  {"front": "闻", "hl": "闻", "word": "闻", "meaning": "听见。孟子梁惠王上：\\\"～其声，不忍食其肉。", "sentence": "纲罗天下放失旧闻。", "analogy": "王力《古代汉语》"},
  {"front": "宿", "hl": "宿", "word": "宿", "meaning": "住宿，过夜。论语微子：\\\"止子路～。", "sentence": "净淘种子，渍经三宿。", "analogy": "王力《古代汉语》"},
  {"front": "随", "hl": "随", "word": "随", "meaning": "跟随。庄子人间世：\\\"自吾执斧斤以～夫子，未尝见材如此其美也。", "sentence": "而猥随俗之毁誉也。", "analogy": "王力《古代汉语》"},
  {"front": "沮", "hl": "沮", "word": "沮", "meaning": "沮", "sentence": "嬖人有臧仓者沮君，君是以不果来也。", "analogy": "王力《古代汉语》"},
  {"front": "拟", "hl": "拟", "word": "拟", "meaning": "比量，比划。汉书苏武传：\\\"复举剑～之，武不动。", "sentence": "儗", "analogy": "王力《古代汉语》"},
  {"front": "测", "hl": "测", "word": "测", "meaning": "测", "sentence": "上悬之无极之高，下垂之不测之渊。", "analogy": "王力《古代汉语》"},
  {"front": "当", "hl": "当", "word": "当", "meaning": "读dāng。对着，面对。", "sentence": "盛夏之时，当风而立。", "analogy": "王力《古代汉语》"},
  {"front": "须", "hl": "须", "word": "须", "meaning": "须。汉书高帝纪：\\\"隆准而龙颜，美～髯。", "sentence": "疏眉目，美须髯。", "analogy": "王力《古代汉语》"},
  {"front": "饶", "hl": "饶", "word": "饶", "meaning": "富，丰足。史记陈丞相世家：\\\"赍用益～，游道日广。", "sentence": "赍用益饶，游道日广。", "analogy": "王力《古代汉语》"},
  {"front": "秀", "hl": "秀", "word": "秀", "meaning": "谷类吐穗开花。诗经大雅生民：\\\"实发实～。", "sentence": "实发实秀。", "analogy": "王力《古代汉语》"},
  {"front": "丽", "hl": "丽", "word": "丽", "meaning": "双，偶，成对。文心雕龙丽辞：\\\"岂营～辞，率然对尔。", "sentence": "岂营丽辞，率然对尔。", "analogy": "王力《古代汉语》"},
  {"front": "工", "hl": "工", "word": "工", "meaning": "工人，有技艺的人。论语卫灵公：\\\"～欲善其事，必先利其器。", "sentence": "工欲善其事，必先利其器。", "analogy": "王力《古代汉语》"},
  {"front": "博", "hl": "博", "word": "博", "meaning": "宽广，广阔。礼记中庸：\\\"～厚配地，高明配天。", "sentence": "博厚配地，高明配天。", "analogy": "王力《古代汉语》"},
  {"front": "核", "hl": "核", "word": "核", "meaning": "考究其内在的意义。孔稚圭北山移文：\\\"～玄玄於道流。", "sentence": "核玄玄於道流。", "analogy": "王力《古代汉语》"},
  {"front": "奇", "hl": "奇", "word": "奇", "meaning": "异乎寻常的。跟\\\"正\\\"相对。", "sentence": "然仆观其为人，自守奇士。", "analogy": "王力《古代汉语》"},
  {"front": "偶", "hl": "偶", "word": "偶", "meaning": "土或木作的人像。战国策齐策三：\\\"有土～人与桃梗相与语。", "sentence": "有土偶人与桃梗相与语。桃梗谓土偶人曰。", "analogy": "王力《古代汉语》"},
  {"front": "丹", "hl": "丹", "word": "丹", "meaning": "丹砂，朱砂，可以作彩色用。诗经秦风终南\\\"颜如渥～。", "sentence": "铁券丹书", "analogy": "王力《古代汉语》"},
  {"front": "红", "hl": "红", "word": "红", "meaning": "浅红，桃红，粉红。论语乡党：\\\"～紫不以为亵服。", "sentence": "间色屏於红紫。", "analogy": "王力《古代汉语》"},
  {"front": "允", "hl": "允", "word": "允", "meaning": "信，诚。尚书舜典：\\\"夙夜出纳朕命，惟～。", "sentence": "夙夜出纳朕命，惟允。", "analogy": "王力《古代汉语》"},
  {"front": "舛", "hl": "舛", "word": "舛", "meaning": "舛", "sentence": "情舛错以曼忧。", "analogy": "王力《古代汉语》"},
  {"front": "宁", "hl": "宁", "word": "宁", "meaning": "安，安宁。诗经小雅常棣：\\\"丧乱既平，既安且～。", "sentence": "丧乱既平，既安且宁。", "analogy": "王力《古代汉语》"},
  {"front": "豫", "hl": "豫", "word": "豫", "meaning": "出游。特指天子秋日出巡。", "sentence": "夏谚曰：\\'吾王不游，吾何以休？吾王不豫，吾何以助？一游一豫，为诸侯度。\\'", "analogy": "王力《古代汉语》"},
  {"front": "尚", "hl": "尚", "word": "尚", "meaning": "上。孟子万章下：\\\"以友天下之善士为未足，又～论古之人。", "sentence": "事为春秋，言为尚书。", "analogy": "王力《古代汉语》"},
  {"front": "攸", "hl": "攸", "word": "攸", "meaning": "所。易经坤卦：\\\"君子有～往。", "sentence": "君子有攸往。", "analogy": "王力《古代汉语》"},
  {"front": "甫", "hl": "甫", "word": "甫", "meaning": "始，刚刚。表时间的副词。", "sentence": "甫乃以情纬文，以文被质。", "analogy": "王力《古代汉语》"},
  {"front": "聊", "hl": "聊", "word": "聊", "meaning": "藉，依赖，依靠。王粲登楼赋：\\\"登兹楼以四望，～暇日以销忧。", "sentence": "登兹楼以四望，聊暇日以销忧。", "analogy": "王力《古代汉语》"},
  {"front": "匪", "hl": "匪", "word": "匪", "meaning": "竹制的器皿，筐子之类。孟子滕文公下：\\\"东征，绥厥士女，～厥玄黄。", "sentence": "篚", "analogy": "王力《古代汉语》"},
  {"front": "厥", "hl": "厥", "word": "厥", "meaning": "代词。他的，它的。", "sentence": "遭世罔极兮，乃殒厥身。", "analogy": "王力《古代汉语》"},
  {"front": "经", "hl": "经", "word": "经", "meaning": "织布纵线为经，跟\\\"纬\\\"（横线）相对。常用作比喻。", "sentence": "故情者文之经，辞者理之纬。", "analogy": "王力《古代汉语》"},
  {"front": "典", "hl": "典", "word": "典", "meaning": "简册，重要的文献，书籍。左传昭公十二年：\\\"是能读三坟、五～、八索、九丘。", "sentence": "司晋之典籍。", "analogy": "王力《古代汉语》"},
  {"front": "简", "hl": "简", "word": "简", "meaning": "竹简，古代用来写字的狭长竹片。一简为一行，若干简并排编起来，成为一篇文章或一本书，叫做\\\"策\\\"或\\\"册\\\"。", "sentence": "策", "analogy": "王力《古代汉语》"},
  {"front": "篇", "hl": "篇", "word": "篇", "meaning": "篇", "sentence": "篇", "analogy": "王力《古代汉语》"},
  {"front": "词", "hl": "词", "word": "词", "meaning": "词句，言词。文心雕龙熔裁：\\\"剪裁浮～谓之裁。", "sentence": "剪裁浮词谓之裁。", "analogy": "王力《古代汉语》"},
  {"front": "赋", "hl": "赋", "word": "赋", "meaning": "田赋，赋税。尚书禹贡：\\\"厥田惟上下，厥～中上。", "sentence": "厥田惟上下，厥赋中上。", "analogy": "王力《古代汉语》"},
  {"front": "序", "hl": "序", "word": "序", "meaning": "东西墙。尚书顾命：\\\"西～东向。", "sentence": "西序东向。", "analogy": "王力《古代汉语》"},
  {"front": "铭", "hl": "铭", "word": "铭", "meaning": "铭", "sentence": "铭", "analogy": "王力《古代汉语》"},
  {"front": "诔", "hl": "诔", "word": "诔", "meaning": "诔", "sentence": "公诔之曰。", "analogy": "王力《古代汉语》"},
  {"front": "赞", "hl": "赞", "word": "赞", "meaning": "辅助，辅佐。左传僖公二十二年：\\\"天～我也。", "sentence": "天赞我也。", "analogy": "王力《古代汉语》"},
  {"front": "章", "hl": "章", "word": "章", "meaning": "音乐的一章。礼记曲礼下：\\\"既葬，读祭礼", "sentence": "既葬，读祭礼；丧复常，读乐章。", "analogy": "王力《古代汉语》"},
  {"front": "表", "hl": "表", "word": "表", "meaning": "穿在外面的衣服，罩衫。又为衣服的外层，跟\\\"里\\\"相对。", "sentence": "表里", "analogy": "王力《古代汉语》"},
  {"front": "旨", "hl": "旨", "word": "旨", "meaning": "美味，好吃的东西。论语阳货：\\\"食～不甘，闻乐不乐。", "sentence": "食旨不甘，闻乐不乐。", "analogy": "王力《古代汉语》"},
  {"front": "风", "hl": "风", "word": "风", "meaning": "风。诗经郑风风雨：\\\"～雨凄凄。", "sentence": "风雨凄凄。", "analogy": "王力《古代汉语》"},
  {"front": "骚", "hl": "骚", "word": "骚", "meaning": "扰乱，扰动，诗经大雅常武：\\\"徐方绎～。\\\"（徐方：周时江淮一带的少数民族部落。", "sentence": "早暮咈吾耳，骚吾心。", "analogy": "王力《古代汉语》"},
  {"front": "翰", "hl": "翰", "word": "翰", "meaning": "鸟名。或名天鸡。", "sentence": "文翰若翬雉。", "analogy": "王力《古代汉语》"},
  {"front": "藻", "hl": "藻", "word": "藻", "meaning": "藻", "sentence": "于以采藻，于彼行潦。", "analogy": "王力《古代汉语》"},
  {"front": "律", "hl": "律", "word": "律", "meaning": "规则，法令。特指刑法的条文。", "sentence": "秦法酷烈，而萧何造律。", "analogy": "王力《古代汉语》"},
  {"front": "荣", "hl": "荣", "word": "荣", "meaning": "花，开花。礼记月令：\\\"木堇（槿）～。", "sentence": "古诗十九首：", "analogy": "王力《古代汉语》"},
  {"front": "华", "hl": "华", "word": "华", "meaning": "花，开花。诗经周南桃夭：\\\"桃之夭夭，灼灼其～。", "sentence": "建翠华之旗。", "analogy": "王力《古代汉语》"},
  {"front": "轨", "hl": "轨", "word": "轨", "meaning": "轨", "sentence": "今天下车同轨。", "analogy": "王力《古代汉语》"},
  {"front": "范", "hl": "范", "word": "范", "meaning": "范", "sentence": "笵", "analogy": "王力《古代汉语》"},
  {"front": "规", "hl": "规", "word": "规", "meaning": "圆规，画圆形的工具。孟子离娄上：\\\"不以～矩，不能成方圆。", "sentence": "不以规矩，不能成方圆。", "analogy": "王力《古代汉语》"},
  {"front": "则", "hl": "则", "word": "则", "meaning": "准则，模范。诗经豳风伐柯：\\\"伐柯伐柯，（柯：斧子把。", "sentence": "楚辞离骚：", "analogy": "王力《古代汉语》"},
  {"front": "准", "hl": "准", "word": "准", "meaning": "水平。引申为一般的平。", "sentence": "置平准于京师，都受天下委输。", "analogy": "王力《古代汉语》"},
  {"front": "昆", "hl": "昆", "word": "昆", "meaning": "昆", "sentence": "谓他人昆。", "analogy": "王力《古代汉语》"},
  {"front": "弟", "hl": "弟", "word": "弟", "meaning": "兄弟。左传隐公元年：\\\"况君之宠～乎？", "sentence": "有事，弟子服其劳。", "analogy": "王力《古代汉语》"},
  {"front": "形", "hl": "形", "word": "形", "meaning": "形", "sentence": "参差沃若，两字穷形。", "analogy": "王力《古代汉语》"},
  {"front": "绮", "hl": "绮", "word": "绮", "meaning": "绮", "sentence": "客从远方来，遗我一端绮。", "analogy": "王力《古代汉语》"},
  {"front": "练", "hl": "练", "word": "练", "meaning": "练", "sentence": "澄江静如练。", "analogy": "王力《古代汉语》"},
  {"front": "伦", "hl": "伦", "word": "伦", "meaning": "人与人之间的正常关系。论语微子：\\\"欲洁其身而乱大～。", "sentence": "欲洁其身而乱大伦。", "analogy": "王力《古代汉语》"},
  {"front": "常", "hl": "常", "word": "常", "meaning": "永久的，固定的。论语子张：\\\"而亦何～师之有？", "sentence": "今商王受，狎侮五常。", "analogy": "王力《古代汉语》"},
  {"front": "网", "hl": "网", "word": "网", "meaning": "鱼网上的总绳。尚书盘庚上：\\\"若网在～，有条而不紊。", "sentence": "为政贵当举网。", "analogy": "王力《古代汉语》"},
  {"front": "维", "hl": "维", "word": "维", "meaning": "系物的大绳。淮南子天文：\\\"［共工］怒而触不周之山，天柱折，地～绝。", "sentence": "［共工］怒而触不周之山，天柱折，地维绝。", "analogy": "王力《古代汉语》"},
  {"front": "契", "hl": "契", "word": "契", "meaning": "用刀刻。诗经大雅绵：\\\"爰～我龟。", "sentence": "锲而舍之，朽木不折；锲而不舍，金石可镂。", "analogy": "王力《古代汉语》"},
  {"front": "几", "hl": "几", "word": "几", "meaning": "读jī。隐微。", "sentence": "夫易，圣人之所以极深而研几也。", "analogy": "王力《古代汉语》"},
  {"front": "始", "hl": "始", "word": "始", "meaning": "始", "sentence": "终", "analogy": "王力《古代汉语》"},
  {"front": "终", "hl": "终", "word": "终", "meaning": "终结，终了。跟\\\"始\\\"相对。", "sentence": "始", "analogy": "王力《古代汉语》"},
  {"front": "羞", "hl": "羞", "word": "羞", "meaning": "进献美味，荐。左传隐公三年：\\\"可荐於鬼神，可～於王公。", "sentence": "可荐於鬼神，可羞於王公。", "analogy": "王力《古代汉语》"},
  {"front": "辱", "hl": "辱", "word": "辱", "meaning": "名词，形容词。耻辱，可耻。", "sentence": "荣", "analogy": "王力《古代汉语》"},
  {"front": "创", "hl": "创", "word": "创", "meaning": "读chuāng。名词。", "sentence": "裂裳衣疮。", "analogy": "王力《古代汉语》"},
  {"front": "造", "hl": "造", "word": "造", "meaning": "到［某地］去。最初指到尊贵者的处所去。", "sentence": "不幸而有疾，不能造朝。", "analogy": "王力《古代汉语》"},
  {"front": "潜", "hl": "潜", "word": "潜", "meaning": "潜", "sentence": "至人潜行不窒，蹈火不热。", "analogy": "王力《古代汉语》"},
  {"front": "藏", "hl": "藏", "word": "藏", "meaning": "把谷物保藏起来。墨子三辩：\\\"农夫春耕，夏耘，秋敛，冬～。", "sentence": "农夫春耕，夏耘，秋敛，冬藏。", "analogy": "王力《古代汉语》"},
  {"front": "步", "hl": "步", "word": "步", "meaning": "走路，特指慢慢地走。庄子田子方：\\\"夫子～亦～，夫子趋亦趋。", "sentence": "步伐", "analogy": "王力《古代汉语》"},
  {"front": "履", "hl": "履", "word": "履", "meaning": "践，踩，在......上行走。易经坤卦：\\\"～霜坚冰至。", "sentence": "履霜坚冰至。", "analogy": "王力《古代汉语》"},
  {"front": "枕", "hl": "枕", "word": "枕", "meaning": "枕", "sentence": "君姑高枕为乐矣。", "analogy": "王力《古代汉语》"},
  {"front": "藉", "hl": "藉", "word": "藉", "meaning": "读jiè。草垫子。", "sentence": "藉用白茅。", "analogy": "王力《古代汉语》"},
  {"front": "凌", "hl": "凌", "word": "凌", "meaning": "凌", "sentence": "凌余阵兮躐余行。", "analogy": "王力《古代汉语》"},
  {"front": "厉", "hl": "厉", "word": "厉", "meaning": "磨刀石。诗经大雅公刘：\\\"取～取锻。", "sentence": "磨砻底厉，不见其损，有时而尽。", "analogy": "王力《古代汉语》"},
  {"front": "迫", "hl": "迫", "word": "迫", "meaning": "近。司马迁报任安书：\\\"涉旬月，～季冬。", "sentence": "涉旬月，迫季冬。", "analogy": "王力《古代汉语》"},
  {"front": "陨", "hl": "陨", "word": "陨", "meaning": "从高处掉下来。易经姤卦：\\\"有～自天。", "sentence": "有陨自天。", "analogy": "王力《古代汉语》"},
  {"front": "落", "hl": "落", "word": "落", "meaning": "草木凋谢。诗经卫风氓：\\\"桑之未～。", "sentence": "桑之未落。", "analogy": "王力《古代汉语》"},
  {"front": "运", "hl": "运", "word": "运", "meaning": "转动，旋转。易经系辞上：\\\"日月～行。", "sentence": "日月运行。", "analogy": "王力《古代汉语》"},
  {"front": "输", "hl": "输", "word": "输", "meaning": "输", "sentence": "秦於是乎输粟于晋。", "analogy": "王力《古代汉语》"},
  {"front": "役", "hl": "役", "word": "役", "meaning": "戍守边疆。诗经王风君子于役：\\\"君子于～。", "sentence": "君子役物，小人役於物。", "analogy": "王力《古代汉语》"},
  {"front": "募", "hl": "募", "word": "募", "meaning": "募", "sentence": "招延募选。", "analogy": "王力《古代汉语》"},
  {"front": "吹", "hl": "吹", "word": "吹", "meaning": "急呼气。老子二十九章：\\\"或嘘或～。", "sentence": "生物之以息相吹也。", "analogy": "王力《古代汉语》"},
  {"front": "唱", "hl": "唱", "word": "唱", "meaning": "领唱。庄子德充符：\\\"和而不～。", "sentence": "唱和有应。", "analogy": "王力《古代汉语》"},
  {"front": "叩", "hl": "叩", "word": "叩", "meaning": "询问。论语子罕：\\\"我～其两端而竭焉。", "sentence": "我叩其两端而竭焉。", "analogy": "王力《古代汉语》"},
  {"front": "弹", "hl": "弹", "word": "弹", "meaning": "读dàn，名词。弹弓。", "sentence": "左挟弹，右摄丸。", "analogy": "王力《古代汉语》"},
  {"front": "读", "hl": "读", "word": "读", "meaning": "读dú，旧读入声。读书。", "sentence": "颂其诗，读其书，不知其人可乎？", "analogy": "王力《古代汉语》"},
  {"front": "号", "hl": "号", "word": "号", "meaning": "读háo。高声呼喊。", "sentence": "或不知叫号。", "analogy": "王力《古代汉语》"},
  {"front": "讯", "hl": "讯", "word": "讯", "meaning": "问，特指上问下。诗经小雅正月：\\\"召彼故老，～之占梦。", "sentence": "君尝讯臣矣。", "analogy": "王力《古代汉语》"},
  {"front": "诘", "hl": "诘", "word": "诘", "meaning": "诘", "sentence": "士庄伯不能诘。", "analogy": "王力《古代汉语》"},
  {"front": "叙", "hl": "叙", "word": "叙", "meaning": "使有次序，妥善地安排。尚书皋陶谟：\\\"惇～九族。", "sentence": "惇叙九族。", "analogy": "王力《古代汉语》"},
  {"front": "诉", "hl": "诉", "word": "诉", "meaning": "告，特指以冤枉或委屈告诉在上的人。史记龟策列传：\\\"身在患中，莫可告语，王有德义，故来告～。", "sentence": "身在患中，莫可告语，王有德义，故来告诉。", "analogy": "王力《古代汉语》"},
  {"front": "摹", "hl": "摹", "word": "摹", "meaning": "摹", "sentence": "谁能摹暂离之状？", "analogy": "王力《古代汉语》"},
  {"front": "写", "hl": "写", "word": "写", "meaning": "倾注，倾泻。礼记曲礼上：\\\"御食於君，君赐余，器之溉者不～，其余皆～。", "sentence": "以浍写水。", "analogy": "王力《古代汉语》"},
  {"front": "排", "hl": "排", "word": "排", "meaning": "推，推开。礼记少仪：\\\"～阖说屦於户内者，一人而已矣。", "sentence": "哙乃排闼直入。", "analogy": "王力《古代汉语》"},
  {"front": "攘", "hl": "攘", "word": "攘", "meaning": "排斥，打退。公羊传僖公四年：\\\"～夷狄。", "sentence": "攘夷狄。", "analogy": "王力《古代汉语》"},
  {"front": "窜", "hl": "窜", "word": "窜", "meaning": "躲藏。左传定公四年：\\\"天诱其衷，致罚於楚，而君又～之。", "sentence": "求广土而窜伏焉。", "analogy": "王力《古代汉语》"},
  {"front": "列", "hl": "列", "word": "列", "meaning": "分裂。\\\"列地\\\"、\\\"列土\\\"二字连用，表示分封为王侯。", "sentence": "列地", "analogy": "王力《古代汉语》"},
  {"front": "垂", "hl": "垂", "word": "垂", "meaning": "边疆。荀子臣道：\\\"边境之臣处，则疆～不丧。", "sentence": "边境之臣处，则疆垂不丧。", "analogy": "王力《古代汉语》"},
  {"front": "尊", "hl": "尊", "word": "尊", "meaning": "盛酒器。庄子马蹄：\\\"故纯朴不残，孰为牺～？", "sentence": "故纯朴不残，孰为牺尊？", "analogy": "王力《古代汉语》"},
  {"front": "盛", "hl": "盛", "word": "盛", "meaning": "读chéng。黍稷在器中，用来祭祀的。", "sentence": "诸侯耕助以供粢盛。", "analogy": "王力《古代汉语》"},
  {"front": "虚", "hl": "虚", "word": "虚", "meaning": "大丘，特指旧都邑的遗址。旧读如胠(qū)。", "sentence": "升彼虚矣。", "analogy": "王力《古代汉语》"},
  {"front": "枉", "hl": "枉", "word": "枉", "meaning": "［木］不直。跟\\\"直\\\"相对。", "sentence": "冤枉", "analogy": "王力《古代汉语》"},
  {"front": "和", "hl": "和", "word": "和", "meaning": "［音乐］调和，和谐。尚书舜典：\\\"声依永，律～声。", "sentence": "声依永，律和声。", "analogy": "王力《古代汉语》"},
  {"front": "顺", "hl": "顺", "word": "顺", "meaning": "顺从。跟\\\"逆\\\"相对。", "sentence": "逆", "analogy": "王力《古代汉语》"},
  {"front": "凛", "hl": "凛", "word": "凛", "meaning": "凛", "sentence": "凛秋暑退，熙春寒往。", "analogy": "王力《古代汉语》"},
  {"front": "凝", "hl": "凝", "word": "凝", "meaning": "结冰。易经坤卦：\\\"履霜坚冰，阴始～也。", "sentence": "履霜坚冰，阴始凝也。", "analogy": "王力《古代汉语》"},
  {"front": "烂", "hl": "烂", "word": "烂", "meaning": "煮烂。吕氏春秋本味：\\\"熟而不～。", "sentence": "焦头烂额为上客。", "analogy": "王力《古代汉语》"},
  {"front": "漫", "hl": "漫", "word": "漫", "meaning": "读màn。水大的样子。", "sentence": "其池则汤汤汗汗，滉瀁弥漫，浩如河汉。 ", "analogy": "王力《古代汉语》"},
  {"front": "赤", "hl": "赤", "word": "赤", "meaning": "赤", "sentence": "赤舄几几。", "analogy": "王力《古代汉语》"},
  {"front": "碧", "hl": "碧", "word": "碧", "meaning": "碧", "sentence": "碧岭再辱。", "analogy": "王力《古代汉语》"},
  {"front": "青", "hl": "青", "word": "青", "meaning": "蓝色。荀子劝学：\\\"青，取之於蓝而～於蓝。", "sentence": "望郎上青楼。", "analogy": "王力《古代汉语》"},
  {"front": "苍", "hl": "苍", "word": "苍", "meaning": "苍", "sentence": "天之苍苍，其正色邪？", "analogy": "王力《古代汉语》"},
  {"front": "乍", "hl": "乍", "word": "乍", "meaning": "副词。突然，忽然。", "sentence": "今人乍见孺子将入於井。", "analogy": "王力《古代汉语》"},
  {"front": "每", "hl": "每", "word": "每", "meaning": "每一。论语八佾：\\\"子入太庙，～事问。", "sentence": "子入太庙，每事问。", "analogy": "王力《古代汉语》"},
  {"front": "既", "hl": "既", "word": "既", "meaning": "动词。尽。", "sentence": "道之出口，淡乎其无味。视之不足见，听之不足闻，用之不可既。", "analogy": "王力《古代汉语》"},
  {"front": "卿", "hl": "卿", "word": "卿", "meaning": "官阶名，爵位名。卿在公之下，大夫之上。", "sentence": "公卿大夫，此人爵也。", "analogy": "王力《古代汉语》"},
  {"front": "傅", "hl": "傅", "word": "傅", "meaning": "师傅，教师。礼记内则：\\\"十年，出就外～，居宿於外。", "sentence": "颜阖将傅卫灵公太子。", "analogy": "王力《古代汉语》"},
  {"front": "仪", "hl": "仪", "word": "仪", "meaning": "仪", "sentence": "子大叔见赵简子，简子问揖让周旋之礼焉。对曰：\\'是仪也，非礼也。\\'", "analogy": "王力《古代汉语》"},
  {"front": "容", "hl": "容", "word": "容", "meaning": "容纳，容得下。诗经卫风河广：\\\"谁谓河广？", "sentence": "剖之以为瓢，则瓠落无所容。", "analogy": "王力《古代汉语》"},
  {"front": "祥", "hl": "祥", "word": "祥", "meaning": "吉凶的预兆。左传僖公十六年：\\\"是何～也？", "sentence": "是何祥也？吉凶焉在？", "analogy": "王力《古代汉语》"},
  {"front": "殃", "hl": "殃", "word": "殃", "meaning": "殃", "sentence": "积善之家，必有余庆；积不善之家，必有余殃。", "analogy": "王力《古代汉语》"},
  {"front": "条", "hl": "条", "word": "条", "meaning": "树枝。诗经周南汝坟：\\\"伐其～枚。", "sentence": "於是丛条瞋胆，叠颖怒魄。", "analogy": "王力《古代汉语》"},
  {"front": "理", "hl": "理", "word": "理", "meaning": "加工玉石，雕琢［玉器］。战国策秦策三：\\\"郑人谓玉未～者璞。", "sentence": "使玉人理其璞。", "analogy": "王力《古代汉语》"},
  {"front": "支", "hl": "支", "word": "支", "meaning": "枝。诗经卫风芄兰：\\\"芄兰之～。", "sentence": "本支百世。", "analogy": "王力《古代汉语》"},
  {"front": "叶", "hl": "叶", "word": "叶", "meaning": "叶子。扬雄解嘲：\\\"枝～扶疏。", "sentence": "枝叶扶疏。", "analogy": "王力《古代汉语》"},
  {"front": "颖", "hl": "颖", "word": "颖", "meaning": "颖", "sentence": "实颖实栗。", "analogy": "王力《古代汉语》"},
  {"front": "轩", "hl": "轩", "word": "轩", "meaning": "大夫的车。左传闵公二年：\\\"卫懿公好鹤，鹤有乘～者。", "sentence": "卫懿公好鹤，鹤有乘轩者。", "analogy": "王力《古代汉语》"},
  {"front": "冕", "hl": "冕", "word": "冕", "meaning": "冕", "sentence": "行夏之时，乘殷之辂，服周之冕。", "analogy": "王力《古代汉语》"},
  {"front": "庾", "hl": "庾", "word": "庾", "meaning": "庾", "sentence": "曾孙之庾，如坻如京。", "analogy": "王力《古代汉语》"},
  {"front": "廪", "hl": "廪", "word": "廪", "meaning": "廪", "sentence": "父母使舜完廪。", "analogy": "王力《古代汉语》"},
  {"front": "帛", "hl": "帛", "word": "帛", "meaning": "帛", "sentence": "五十者可以衣帛矣。", "analogy": "王力《古代汉语》"},
  {"front": "缕", "hl": "缕", "word": "缕", "meaning": "缕", "sentence": "譬若丝缕之有纪，罔罟之有纲。", "analogy": "王力《古代汉语》"},
  {"front": "扃", "hl": "扃", "word": "扃", "meaning": "扃", "sentence": "固扃鐍。", "analogy": "王力《古代汉语》"},
  {"front": "牖", "hl": "牖", "word": "牖", "meaning": "牖", "sentence": "自牖执其手。", "analogy": "王力《古代汉语》"},
  {"front": "楹", "hl": "楹", "word": "楹", "meaning": "楹", "sentence": "有觉其楹。", "analogy": "王力《古代汉语》"},
  {"front": "槛", "hl": "槛", "word": "槛", "meaning": "槛", "sentence": "故夫养虎豹犀象者，为之圈槛。", "analogy": "王力《古代汉语》"},
  {"front": "梁", "hl": "梁", "word": "梁", "meaning": "桥。庄子马蹄：\\\"泽无舟～。", "sentence": "桥梁。", "analogy": "王力《古代汉语》"},
  {"front": "陵", "hl": "陵", "word": "陵", "meaning": "大土山。诗经小雅天保：\\\"如山如阜，如冈如～。", "sentence": "如山如阜，如冈如陵。", "analogy": "王力《古代汉语》"},
  {"front": "津", "hl": "津", "word": "津", "meaning": "渡口。论语微子：\\\"使子路问～焉。", "sentence": "使子路问津焉。", "analogy": "王力《古代汉语》"},
  {"front": "浦", "hl": "浦", "word": "浦", "meaning": "水边，河边，江边。诗经大雅常武：\\\"率彼淮～。", "sentence": "率彼淮浦。", "analogy": "王力《古代汉语》"},
  {"front": "畴", "hl": "畴", "word": "畴", "meaning": "麻田，田。孟子尽心上：\\\"易其田～。", "sentence": "农人告余以春及，将有事於西畴。", "analogy": "王力《古代汉语》"},
  {"front": "陌", "hl": "陌", "word": "陌", "meaning": "陌", "sentence": "越陌度阡。", "analogy": "王力《古代汉语》"},
  {"front": "晡", "hl": "晡", "word": "晡", "meaning": "晡", "sentence": "荒庭日欲晡。", "analogy": "王力《古代汉语》"},
  {"front": "曛", "hl": "曛", "word": "曛", "meaning": "曛", "sentence": "风悲日曛。", "analogy": "王力《古代汉语》"},
  {"front": "块", "hl": "块", "word": "块", "meaning": "土块。左传僖公二十三年：\\\"乞食於野人，野人与之～。", "sentence": "乞食於野人，野人与之块。", "analogy": "王力《古代汉语》"},
  {"front": "砾", "hl": "砾", "word": "砾", "meaning": "砾", "sentence": "僖侯浴汤中有砾。", "analogy": "王力《古代汉语》"},
  {"front": "掇", "hl": "掇", "word": "掇", "meaning": "掇", "sentence": "采采芣苢，薄言掇之。", "analogy": "王力《古代汉语》"},
  {"front": "控", "hl": "控", "word": "控", "meaning": "拉弓。史记刘敬叔孙通列传：\\\"当是时，冒顿为单于，兵强，～弦三十万。", "sentence": "当是时，冒顿为单于，兵强，控弦三十万。", "analogy": "王力《古代汉语》"},
  {"front": "扪", "hl": "扪", "word": "扪", "meaning": "扪", "sentence": "莫扪朕舌。", "analogy": "王力《古代汉语》"},
  {"front": "把", "hl": "把", "word": "把", "meaning": "握持，攥(zuàn)。史记殷本纪：\\\"汤自～钺以伐昆吾。", "sentence": "汤自把钺以伐昆吾。", "analogy": "王力《古代汉语》"},
  {"front": "挑", "hl": "挑", "word": "挑", "meaning": "读tiāo，挠，拨动。庄子大宗师：\\\"孰能登天游雾，挠～无极？", "sentence": "孤灯挑尽未成眠。", "analogy": "王力《古代汉语》"},
  {"front": "搔", "hl": "搔", "word": "搔", "meaning": "搔", "sentence": "爱而不见，搔首踟蹰。", "analogy": "王力《古代汉语》"},
  {"front": "投", "hl": "投", "word": "投", "meaning": "抛掷，抛向。诗经卫风木瓜：\\\"～我以木瓜。", "sentence": "投我以木瓜。", "analogy": "王力《古代汉语》"},
  {"front": "递", "hl": "递", "word": "递", "meaning": "交替。楚辞招魂：\\\"二八侍宿，射～代些。", "sentence": "秦复爱六国之人，则递三世可至万世而为君。", "analogy": "王力《古代汉语》"},
  {"front": "蹈", "hl": "蹈", "word": "蹈", "meaning": "踩，踏。庄子达生：\\\"至人潜行不窒，～火不热。", "sentence": "至人潜行不窒，蹈火不热。", "analogy": "王力《古代汉语》"},
  {"front": "蹑", "hl": "蹑", "word": "蹑", "meaning": "踩。史记淮阴侯列传：\\\"张良、陈平～汉王足。", "sentence": "张良、陈平蹑汉王足。", "analogy": "王力《古代汉语》"},
  {"front": "升", "hl": "升", "word": "升", "meaning": "量名，一斗的十分之一。庄子外物：\\\"君岂有斗～之水而活我哉？", "sentence": "君岂有斗升之水而活我哉？", "analogy": "王力《古代汉语》"},
  {"front": "缘", "hl": "缘", "word": "缘", "meaning": "衣边饰，古代的一种花边。礼记玉藻：\\\"缁布衣，锦～。", "sentence": "缁布衣，锦缘。", "analogy": "王力《古代汉语》"},
  {"front": "偃", "hl": "偃", "word": "偃", "meaning": "仰卧。诗经小雅北山：\\\"或息～在床。", "sentence": "迎风则偃，背风则仆。", "analogy": "王力《古代汉语》"},
  {"front": "仆", "hl": "仆", "word": "仆", "meaning": "仆", "sentence": "诚恐一旦蹎仆。", "analogy": "王力《古代汉语》"},
  {"front": "毙", "hl": "毙", "word": "毙", "meaning": "毙", "sentence": "射其右，毙于车中。", "analogy": "王力《古代汉语》"},
  {"front": "倾", "hl": "倾", "word": "倾", "meaning": "倾斜，歪。荀子非十二子：\\\"端然正己，不为物～侧。", "sentence": "端然正己，不为物倾侧。", "analogy": "王力《古代汉语》"},
  {"front": "聆", "hl": "聆", "word": "聆", "meaning": "聆", "sentence": "聆广乐之九奏兮。", "analogy": "王力《古代汉语》"},
  {"front": "眺", "hl": "眺", "word": "眺", "meaning": "眺", "sentence": "可以远眺望。", "analogy": "王力《古代汉语》"},
  {"front": "睇", "hl": "睇", "word": "睇", "meaning": "睇", "sentence": "既含睇兮又宜笑。", "analogy": "王力《古代汉语》"},
  {"front": "眄", "hl": "眄", "word": "眄", "meaning": "眄", "sentence": "臣闻明月之珠，夜光之璧，以暗投入於道，众莫不按剑相眄者。", "analogy": "王力《古代汉语》"},
  {"front": "瞻", "hl": "瞻", "word": "瞻", "meaning": "瞻", "sentence": "瞻望弗及，伫立以泣。", "analogy": "王力《古代汉语》"},
  {"front": "回", "hl": "回", "word": "回", "meaning": "回", "sentence": "是以肠一日而九回。", "analogy": "王力《古代汉语》"},
  {"front": "还", "hl": "还", "word": "还", "meaning": "回去，回来。左传僖公三十年：\\\"吾其～也。", "sentence": "吾其还也。", "analogy": "王力《古代汉语》"},
  {"front": "逝", "hl": "逝", "word": "逝", "meaning": "逝", "sentence": "日月逝矣。", "analogy": "王力《古代汉语》"},
  {"front": "分", "hl": "分", "word": "分", "meaning": "分开。论语泰伯：\\\"三～天下有其二。", "sentence": "三分天下有其二。", "analogy": "王力《古代汉语》"},
  {"front": "诀", "hl": "诀", "word": "诀", "meaning": "诀", "sentence": "沥泣共诀，?br\\> 　　血相视。", "analogy": "王力《古代汉语》"},
  {"front": "悸", "hl": "悸", "word": "悸", "meaning": "悸", "sentence": "使我至今病悸。", "analogy": "王力《古代汉语》"},
  {"front": "恸", "hl": "恸", "word": "恸", "meaning": "恸", "sentence": "颜渊死，子哭之恸。", "analogy": "王力《古代汉语》"},
  {"front": "怅", "hl": "怅", "word": "怅", "meaning": "怅", "sentence": "怨公子兮怅忘归。", "analogy": "王力《古代汉语》"},
  {"front": "慨", "hl": "慨", "word": "慨", "meaning": "叹息，叹气。荀子宥坐：\\\"孔子～然叹曰。", "sentence": "孔子慨然叹曰。", "analogy": "王力《古代汉语》"},
  {"front": "警", "hl": "警", "word": "警", "meaning": "使警惕，使知所戒。左传宣公十二年：\\\"今天或者大～晋也。", "sentence": "烦君最相警。", "analogy": "王力《古代汉语》"},
  {"front": "惕", "hl": "惕", "word": "惕", "meaning": "惕", "sentence": "君子终日乾乾，夕惕若厉。", "analogy": "王力《古代汉语》"},
  {"front": "欲", "hl": "欲", "word": "欲", "meaning": "及物动词。想要得到，希望有某事。", "sentence": "少妇城南欲断肠。", "analogy": "王力《古代汉语》"},
  {"front": "感", "hl": "感", "word": "感", "meaning": "感", "sentence": "圣人感人心而天下和平。", "analogy": "王力《古代汉语》"},
  {"front": "酌", "hl": "酌", "word": "酌", "meaning": "酌", "sentence": "我姑酌彼兕觥。", "analogy": "王力《古代汉语》"},
  {"front": "酹", "hl": "酹", "word": "酹", "meaning": "酹", "sentence": "以酒酹地。", "analogy": "王力《古代汉语》"},
  {"front": "酣", "hl": "酣", "word": "酣", "meaning": "酣", "sentence": "即酒酣乐，进热歠。", "analogy": "王力《古代汉语》"},
  {"front": "觉", "hl": "觉", "word": "觉", "meaning": "读jiào。睡醒。", "sentence": "寐", "analogy": "王力《古代汉语》"},
  {"front": "央", "hl": "央", "word": "央", "meaning": "［中央］中间，中心，正中。诗经秦风蒹葭：\\\"宛在水中～。", "sentence": "淮南子天文：", "analogy": "王力《古代汉语》"},
  {"front": "阑", "hl": "阑", "word": "阑", "meaning": "门前的栅栏。史记楚世家：\\\"是以敝邑之王不得事王，而令仪亦不得为门～之厮也。", "sentence": "门阑", "analogy": "王力《古代汉语》"},
  {"front": "清", "hl": "清", "word": "清", "meaning": "清", "sentence": "浊", "analogy": "王力《古代汉语》"},
  {"front": "浑", "hl": "浑", "word": "浑", "meaning": "浊，浑浊。老子十五章：\\\"～兮其若浊。", "sentence": "浑兮其若浊。", "analogy": "王力《古代汉语》"},
  {"front": "安", "hl": "安", "word": "安", "meaning": "安，跟危相对。论语季氏：\\\"盖均无贫，和无寡，～无倾。", "sentence": "歌筵畔，先安簟枕，容我醉时眠。", "analogy": "王力《古代汉语》"},
  {"front": "闲", "hl": "闲", "word": "闲", "meaning": "栅栏，养牛马的圈。汉书百官公卿表：\\\"又龙马～驹。", "sentence": "又龙马闲驹。", "analogy": "王力《古代汉语》"},
  {"front": "乖", "hl": "乖", "word": "乖", "meaning": "乖", "sentence": "楚执政众而乖。", "analogy": "王力《古代汉语》"},
  {"front": "互", "hl": "互", "word": "互", "meaning": "交互，交错。京房易传：\\\"阴阳交～。", "sentence": "洲岛回互。", "analogy": "王力《古代汉语》"},
  {"front": "繁", "hl": "繁", "word": "繁", "meaning": "繁", "sentence": "於是景公繁于刑。", "analogy": "王力《古代汉语》"},
  {"front": "烦", "hl": "烦", "word": "烦", "meaning": "烦躁。素问生气通天论：\\\"～则喘喝。", "sentence": "入耳而不烦。", "analogy": "王力《古代汉语》"},
  {"front": "急", "hl": "急", "word": "急", "meaning": "性情急躁，没有耐心。孟子滕文公下：\\\"三月无君则吊，不以～乎？", "sentence": "三月无君则吊，不以急乎？", "analogy": "王力《古代汉语》"},
  {"front": "忽", "hl": "忽", "word": "忽", "meaning": "不注意，不重视，无视。汉书王嘉传：\\\"～於小过。", "sentence": "忽於小过。", "analogy": "王力《古代汉语》"},
  {"front": "但", "hl": "但", "word": "但", "meaning": "但", "sentence": "匈奴匿其壮士肥牛马，但见老弱及羸畜。", "analogy": "王力《古代汉语》"},
  {"front": "星", "hl": "星", "word": "星", "meaning": "星", "sentence": "物换星移几度秋？", "analogy": "王力《古代汉语》"},
  {"front": "辰", "hl": "辰", "word": "辰", "meaning": "十二支的第五位。用来纪日。", "sentence": "庚辰，将殡于曲沃。", "analogy": "王力《古代汉语》"},
  {"front": "岭", "hl": "岭", "word": "岭", "meaning": "岭", "sentence": "与轿而隃领。", "analogy": "王力《古代汉语》"},
  {"front": "栈", "hl": "栈", "word": "栈", "meaning": "棚车，用木条横排编成车厢的轻便车子。诗经小雅何草不黄：\\\"有～之车，行彼周道。", "sentence": "有栈之车，行彼周道。", "analogy": "王力《古代汉语》"},
  {"front": "阁", "hl": "阁", "word": "阁", "meaning": "复道，用木材架於空中以为道路。战国策齐策六：\\\"为栈道木～而迎王与后於城阳山中。", "sentence": "为栈道木阁而迎王与后於城阳山中。", "analogy": "王力《古代汉语》"},
  {"front": "甸", "hl": "甸", "word": "甸", "meaning": "甸", "sentence": "五百里甸服。", "analogy": "王力《古代汉语》"},
  {"front": "藩", "hl": "藩", "word": "藩", "meaning": "藩", "sentence": "羝羊触藩。", "analogy": "王力《古代汉语》"},
  {"front": "苑", "hl": "苑", "word": "苑", "meaning": "苑", "sentence": "不务明君臣之义，正诸侯之礼，徒事争於游戏之乐，苑囿之大。", "analogy": "王力《古代汉语》"},
  {"front": "陇", "hl": "陇", "word": "陇", "meaning": "地名。陇山（在陕西、甘肃交界处。", "sentence": "遂逾陇。", "analogy": "王力《古代汉语》"},
  {"front": "坟", "hl": "坟", "word": "坟", "meaning": "大堤。诗经周南汝坟：\\\"遵彼汝～。", "sentence": "遵彼汝坟。", "analogy": "王力《古代汉语》"},
  {"front": "蹊", "hl": "蹊", "word": "蹊", "meaning": "蹊", "sentence": "山无蹊隧，泽无舟梁。", "analogy": "王力《古代汉语》"},
  {"front": "径", "hl": "径", "word": "径", "meaning": "小路，不能容车的步道。论语雍也：\\\"行不由～。", "sentence": "行不由径。", "analogy": "王力《古代汉语》"},
  {"front": "汀", "hl": "汀", "word": "汀", "meaning": "汀", "sentence": "搴汀洲兮杜若。", "analogy": "王力《古代汉语》"},
  {"front": "洲", "hl": "洲", "word": "洲", "meaning": "洲", "sentence": "关关雎鸠，在河之洲。", "analogy": "王力《古代汉语》"},
  {"front": "渚", "hl": "渚", "word": "渚", "meaning": "渚", "sentence": "鹤汀凫渚，穷岛屿之萦回。", "analogy": "王力《古代汉语》"},
  {"front": "皋", "hl": "皋", "word": "皋", "meaning": "皋", "sentence": "步余马於兰皋兮。", "analogy": "王力《古代汉语》"},
  {"front": "涯", "hl": "涯", "word": "涯", "meaning": "涯", "sentence": "若涉大水，其无津涯。", "analogy": "王力《古代汉语》"},
  {"front": "塘", "hl": "塘", "word": "塘", "meaning": "堤。本作\\\"唐\\\"。", "sentence": "池塘生春草，园柳变鸣禽。", "analogy": "王力《古代汉语》"},
  {"front": "垠", "hl": "垠", "word": "垠", "meaning": "垠", "sentence": "其小无内兮，其大无垠。", "analogy": "王力《古代汉语》"},
  {"front": "辇", "hl": "辇", "word": "辇", "meaning": "用人推挽的车。战国策赵策四：\\\"老妇恃～而行。", "sentence": "昭阳殿里第一人，同辇随君侍君侧。", "analogy": "王力《古代汉语》"},
  {"front": "毂", "hl": "毂", "word": "毂", "meaning": "毂", "sentence": "三十辐，共一毂。", "analogy": "王力《古代汉语》"},
  {"front": "辕", "hl": "辕", "word": "辕", "meaning": "辕", "sentence": "委蛇其大如毂，其长如辕。", "analogy": "王力《古代汉语》"},
  {"front": "辙", "hl": "辙", "word": "辙", "meaning": "辙", "sentence": "汝不知夫螳螂乎？怒其臂以当车辙，不知其不胜任也。", "analogy": "王力《古代汉语》"},
  {"front": "簪", "hl": "簪", "word": "簪", "meaning": "簪", "sentence": "昔闻投簪逸海岸。", "analogy": "王力《古代汉语》"},
  {"front": "缨", "hl": "缨", "word": "缨", "meaning": "系冠的带子，结在下巴的。楚辞渔父：\\\"沧浪之水清兮，可以濯我～。", "sentence": "雄发指危冠，猛气冲长缨。", "analogy": "王力《古代汉语》"},
  {"front": "绂", "hl": "绂", "word": "绂", "meaning": "读fú。系印的丝带（其颜色依品级而定）。", "sentence": "授单于印绂。", "analogy": "王力《古代汉语》"},
  {"front": "绶", "hl": "绶", "word": "绶", "meaning": "绶", "sentence": "怀黄金之印，结紫绶於要。", "analogy": "王力《古代汉语》"},
  {"front": "襦", "hl": "襦", "word": "襦", "meaning": "襦", "sentence": "征褰与襦。", "analogy": "王力《古代汉语》"},
  {"front": "袂", "hl": "袂", "word": "袂", "meaning": "袂", "sentence": "投袂而起。", "analogy": "王力《古代汉语》"},
  {"front": "羹", "hl": "羹", "word": "羹", "meaning": "羹", "sentence": "若作和羹，尔惟盐梅。", "analogy": "王力《古代汉语》"},
  {"front": "丝", "hl": "丝", "word": "丝", "meaning": "丝。战国策楚策四：\\\"方将调饴胶～。", "sentence": "方将调饴胶丝。", "analogy": "王力《古代汉语》"},
  {"front": "弦", "hl": "弦", "word": "弦", "meaning": "弓的弦。韩非子观行：\\\"西门豹之性急，常佩韦以自缓", "sentence": "西门豹之性急，常佩韦以自缓；董安于之性缓，常佩弦以自急。", "analogy": "王力《古代汉语》"},
  {"front": "鼓", "hl": "鼓", "word": "鼓", "meaning": "名词。鼓。", "sentence": "小子鸣鼓而攻之可也。", "analogy": "王力《古代汉语》"},
  {"front": "僚", "hl": "僚", "word": "僚", "meaning": "僚", "sentence": "我虽异事，及尔同僚。", "analogy": "王力《古代汉语》"},
  {"front": "群", "hl": "群", "word": "群", "meaning": "群", "sentence": "谁谓尔无羊？三百维群！", "analogy": "王力《古代汉语》"},
  {"front": "辈", "hl": "辈", "word": "辈", "meaning": "辈", "sentence": "荐宠下辈。", "analogy": "王力《古代汉语》"},
  {"front": "思", "hl": "思", "word": "思", "meaning": "思考，考虑。论语为政：\\\"学而不～则罔，～而不学则殆。", "sentence": "学而不思则罔，思而不学则殆。", "analogy": "王力《古代汉语》"},
  {"front": "索", "hl": "索", "word": "索", "meaning": "大绳，绳子。司马迁报任安书：\\\"其次关木～，被棰楚受辱。", "sentence": "其次关木索，被棰楚受辱。", "analogy": "王力《古代汉语》"},
  {"front": "赏", "hl": "赏", "word": "赏", "meaning": "奖励有功的。史记项羽本纪：\\\"未有封侯之～。", "sentence": "未有封侯之赏。", "analogy": "王力《古代汉语》"},
  {"front": "料", "hl": "料", "word": "料", "meaning": "料", "sentence": "尝为季氏吏，料量平。", "analogy": "王力《古代汉语》"},
  {"front": "想", "hl": "想", "word": "想", "meaning": "想", "sentence": "余读孔氏书，想见其为人。", "analogy": "王力《古代汉语》"},
  {"front": "占", "hl": "占", "word": "占", "meaning": "根据烧灼过的龟甲裂纹占问吉凶。周礼春官宗伯：\\\"占人掌～龟。", "sentence": "其占为有年。", "analogy": "王力《古代汉语》"},
  {"front": "卜", "hl": "卜", "word": "卜", "meaning": "卜", "sentence": "卜之，不吉。", "analogy": "王力《古代汉语》"},
  {"front": "戏", "hl": "戏", "word": "戏", "meaning": "读huī。军中大将的大旗。", "sentence": "兵罢戏下，诸侯各就国。", "analogy": "王力《古代汉语》"},
  {"front": "弄", "hl": "弄", "word": "弄", "meaning": "用手把玩。诗经小雅斯干：\\\"载～之璋。", "sentence": "夷吾弱不好弄。", "analogy": "王力《古代汉语》"},
  {"front": "动", "hl": "动", "word": "动", "meaning": "移动，振动。跟\\\"静\\\"相对。", "sentence": "静", "analogy": "王力《古代汉语》"},
  {"front": "定", "hl": "定", "word": "定", "meaning": "安定，安静。诗经小雅采薇：\\\"岂敢～居。", "sentence": "岂敢定居。", "analogy": "王力《古代汉语》"},
  {"front": "驻", "hl": "驻", "word": "驻", "meaning": "驻", "sentence": "襜帷暂驻。", "analogy": "王力《古代汉语》"},
  {"front": "住", "hl": "住", "word": "住", "meaning": "住", "sentence": "去", "analogy": "王力《古代汉语》"},
  {"front": "依", "hl": "依", "word": "依", "meaning": "傍着，紧靠着。古诗十九首：\\\"胡马～北风。", "sentence": "胡马依北风。", "analogy": "王力《古代汉语》"},
  {"front": "倚", "hl": "倚", "word": "倚", "meaning": "斜靠着。史记刺客列传：\\\"轲自知事不就，～柱而笑。", "sentence": "轲自知事不就，倚柱而笑。", "analogy": "王力《古代汉语》"},
  {"front": "雕", "hl": "雕", "word": "雕", "meaning": "猛禽。鹰鹞一类的鸟。", "sentence": "回望射雕处，千里暮云平。", "analogy": "王力《古代汉语》"},
  {"front": "制", "hl": "制", "word": "制", "meaning": "制", "sentence": "制芰荷以为衣兮。", "analogy": "王力《古代汉语》"},
  {"front": "生", "hl": "生", "word": "生", "meaning": "植物长出来，生出来。礼记月令：\\\"王瓜～，苦菜秀。", "sentence": "王瓜生，苦菜秀。", "analogy": "王力《古代汉语》"},
  {"front": "消", "hl": "消", "word": "消", "meaning": "消失，减少。与\\\"息\\\"相对。", "sentence": "日中则昃，月盈则食，天地盈虚，与时消息。", "analogy": "王力《古代汉语》"},
  {"front": "淹", "hl": "淹", "word": "淹", "meaning": "浸渍。楚辞九叹怨思：\\\"～芳芷於腐井兮。", "sentence": "宅中水淹。", "analogy": "王力《古代汉语》"},
  {"front": "漏", "hl": "漏", "word": "漏", "meaning": "水渗下。杜甫茅屋为秋风所破歌：\\\"床头屋～无乾处。", "sentence": "床头屋漏无乾处。", "analogy": "王力《古代汉语》"},
  {"front": "泛", "hl": "泛", "word": "泛", "meaning": "在水上飘浮。苏轼前赤壁赋：\\\"苏子与客～舟，游於赤壁之下。", "sentence": "苏子与客泛舟，游於赤壁之下。", "analogy": "王力《古代汉语》"},
  {"front": "涵", "hl": "涵", "word": "涵", "meaning": "潜沉，潜游。左思吴都赋：\\\"～泳乎其中。", "sentence": "涵泳乎其中。", "analogy": "王力《古代汉语》"},
  {"front": "蒙", "hl": "蒙", "word": "蒙", "meaning": "覆盖。诗经鄘风君子偕老：\\\"～彼绉絺。", "sentence": "上下相蒙。", "analogy": "王力《古代汉语》"},
  {"front": "蔽", "hl": "蔽", "word": "蔽", "meaning": "遮住，遮掩。楚辞国殇：\\\"旌～日兮敌若云。", "sentence": "旌蔽日兮敌若云。", "analogy": "王力《古代汉语》"},
  {"front": "荫", "hl": "荫", "word": "荫", "meaning": "荫", "sentence": "树成荫而众鸟息焉。", "analogy": "王力《古代汉语》"},
  {"front": "炙", "hl": "炙", "word": "炙", "meaning": "烧肉，烤肉。左传哀公十五年：\\\"～未熟。", "sentence": "炙未熟。", "analogy": "王力《古代汉语》"},
  {"front": "敛", "hl": "敛", "word": "敛", "meaning": "聚积，特指聚积财物。论语先进：\\\"而求也为之聚～而附益之。", "sentence": "敛轻雾，藏鸣湍。", "analogy": "王力《古代汉语》"},
  {"front": "贡", "hl": "贡", "word": "贡", "meaning": "贡", "sentence": "厥贡漆丝。", "analogy": "王力《古代汉语》"},
  {"front": "激", "hl": "激", "word": "激", "meaning": "遏阻水势。孟子告子上：\\\"今夫水，搏而跃之，可使过颡", "sentence": "今夫水，搏而跃之，可使过颡；激而行之，可使在山。", "analogy": "王力《古代汉语》"},
  {"front": "濯", "hl": "濯", "word": "濯", "meaning": "濯", "sentence": "沧浪之水清兮，可以濯我缨。", "analogy": "王力《古代汉语》"},
  {"front": "拂", "hl": "拂", "word": "拂", "meaning": "掸(dǎn)。楚辞卜居：\\\"詹尹乃端策～龟。", "sentence": "詹尹乃端策拂龟。", "analogy": "王力《古代汉语》"},
  {"front": "逆", "hl": "逆", "word": "逆", "meaning": "迎，迎接，迎着。跟\\\"送\\\"相对。", "sentence": "目逆而送之。", "analogy": "王力《古代汉语》"},
  {"front": "凋", "hl": "凋", "word": "凋", "meaning": "凋", "sentence": "玉露凋伤枫树林。", "analogy": "王力《古代汉语》"},
  {"front": "零", "hl": "零", "word": "零", "meaning": "零", "sentence": "零雨其濛。", "analogy": "王力《古代汉语》"},
  {"front": "屠", "hl": "屠", "word": "屠", "meaning": "屠", "sentence": "以屠狗为事。", "analogy": "王力《古代汉语》"},
  {"front": "灭", "hl": "灭", "word": "灭", "meaning": "把火熄掉。尚书盘庚上：\\\"若火之燎于原，不可向迩，其犹可扑～。", "sentence": "若火之燎于原，不可向迩，其犹可扑灭。", "analogy": "王力《古代汉语》"},
  {"front": "罄", "hl": "罄", "word": "罄", "meaning": "罄", "sentence": "瓶之罄矣。", "analogy": "王力《古代汉语》"},
  {"front": "尽", "hl": "尽", "word": "尽", "meaning": "不及物动词。无余，没有了。", "sentence": "野兽已尽而猎狗亨。", "analogy": "王力《古代汉语》"},
  {"front": "了", "hl": "了", "word": "了", "meaning": "了结，结束。李白侠客行：\\\"事～拂衣去。", "sentence": "事了拂衣去。", "analogy": "王力《古代汉语》"},
  {"front": "肖", "hl": "肖", "word": "肖", "meaning": "像，似，类似。老子六十七章：\\\"天下皆谓我道大似不～。", "sentence": "待用於人者，其肖於器耶？", "analogy": "王力《古代汉语》"},
  {"front": "暨", "hl": "暨", "word": "暨", "meaning": "及，与。尚书尧典：\\\"帝曰：\\'咨，汝羲～和！\\'\\\"（咨：感叹词。", "sentence": "让于稷契，暨皋陶。", "analogy": "王力《古代汉语》"},
  {"front": "逮", "hl": "逮", "word": "逮", "meaning": "及，到，达到。论语里仁：\\\"古者言之不出，耻躬之不～也。", "sentence": "古者言之不出，耻躬之不逮也。", "analogy": "王力《古代汉语》"},
  {"front": "暝", "hl": "暝", "word": "暝", "meaning": "暝", "sentence": "迷花倚石忽已暝。", "analogy": "王力《古代汉语》"},
  {"front": "黯", "hl": "黯", "word": "黯", "meaning": "黯", "sentence": "黯兮惨悴，风悲日曛。", "analogy": "王力《古代汉语》"},
  {"front": "悉", "hl": "悉", "word": "悉", "meaning": "悉", "sentence": "王命众，悉至于庭。", "analogy": "王力《古代汉语》"},
  {"front": "赢", "hl": "赢", "word": "赢", "meaning": "获取余利。左传昭公元年：\\\"贾而欲～，而恶嚣乎？", "sentence": "视垦田赢缩以稽本末。", "analogy": "王力《古代汉语》"},
  {"front": "短", "hl": "短", "word": "短", "meaning": "短", "sentence": "长", "analogy": "王力《古代汉语》"},
  {"front": "骄", "hl": "骄", "word": "骄", "meaning": "马高大壮健的样子。诗经卫风硕人：\\\"四牡有～。", "sentence": "四牡有骄。", "analogy": "王力《古代汉语》"},
  {"front": "慢", "hl": "慢", "word": "慢", "meaning": "倨傲不敬。跟\\\"敬\\\"相对。", "sentence": "敬", "analogy": "王力《古代汉语》"},
  {"front": "妄", "hl": "妄", "word": "妄", "meaning": "妄", "sentence": "飞不妄集，翔必择林。", "analogy": "王力《古代汉语》"},
  {"front": "层", "hl": "层", "word": "层", "meaning": "层", "sentence": "层峦耸翠，上出重霄。", "analogy": "王力《古代汉语》"},
  {"front": "乔", "hl": "乔", "word": "乔", "meaning": "高，特指树木的高大。多以\\\"乔木\\\"连用。", "sentence": "乔木", "analogy": "王力《古代汉语》"},
  {"front": "耿", "hl": "耿", "word": "耿", "meaning": "耿", "sentence": "以觐文王之耿光，以扬武王之大烈。", "analogy": "王力《古代汉语》"},
  {"front": "渺", "hl": "渺", "word": "渺", "meaning": "渺", "sentence": "渺渺", "analogy": "王力《古代汉语》"},
  {"front": "缛", "hl": "缛", "word": "缛", "meaning": "缛", "sentence": "故其馆室次舍，采饰纤缛。", "analogy": "王力《古代汉语》"},
  {"front": "稠", "hl": "稠", "word": "稠", "meaning": "稠", "sentence": "而稠人广坐，侍立终日。", "analogy": "王力《古代汉语》"},
  {"front": "综", "hl": "综", "word": "综", "meaning": "综", "sentence": "错综复杂", "analogy": "王力《古代汉语》"},
  {"front": "杂", "hl": "杂", "word": "杂", "meaning": "动词。五彩相合。", "sentence": "杂然而前陈者，太守宴也。", "analogy": "王力《古代汉语》"},
  {"front": "尘", "hl": "尘", "word": "尘", "meaning": "飞扬的细土。庄子逍遥游：\\\"野马也，～埃也，生物之以息相吹也。", "sentence": "况我堕胡尘，及归尽华发。", "analogy": "王力《古代汉语》"},
  {"front": "霭", "hl": "霭", "word": "霭", "meaning": "霭", "sentence": "霭霭", "analogy": "王力《古代汉语》"},
  {"front": "峦", "hl": "峦", "word": "峦", "meaning": "小而尖的山。孔稚珪北山移文：\\\"望林～而有失。", "sentence": "望林峦而有失。", "analogy": "王力《古代汉语》"},
  {"front": "岩", "hl": "岩", "word": "岩", "meaning": "高峻的山，陡崖。世说新语容止：\\\"双目闪闪如～下电。", "sentence": "双目闪闪如岩下电。", "analogy": "王力《古代汉语》"},
  {"front": "阿", "hl": "阿", "word": "阿", "meaning": "大山。诗经小雅菁菁者莪：\\\"在彼中～。", "sentence": "在彼中阿。", "analogy": "王力《古代汉语》"},
  {"front": "隅", "hl": "隅", "word": "隅", "meaning": "靠边的地方，角落。诗经邶风静女：\\\"俟我於城～。", "sentence": "俟我於城隅。", "analogy": "王力《古代汉语》"},
  {"front": "畔", "hl": "畔", "word": "畔", "meaning": "田界。左传襄公二十五年：\\\"行无越思，如农之有～。", "sentence": "行无越思，如农之有畔。", "analogy": "王力《古代汉语》"},
  {"front": "际", "hl": "际", "word": "际", "meaning": "两墙相接处叫\\\"际\\\"。引申为一般事物的相交，会合。", "sentence": "际", "analogy": "王力《古代汉语》"},
  {"front": "纶", "hl": "纶", "word": "纶", "meaning": "青丝绶带。礼记缁衣：\\\"王言如丝，其出如～。", "sentence": "王言如丝，其出如纶。", "analogy": "王力《古代汉语》"},
  {"front": "纂", "hl": "纂", "word": "纂", "meaning": "赤色的丝带。汉书宣帝纪：\\\"锦绣～组，害女红者也。", "sentence": "锦绣纂组，害女红者也。", "analogy": "王力《古代汉语》"},
  {"front": "床", "hl": "床", "word": "床", "meaning": "床", "sentence": "宋人惧，使华元夜入楚师，登子反之床。", "analogy": "王力《古代汉语》"},
  {"front": "蓐", "hl": "蓐", "word": "蓐", "meaning": "蓐", "sentence": "训卒利兵，秣马蓐食，潜师而起。", "analogy": "王力《古代汉语》"},
  {"front": "厨", "hl": "厨", "word": "厨", "meaning": "厨房。孟子梁惠王上：\\\"是以君子远庖～也。", "sentence": "是以君子远庖厨也。", "analogy": "王力《古代汉语》"},
  {"front": "筵", "hl": "筵", "word": "筵", "meaning": "筵", "sentence": "铺筵席，陈尊俎。", "analogy": "王力《古代汉语》"},
  {"front": "肌", "hl": "肌", "word": "肌", "meaning": "肌", "sentence": "藐姑射之山，有神人居焉，肌肤如冰雪。", "analogy": "王力《古代汉语》"},
  {"front": "肤", "hl": "肤", "word": "肤", "meaning": "肤", "sentence": "肤如凝脂。", "analogy": "王力《古代汉语》"},
];

const DECK_GAOZHONG = [
  {"front": "学不可以已", "hl": "已", "word": "已", "meaning": "停止", "analogy": "★《劝学》"},
  {"front": "木直中绳，其曲中规", "hl": "中", "word": "中(zhòng)", "meaning": "合乎", "analogy": "★《劝学》"},
  {"front": "虽有槁暴，不复挺者", "hl": "挺", "word": "挺", "meaning": "直", "analogy": "★《劝学》"},
  {"front": "君子生非异也，善假于物也", "hl": "假", "word": "假", "meaning": "借助", "analogy": "★《劝学》"},
  {"front": "假舟楫者，非能水也，而绝江河", "hl": "绝", "word": "绝", "meaning": "横渡", "analogy": "★《劝学》"},
  {"front": "锲而不舍，金石可镂", "hl": "镂", "word": "镂", "meaning": "雕刻", "analogy": "★《劝学》"},
  {"front": "古之学者必有师 / 吾从而师之", "hl": "师", "word": "师", "meaning": "老师/以……为师", "analogy": "★《师说》"},
  {"front": "师者，所以传道受业解惑也", "hl": "受", "word": "受", "meaning": "通「授」,传授", "analogy": "★《师说》"},
  {"front": "人非生而知之者，孰能无惑", "hl": "惑", "word": "惑", "meaning": "疑惑", "analogy": "★《师说》"},
  {"front": "巫医乐师百工之人，君子不齿", "hl": "不齿", "word": "不齿", "meaning": "看不起", "analogy": "★《师说》"},
  {"front": "术业有专攻", "hl": "术业", "word": "术业", "meaning": "学术技艺", "analogy": "★《师说》"},
  {"front": "壬戌之秋，七月既望", "hl": "既望", "word": "既望", "meaning": "农历每月十六日", "analogy": "★《赤壁赋》"},
  {"front": "举酒属客，诵明月之诗", "hl": "属", "word": "属(zhǔ)", "meaning": "劝请", "analogy": "★《赤壁赋》"},
  {"front": "纵一苇之所如，凌万顷之茫然", "hl": "如", "word": "如", "meaning": "往", "analogy": "★《赤壁赋》"},
  {"front": "苏子愀然，正襟危坐", "hl": "愀然", "word": "愀(qiǎo)然", "meaning": "容色改变的样子", "analogy": "★《赤壁赋》"},
  {"front": "是造物者之无尽藏也，而吾与子之所共适", "hl": "适", "word": "适", "meaning": "享有", "analogy": "★《赤壁赋》"},
  {"front": "泰山之阳，汶水西流；其阴，济水东流", "hl": "阳/阴", "word": "阳/阴", "meaning": "山南/山北", "analogy": "★《登泰山记》"},
  {"front": "自京师乘风雪，历齐河、长清", "hl": "乘", "word": "乘", "meaning": "冒着", "analogy": "★《登泰山记》"},
  {"front": "越长城之限，至于泰安", "hl": "限", "word": "限", "meaning": "界限/门槛", "analogy": "★《登泰山记》"},
  {"front": "苍山负雪，明烛天南", "hl": "烛", "word": "烛", "meaning": "照", "analogy": "★《登泰山记》"},
  {"front": "戊申晦，五鼓，与子颍坐日观亭", "hl": "晦", "word": "晦", "meaning": "农历每月最后一天", "analogy": "★《登泰山记》"},
  {"front": "对酒当歌，人生几何", "hl": "几何", "word": "几何", "meaning": "多少", "analogy": "★《短歌行》"},
  {"front": "越陌度阡，枉用相存", "hl": "存", "word": "存", "meaning": "问候、探望", "analogy": "★《短歌行》"},
  {"front": "山不厌高，海不厌深", "hl": "厌", "word": "厌", "meaning": "满足", "analogy": "★《短歌行》"},
  {"front": "少无适俗韵，性本爱丘山", "hl": "韵", "word": "韵", "meaning": "气质、情致", "analogy": "★《归园田居》"},
  {"front": "开荒南野际，守拙归园田", "hl": "守拙", "word": "守拙", "meaning": "持守愚拙本性", "analogy": "★《归园田居》"},
  {"front": "海客谈瀛洲，烟涛微茫信难求", "hl": "信", "word": "信", "meaning": "实在", "analogy": "★《梦游天姥吟留别》"},
  {"front": "势拔五岳掩赤城", "hl": "拔", "word": "拔", "meaning": "超出", "analogy": "★《梦游天姥吟留别》"},
  {"front": "熊咆龙吟殷岩泉", "hl": "殷", "word": "殷(yǐn)", "meaning": "震动", "analogy": "★《梦游天姥吟留别》"},
  {"front": "予左迁九江郡司马", "hl": "左迁", "word": "左迁", "meaning": "降职", "analogy": "★《琵琶行》"},
  {"front": "年长色衰，委身为贾人妇", "hl": "委身", "word": "委身", "meaning": "嫁人", "analogy": "★《琵琶行》"},
  {"front": "低眉信手续续弹，说尽心中无限事", "hl": "信手", "word": "信手", "meaning": "随手", "analogy": "★《琵琶行》"},
  {"front": "人生如梦，一尊还酹江月", "hl": "酹", "word": "酹(lèi)", "meaning": "洒酒祭奠", "analogy": "★《念奴娇》"},
  {"front": "今齐地方千里", "hl": "地方", "word": "地方(古)", "meaning": "土地/方圆", "analogy": "★古今异义"},
  {"front": "未尝不叹息痛恨于桓、灵也", "hl": "痛恨", "word": "痛恨(古)", "meaning": "痛心/遗憾", "analogy": "★古今异义"},
  {"front": "乃不知有汉，无论魏晋", "hl": "无论", "word": "无论(古)", "meaning": "不要说", "analogy": "★古今异义"},
  {"front": "因为长句，歌以赠之", "hl": "因为", "word": "因为(古)", "meaning": "因此/创作", "analogy": "★古今异义"},
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
    dbLocal.run("CREATE TABLE IF NOT EXISTS wrong_items (id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id INTEGER, module TEXT, question TEXT, user_answer TEXT, correct_answer TEXT, wrong_count INTEGER DEFAULT 1, wrong_at TEXT DEFAULT (datetime('now','localtime')), reviewed INTEGER DEFAULT 0)");
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
];const DECKS = {shici:DECK_SHIPIN, xuci:DECK_XUCI, wenxue:DECK_WENXUE, guhanyu:DECK_GUHANYU, gaozhong:DECK_GAOZHONG};const PLAN_WEEKS = {
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
window.DECKS = DECKS;
window.DECK_XUCI = DECK_XUCI;
window.PLAN_WEEKS = PLAN_WEEKS;
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
  document.getElementById('fcAnalogy').textContent = card.analogy || '';
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

document.addEventListener('click', e => { const btn = e.target.closest('.deck-btn'); if (btn) initDeck(btn.dataset.deck); });// exercises.js — 训练练习模块
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
window.renderDailyExercise = renderDailyExercise;var htmlesc = App.htmlesc;
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
  if (page === 'calendar') { renderCalendar(); }
  if (page === 'records') { renderRecords(); }
  if (page === 'classical' && deckQueue && deckQueue.length > 0) { showCard(); }
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
const DAILY_TASKS = ['flashcard', 'reading', 'classical', 'language', 'writing'];
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
function updateTaskCounts() {
  var counts = {flashcard:193, reading:9, classical:50, language:9, writing:9};
  for (var t in counts) {
    var el = document.getElementById('taskCnt-'+t);
    var inp = document.getElementById('quota-'+t);
    var d = inp ? parseInt(inp.value)||1 : (App.DAILY_COUNTS[t]||1);
    if (el) { el.textContent = ' · ' + d + '/' + counts[t] + '题'; }
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
  if (page === 'flashcard') navigate('classical', true);
  else navigate(page, true);
  // Task completion is tracked by actual activity (rateCard, applyTemplate, etc.)
  // which call markTaskDone() when the user genuinely completes an exercise.
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
// Export shared state via getter/setter (minification-safe, no eval)
var _stateVars = ['currentPage','currentDeck','deckIndex','deckQueue','flipped','cardTimer','cardSeconds','streak','lastActive','templateCount','grammarCount','timerSeconds','timerRunning','timerInterval','completedTasks'];
_stateVars.forEach(function(k) {
  Object.defineProperty(window, k, {
    get: function() { return S[k]; },
    set: function(v) { S[k] = v; },
    configurable: true, enumerable: true
  });
});
})(  {"front": "以吾一日长乎尔，毋吾以也", "hl": "以", "word": "以", "meaning": "因为/同「已」,停止", "analogy": "★《侍坐》"},
  {"front": "居则曰：不吾知也", "hl": "居", "word": "居", "meaning": "平日", "analogy": "★《侍坐》"},
  {"front": "且知方也 / 方六七十", "hl": "方", "word": "方", "meaning": "准则/计量土地", "analogy": "★《侍坐》"},
  {"front": "如五六十 / 如其礼乐", "hl": "如", "word": "如", "meaning": "或者/至于", "analogy": "★《侍坐》"},
  {"front": "以俟君子", "hl": "俟", "word": "俟(sì)", "meaning": "等待", "analogy": "★《侍坐》"},
  {"front": "异乎三子者之撰", "hl": "撰", "word": "撰(zhuàn)", "meaning": "才能", "analogy": "★《侍坐》"},
  {"front": "舍瑟而作", "hl": "作", "word": "作", "meaning": "站起来", "analogy": "★《侍坐》"},
  {"front": "吾与点也", "hl": "与", "word": "与(yǔ)", "meaning": "赞成", "analogy": "★《侍坐》"},
  {"front": "仲尼之徒无道桓文之事者", "hl": "道", "word": "道", "meaning": "讲述", "analogy": "★《齐桓晋文》"},
  {"front": "保民而王，莫之能御也", "hl": "保", "word": "保", "meaning": "安民", "analogy": "★《齐桓晋文》"},
  {"front": "牛何之", "hl": "之", "word": "之", "meaning": "往", "analogy": "★《齐桓晋文》"},
  {"front": "将以衅钟", "hl": "衅", "word": "衅(xìn)", "meaning": "血祭", "analogy": "★《齐桓晋文》"},
  {"front": "舍之！吾不忍其觳觫", "hl": "舍", "word": "舍", "meaning": "释放", "analogy": "★《齐桓晋文》"},
  {"front": "若无罪而就死地", "hl": "就", "word": "就", "meaning": "走向", "analogy": "★《齐桓晋文》"},
  {"front": "百姓皆以王为爱也", "hl": "爱", "word": "爱", "meaning": "吝惜", "analogy": "★《齐桓晋文》"},
  {"front": "王无异于百姓之以王为爱也", "hl": "异", "word": "异", "meaning": "奇怪", "analogy": "★《齐桓晋文》"},
  {"front": "彼恶知之", "hl": "恶", "word": "恶(wū)", "meaning": "怎么", "analogy": "★《齐桓晋文》"},
  {"front": "他人有心，予忖度之", "hl": "度", "word": "度(duó)", "meaning": "揣测/称量", "analogy": "★《齐桓晋文》"},
  {"front": "百姓之不见保", "hl": "见", "word": "见", "meaning": "被", "analogy": "★《齐桓晋文》"},
  {"front": "刑于寡妻", "hl": "刑", "word": "刑", "meaning": "做榜样", "analogy": "★《齐桓晋文》"},
  {"front": "欲辟土地 / 放辟邪侈", "hl": "辟", "word": "辟(pì)", "meaning": "开辟/不正", "analogy": "★《齐桓晋文》"},
  {"front": "殆有甚焉", "hl": "殆", "word": "殆(dài)", "meaning": "恐怕", "analogy": "★《齐桓晋文》"},
  {"front": "盖亦反其本矣", "hl": "盖", "word": "盖(hé)", "meaning": "何不", "analogy": "★《齐桓晋文》"},
  {"front": "是罔民也", "hl": "罔", "word": "罔(wǎng)", "meaning": "陷害", "analogy": "★《齐桓晋文》"},
  {"front": "俯足以畜妻子", "hl": "畜", "word": "畜(xù)", "meaning": "养活", "analogy": "★《齐桓晋文》"},
  {"front": "此惟救死而恐不赡", "hl": "赡", "word": "赡(shàn)", "meaning": "足", "analogy": "★《齐桓晋文》"},
  {"front": "莫不中音", "hl": "中", "word": "中(zhòng)", "meaning": "合乎", "analogy": "★《庖丁解牛》"},
  {"front": "乃中《经首》之会", "hl": "会", "word": "会", "meaning": "节奏", "analogy": "★《庖丁解牛》"},
  {"front": "进乎技矣", "hl": "进", "word": "进", "meaning": "超过", "analogy": "★《庖丁解牛》"},
  {"front": "臣以神遇而不以目视", "hl": "遇", "word": "遇", "meaning": "接触", "analogy": "★《庖丁解牛》"},
  {"front": "批大郤", "hl": "批", "word": "批", "meaning": "击入", "analogy": "★《庖丁解牛》"},
  {"front": "导大窾", "hl": "导", "word": "导", "meaning": "引导/引刀进入", "analogy": "★《庖丁解牛》"},
  {"front": "族庖月更刀 / 每至于族", "hl": "族", "word": "族", "meaning": "众/聚结处", "analogy": "★《庖丁解牛》"},
  {"front": "彼节者有间", "hl": "间", "word": "间(jiàn)", "meaning": "空隙", "analogy": "★《庖丁解牛》"},
  {"front": "如土委地", "hl": "委", "word": "委", "meaning": "散落", "analogy": "★《庖丁解牛》"},
  {"front": "善刀而藏之", "hl": "善", "word": "善", "meaning": "揩拭", "analogy": "★《庖丁解牛》"},
  {"front": "晋军函陵", "hl": "军", "word": "军", "meaning": "驻扎", "analogy": "★《烛之武》"},
  {"front": "且贰于楚也", "hl": "贰", "word": "贰", "meaning": "亲附", "analogy": "★《烛之武》"},
  {"front": "辞曰：臣之壮也，犹不如人", "hl": "辞", "word": "辞", "meaning": "推辞", "analogy": "★《烛之武》"},
  {"front": "越国以鄙远", "hl": "鄙", "word": "鄙", "meaning": "边邑", "analogy": "★《烛之武》"},
  {"front": "焉用亡郑以陪邻", "hl": "陪", "word": "陪", "meaning": "增加", "analogy": "★《烛之武》"},
  {"front": "共其乏困", "hl": "共", "word": "共(gōng)", "meaning": "供给", "analogy": "★《烛之武》"},
  {"front": "且君尝为晋君赐矣", "hl": "赐", "word": "赐", "meaning": "恩惠", "analogy": "★《烛之武》"},
  {"front": "朝济而夕设版焉", "hl": "济", "word": "济", "meaning": "渡河", "analogy": "★《烛之武》"},
  {"front": "既东封郑", "hl": "封", "word": "封", "meaning": "疆界", "analogy": "★《烛之武》"},
  {"front": "又欲肆其西封", "hl": "肆", "word": "肆", "meaning": "扩张", "analogy": "★《烛之武》"},
  {"front": "若不阙秦", "hl": "阙", "word": "阙(jué)", "meaning": "侵损", "analogy": "★《烛之武》"},
  {"front": "微夫人之力不及此", "hl": "微", "word": "微", "meaning": "没有", "analogy": "★《烛之武》"},
  {"front": "失其所与，不知", "hl": "与", "word": "与", "meaning": "同盟者", "analogy": "★《烛之武》"},
  {"front": "沛公欲王关中", "hl": "王", "word": "王(wàng)", "meaning": "称王", "analogy": "★《鸿门宴》"},
  {"front": "妇女无所幸", "hl": "幸", "word": "幸", "meaning": "宠爱", "analogy": "★《鸿门宴》"},
  {"front": "素善留侯张良", "hl": "善", "word": "善", "meaning": "交好", "analogy": "★《鸿门宴》"},
  {"front": "距关，毋内诸侯", "hl": "距/内", "word": "距内", "meaning": "据守/接纳", "analogy": "★《鸿门宴》"},
  {"front": "料大王士卒足以当项王乎", "hl": "当", "word": "当(dāng)", "meaning": "对等", "analogy": "★《鸿门宴》"},
  {"front": "项伯杀人，臣活之", "hl": "活", "word": "活", "meaning": "使……活命", "analogy": "★《鸿门宴》"},
  {"front": "张良出，要项伯", "hl": "要", "word": "要(yāo)", "meaning": "邀请", "analogy": "★《鸿门宴》"},
  {"front": "籍吏民，封府库", "hl": "籍", "word": "籍", "meaning": "造册登记", "analogy": "★《鸿门宴》"},
  {"front": "备他盗之出入与非常也", "hl": "非常", "word": "非常(古)", "meaning": "意外变故", "analogy": "★《鸿门宴》"},
  {"front": "愿伯具言臣之不敢倍德也", "hl": "倍", "word": "倍", "meaning": "背弃", "analogy": "★《鸿门宴》"},
  {"front": "旦日不可不蚤自来谢项王", "hl": "谢", "word": "谢", "meaning": "道歉/辞别", "analogy": "★《鸿门宴》"},
  {"front": "然不自意能先入关破秦", "hl": "意", "word": "意", "meaning": "料想", "analogy": "★《鸿门宴》"},
  {"front": "范增数目项王", "hl": "目", "word": "目", "meaning": "递眼色", "analogy": "★《鸿门宴》"},
  {"front": "常以身翼蔽沛公", "hl": "翼蔽", "word": "翼蔽(yìbì)", "meaning": "遮护", "analogy": "★《鸿门宴》"},
  {"front": "哙遂入，披帷西向立", "hl": "披", "word": "披", "meaning": "分开", "analogy": "★《鸿门宴》"},
  {"front": "项王按剑而跽", "hl": "跽", "word": "跽(jì)", "meaning": "挺直身子", "analogy": "★《鸿门宴》"},
  {"front": "刑人如恐不胜 / 不胜杯杓", "hl": "胜", "word": "胜", "meaning": "尽/承受", "analogy": "★《鸿门宴》"},
  {"front": "大礼不辞小让", "hl": "让", "word": "让", "meaning": "责备", "analogy": "★《鸿门宴》"},
  {"front": "大王来何操", "hl": "操", "word": "操", "meaning": "拿", "analogy": "★《鸿门宴》"},
  {"front": "道芷阳间行", "hl": "道/间", "word": "道间", "meaning": "取道/秘密地", "analogy": "★《鸿门宴》"},
  {"front": "闻大王有意督过之", "hl": "督过", "word": "督过", "meaning": "责备", "analogy": "★《鸿门宴》"},
  {"front": "并国二十", "hl": "并", "word": "并", "meaning": "兼并", "analogy": "★《谏逐客书》"},
  {"front": "举地千里", "hl": "举", "word": "举", "meaning": "攻克", "analogy": "★《谏逐客书》"},
  {"front": "拔三川之地", "hl": "拔", "word": "拔", "meaning": "攻取", "analogy": "★《谏逐客书》"},
  {"front": "向使四君却客而不内", "hl": "内", "word": "内(nà)", "meaning": "接纳", "analogy": "★《谏逐客书》"},
  {"front": "服太阿之剑", "hl": "服", "word": "服", "meaning": "佩带", "analogy": "★《谏逐客书》"},
  {"front": "而陛下说之", "hl": "说", "word": "说(yuè)", "meaning": "喜欢", "analogy": "★《谏逐客书》"},
  {"front": "今乃弃黔首以资敌国", "hl": "资", "word": "资", "meaning": "资助", "analogy": "★《谏逐客书》"},
  {"front": "却宾客以业诸侯", "hl": "业", "word": "业", "meaning": "使成就霸业", "analogy": "★《谏逐客书》"},
  {"front": "藉寇兵而赍盗粮", "hl": "赍", "word": "赍(jī)", "meaning": "送给", "analogy": "★《谏逐客书》"},
  {"front": "臣闻求木之长者，必固其根本", "hl": "长", "word": "长(zhǎng)", "meaning": "生长", "analogy": "★《谏太宗十思疏》"},
  {"front": "必浚其泉源", "hl": "浚", "word": "浚(jùn)", "meaning": "疏通", "analogy": "★《谏太宗十思疏》"},
  {"front": "人君当神器之重", "hl": "当", "word": "当", "meaning": "掌握", "analogy": "★《谏太宗十思疏》"},
  {"front": "永保无疆之休", "hl": "休", "word": "休", "meaning": "喜庆", "analogy": "★《谏太宗十思疏》"},
  {"front": "能克终者盖寡", "hl": "克", "word": "克", "meaning": "能够", "analogy": "★《谏太宗十思疏》"},
  {"front": "既得志，则纵情以傲物", "hl": "物", "word": "物", "meaning": "人", "analogy": "★《谏太宗十思疏》"},
  {"front": "虽董之以严刑", "hl": "董", "word": "董(dǒng)", "meaning": "督察", "analogy": "★《谏太宗十思疏》"},
  {"front": "振之以威怒", "hl": "振", "word": "振", "meaning": "威吓", "analogy": "★《谏太宗十思疏》"},
  {"front": "简能而任之", "hl": "简", "word": "简", "meaning": "选拔", "analogy": "★《谏太宗十思疏》"},
  {"front": "所操之术多异故也", "hl": "操", "word": "操", "meaning": "持", "analogy": "★《答司马谏议书》"},
  {"front": "终必不蒙见察", "hl": "察", "word": "察", "meaning": "理解", "analogy": "★《答司马谏议书》"},
  {"front": "故略上报", "hl": "报", "word": "报", "meaning": "回信", "analogy": "★《答司马谏议书》"},
  {"front": "不复一一自辩", "hl": "辩", "word": "辩", "meaning": "分辩", "analogy": "★《答司马谏议书》"},
  {"front": "故今具道所以", "hl": "具", "word": "具", "meaning": "详细", "analogy": "★《答司马谏议书》"},
  {"front": "难壬人", "hl": "难", "word": "难(nàn)", "meaning": "排斥", "analogy": "★《答司马谏议书》"},
  {"front": "盘庚不为怨者故改其度", "hl": "度", "word": "度(dù)", "meaning": "计划", "analogy": "★《答司马谏议书》"},
  {"front": "度义而后动", "hl": "度", "word": "度(duó)", "meaning": "考虑", "analogy": "★《答司马谏议书》"},
  {"front": "以膏泽斯民", "hl": "膏泽", "word": "膏泽(gāozé)", "meaning": "施恩惠", "analogy": "★《答司马谏议书》"},
  {"front": "六王毕，四海一", "hl": "一", "word": "一", "meaning": "统一", "analogy": "★《阿房宫赋》"},
  {"front": "蜀山兀，阿房出", "hl": "兀", "word": "兀(wù)", "meaning": "光秃", "analogy": "★《阿房宫赋》"},
  {"front": "直走咸阳", "hl": "走", "word": "走", "meaning": "通达", "analogy": "★《阿房宫赋》"},
  {"front": "矗不知其几千万落", "hl": "矗", "word": "矗(chù)", "meaning": "矗立", "analogy": "★《阿房宫赋》"},
  {"front": "而望幸焉", "hl": "幸", "word": "幸", "meaning": "帝王到某处", "analogy": "★《阿房宫赋》"},
  {"front": "剽掠其人", "hl": "剽", "word": "剽(piāo)", "meaning": "抢劫", "analogy": "★《阿房宫赋》"},
  {"front": "函谷举", "hl": "举", "word": "举", "meaning": "攻占", "analogy": "★《阿房宫赋》"},
  {"front": "族秦者秦也", "hl": "族", "word": "族", "meaning": "灭族", "analogy": "★《阿房宫赋》"},
  {"front": "则递三世可至万世而为君", "hl": "递", "word": "递", "meaning": "依次", "analogy": "★《阿房宫赋》"},
  {"front": "弊在赂秦", "hl": "弊", "word": "弊", "meaning": "弊端", "analogy": "★《六国论》"},
  {"front": "不能独完", "hl": "完", "word": "完", "meaning": "保全", "analogy": "★《六国论》"},
  {"front": "故不战而强弱胜负已判矣", "hl": "判", "word": "判", "meaning": "确定", "analogy": "★《六国论》"},
  {"front": "与嬴而不助五国也", "hl": "与", "word": "与", "meaning": "亲附", "analogy": "★《六国论》"},
  {"front": "始速祸焉", "hl": "速", "word": "速", "meaning": "招致", "analogy": "★《六国论》"},
  {"front": "李牧连却之", "hl": "却", "word": "却", "meaning": "打退", "analogy": "★《六国论》"},
  {"front": "洎牧以谗诛", "hl": "洎", "word": "洎(jì)", "meaning": "等到", "analogy": "★《六国论》"},
  {"front": "为秦人积威之所劫", "hl": "劫", "word": "劫", "meaning": "胁迫", "analogy": "★《六国论》"},
  {"front": "下而从六国破亡之故事", "hl": "故事", "word": "故事(古)", "meaning": "旧事", "analogy": "★《六国论》"},
);
