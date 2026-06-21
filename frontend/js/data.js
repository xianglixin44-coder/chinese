/* 数据定义 */
var SYMBOLS=[{sym:"[ ]",name:"核心概念框"},{sym:"/",name:"层次分割线"},{sym:"?",name:"困惑标记"},{sym:"★",name:"主旨句标记"},{sym:"~~~",name:"论据波浪线"},{sym:"→",name:"逻辑箭头"},{sym:"▲",name:"品味标记"}];

var TEMPLATES={
  A1:"诚然，________在某种程度上具有其合理性……然而，如果我们审视________，就会发现……",
  A2:"有人可能会说________。这种观点并非全无道理，但它忽略了一个关键前提：________。",
  A3:"如果我们仅仅停留在________的层面讨论问题，难免失之狭隘。更值得追问的是：________？",
  A4:"在________条件下，________确实成立。但我们讨论的是________语境，因此需要重新审视。",
  B1:"这并非偶然的巧合，而是________的必然结果。究其本质，是因为________。",
  B2:"从表层看，________；但从深层看，________。更进一步，________。",
  B3:"这与________的原理如出一辙。正如________，我们也应当________。",
  B4:"这种观点的前提是________。但这个前提本身值得商榷，因为________。",
  C1:"由此，我们不仅看到了________，更应当警惕________。",
  C2:"当然，________也并非全无价值。关键在于，我们如何在________与________之间找到平衡。",
  C3:"关于这个问题，或许没有最终的答案。但重要的是，我们开始了________的思考。",
  C4:"推而广之，________的启示远不止于此。它关乎我们如何理解________这一更大的命题。"
};

var DECKS={
  shici:[
    {front:"群臣吏民能面刺寡人之过者",hl:"面",word:"面",meaning:"当面",analogy:"face to face"},
    {front:"邹忌修八尺有余",hl:"修",word:"修",meaning:"身高",analogy:"身高/长度"},
    {front:"徐公何能及君也",hl:"及",word:"及",meaning:"比得上",analogy:"赶得上"},
    {front:"吾妻之美我者，私我也",hl:"私",word:"私",meaning:"偏爱",analogy:"私下偏向"},
    {front:"能谤讥于市朝",hl:"谤讥",word:"谤讥",meaning:"公开批评",analogy:"公开提意见"},
    {front:"数月之后，时时而间进",hl:"间",word:"间",meaning:"偶尔",analogy:"occasionally"},
    {front:"先帝创业未半而中道崩殂",hl:"崩殂",word:"崩殂",meaning:"帝王去世",analogy:"驾崩"},
    {front:"此诚危急存亡之秋也",hl:"秋",word:"秋",meaning:"时候",analogy:"关键时刻"},
    {front:"是以先帝简拔以遗陛下",hl:"简拔",word:"简拔",meaning:"选拔",analogy:"挑选提拔"},
    {front:"未尝不叹息痛恨于桓灵也",hl:"痛恨",word:"痛恨",meaning:"痛心遗憾",analogy:"≠今义恨"},
    {front:"由是感激，遂许先帝以驱驰",hl:"感激",word:"感激",meaning:"感动奋发",analogy:"感动+激奋"},
    {front:"深入不毛",hl:"不毛",word:"不毛",meaning:"不长草木之地",analogy:"荒芜之地"},
    {front:"临表涕零",hl:"涕",word:"涕",meaning:"眼泪",analogy:"≠鼻涕"},
    {front:"以光先帝遗德",hl:"光",word:"光",meaning:"发扬光大",analogy:"使……光大"},
    {front:"余幼时即嗜学",hl:"嗜",word:"嗜",meaning:"特别爱好",analogy:"酷爱"},
    {front:"家贫，无从致书以观",hl:"致",word:"致",meaning:"得到",analogy:"获得"},
    {front:"尝趋百里外",hl:"趋",word:"趋",meaning:"快步走",analogy:"奔赴"},
    {front:"穷冬烈风，大雪深数尺",hl:"穷冬",word:"穷冬",meaning:"深冬",analogy:"极冷的冬天"},
    {front:"媵人持汤沃灌",hl:"汤",word:"汤",meaning:"热水",analogy:"≠菜汤"},
    {front:"寓逆旅，主人日再食",hl:"再",word:"再",meaning:"两次",analogy:"≠again"}
  ],
  xuci:[
    {front:"学而时习之",hl:"之",word:"之",meaning:"代词，它",analogy:"=它"},
    {front:"予独爱莲之出淤泥而不染",hl:"之",word:"之",meaning:"取消句子独立性",analogy:"不译"},
    {front:"何陋之有",hl:"之",word:"之",meaning:"宾语前置标志",analogy:"不译"},
    {front:"水陆草木之花",hl:"之",word:"之",meaning:"的",analogy:"=的"},
    {front:"温故而知新，可以为师矣",hl:"而",word:"而",meaning:"顺承",analogy:"=然后"},
    {front:"人不知而不愠",hl:"而",word:"而",meaning:"转折",analogy:"=但是"},
    {front:"不以物喜，不以己悲",hl:"以",word:"以",meaning:"因为",analogy:"=because"},
    {front:"以刀劈狼首",hl:"以",word:"以",meaning:"用",analogy:"=用"},
    {front:"策之不以其道",hl:"以",word:"以",meaning:"按照",analogy:"=按照"},
    {front:"乃重修岳阳楼",hl:"乃",word:"乃",meaning:"于是",analogy:"=于是"}
  ],
  wenxue:[
    {front:"《诗经》六义",hl:"六义",word:"六义",meaning:"风雅颂赋比兴",analogy:"内容+手法"},
    {front:"唐宋八大家",hl:"唐宋",word:"八大家",meaning:"韩柳欧王曾三苏",analogy:"八位散文家"},
    {front:"四大名著",hl:"四大",word:"四大名著",meaning:"三国水浒西游红楼",analogy:"明清小说"},
    {front:"鲁迅代表作",hl:"鲁迅",word:"代表作",meaning:"呐喊彷徨朝花夕拾",analogy:"小说+散文"}
  ]
};

