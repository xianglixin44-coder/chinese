// config.js — 全局常量
var App = window.App || {};

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




// SRS_INTERVALS / DAILY_CARD_LIMIT / DAILY_TASKS defined in config.js

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
function doCheck(name, correct) { document.getElementById(`ex-${name}`).style.display = 'block'; document.querySelectorAll(`input[name="${name}"]`).forEach(r => { const l = r.closest('.ex-option'); if (l) { l.classList.remove('correct', 'wrong'); if (r.checked && r.value === correct) l.classList.add('correct'); else if (r.checked) l.classList.add('wrong'); } }); }
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