var READING_PASSAGES=[{
  id:'rc1',title:'信息类·人工智能与教育',
  passage:'人工智能正在重塑教育生态。一方面，个性化学习系统可以根据学生的认知水平定制内容；另一方面，过度依赖算法推荐可能导致"信息茧房"，使学生只能接触舒适区内的知识。因此，技术赋能教育的关键不在于技术本身有多先进，而在于我们如何设计"人机协作"的教育生态。',
  questions:[
    {q:'1. 下列关于"技术赋能教育"的理解，正确的一项是',options:['A.技术越先进教育效果越好','B.关键在于设计人机协作的生态','C.AI可完全替代教师','D.算法推荐必然导致信息茧房'],answer:1},
    {q:'2. 文中"信息茧房"指的是',options:['A.信息爆炸导致的选择困难','B.算法限制导致只接触舒适区知识','C.学生沉迷于信息技术','D.教育资源分配不均'],answer:1},
    {q:'3. 作者对AI教育的态度是',options:['A.全面肯定','B.全面否定','C.审慎乐观，强调设计','D.不作评价'],answer:2}
  ]
},{
  id:'rc2',title:'文学类·巷口的等待',
  passage:'他站在巷口，手里攥着一张对折的纸。风从巷子里灌出来，把纸角吹得一掀一掀的，像一只受伤的鸟在扑棱翅膀。他没有打开它——他已经看了太多遍。那些字像是用针尖划在纸面上的，每一个都扎眼睛。他只是在等，等巷子尽头那扇门打开，或者永远不开。',
  questions:[
    {q:'1. "像一只受伤的鸟在扑棱翅膀"使用的修辞手法及作用是',options:['A.拟人，赋予纸以生命','B.比喻，以动作写焦虑','C.夸张，突出风的大','D.排比，强化情感'],answer:1},
    {q:'2. "每一个都扎眼睛"的表达效果是',options:['A.字迹潦草难看','B.以痛觉写视觉冲击','C.纸张质量差','D.眼睛疲劳'],answer:1},
    {q:'3. 结尾"或者永远不开"暗示了',options:['A.门坏了','B.等待可能无果','C.他不想等了','D.天黑了'],answer:1}
  ]
}];

function renderReadingTabs(){
  var c=document.getElementById('readingTabs-content');if(!c)return;
  var h='';
  READING_PASSAGES.forEach(function(p){
    h+='<div class="tab-content'+(p.id==='rc1'?' active':'')+'" id="tab-'+p.id+'">';
    h+='<div class="ex-passage" style="line-height:2;font-size:14px">'+htmlesc(p.passage)+'</div>';
    p.questions.forEach(function(q,qi){
      var qid=p.id+'-q'+qi;
      h+='<div class="exercise-item mt-8"><p><strong>'+htmlesc(q.q)+'</strong></p><div style="display:grid;gap:4px;margin:8px 0">';
      q.options.forEach(function(o,oi){
        h+='<label class="ex-option"><input type="radio" name="'+qid+'" value="'+oi+'" onchange="checkReadingAnswer(\''+qid+'\','+oi+','+q.answer+')"> '+htmlesc(o)+'</label>';
      });
      h+='</div><div class="ex-answer" id="'+qid+'-result" style="display:none"></div></div>';
    });
    h+='</div>';
  });
  c.innerHTML=h;
}

function checkReadingAnswer(qid,chosen,correct){
  var el=document.getElementById(qid+'-result');if(!el)return;el.style.display='block';
  if(chosen===correct){el.innerHTML='<p style="color:#27ae60;font-weight:600">正确！+3分</p>';checkStreak();markTaskDone('reading')}
  else{var tq=null;READING_PASSAGES.forEach(function(p){p.questions.forEach(function(q,i){if(p.id+'-q'+i===qid)tq=q})});el.innerHTML='<p style="color:#c0392b">错误。正确答案：'+htmlesc(tq?tq.options[correct]:'')+'</p>'}
}

function renderSymbols(){
  var g=document.getElementById('symGrid');if(!g)return;
  g.innerHTML=SYMBOLS.map(function(s){return '<div class="sym-card"><div class="sym">'+s.sym+'</div><div class="sym-name">'+s.name+'</div></div>'}).join('');
}
