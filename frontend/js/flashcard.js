/* 闪卡 SRS 系统 */
var SRS_INTERVALS=[1,2,4,8,16,32,64,128],MASTERY_INTERVAL=32;

function initDeck(name){
  currentDeck=name;deckIndex=0;
  var total=DECKS[name].length,today=new Date().toISOString().slice(0,10);
  var srsRows=dbGet("SELECT card_idx,interval_days,repetitions,next_review,mastered FROM card_srs WHERE deck=?",[name]);
  var srsMap={};srsRows.forEach(function(r){srsMap[r[0]]={interval:r[1],reps:r[2],next:r[3],mastered:r[4]}});
  var due=[],nw=[];
  for(var i=0;i<total;i++){var s=srsMap[i];if(!s||!s.next)nw.push(i);else if(s.next<=today&&!s.mastered)due.push(i)}
  shuffle(due);shuffle(nw);
  var limited=nw.slice(0,DAILY_CARD_LIMIT);
  deckQueue=due.concat(limited);
  var el=document.getElementById('fcStats'),mastered=srsRows.filter(function(r){return r[4]}).length;
  if(el)el.textContent='待复习:'+due.length+' | 新卡:'+limited.length+(nw.length>DAILY_CARD_LIMIT?'(上限'+DAILY_CARD_LIMIT+')':'')+' | 已掌握:'+mastered;
  showCard();
  document.querySelectorAll('.deck-btn').forEach(function(b){b.classList.toggle('active',b.dataset.deck===name)});
}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}}
function sanitizeHTML(s){return s?String(s).replace(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,'').replace(/on\w+\s*=\s*["'][^"']*["']/gi,''):''}
function showCard(){
  if(deckQueue.length===0){
    if(cardTimer){clearInterval(cardTimer);cardTimer=null}
    var m=dbGet("SELECT COUNT(*) FROM card_srs WHERE deck=? AND mastered=1",[currentDeck]);
    document.getElementById('fcStats').textContent=m.length&&m[0][0]>=DECKS[currentDeck].length?'全部掌握！':'今日完成';
    document.getElementById('fcFront').textContent='';document.getElementById('fcWord').textContent='';
    document.getElementById('fcMeaning').textContent='';document.getElementById('fcAnalogy').textContent='';
    flipped=false;document.getElementById('flashcard').classList.remove('flipped');return
  }
  if(cardTimer)clearInterval(cardTimer);cardSeconds=20;
  var t=document.getElementById('fcTimer');if(t){t.textContent='20s';t.classList.remove('urgent')}
  cardTimer=setInterval(function(){
    cardSeconds--;if(t)t.textContent=cardSeconds+'s';if(cardSeconds<=5&&t)t.classList.add('urgent');
    if(cardSeconds<=0){clearInterval(cardTimer);cardTimer=null;if(t)t.textContent='超时';if(flipped)rateCard('again');else{flipCard();setTimeout(function(){rateCard('again')},1000)}}
  },1000);
  var card=DECKS[currentDeck][deckQueue[deckIndex]];
  document.getElementById('fcStats').textContent='卡片 '+(deckIndex+1)+'/'+deckQueue.length;
  var f=card.front;if(card.hl)f=f.replace(new RegExp('('+card.hl.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','g'),'<span class="fw-bold-highlight">$1</span>');
  document.getElementById('fcFront').innerHTML=sanitizeHTML(f);
  document.getElementById('fcWord').textContent=card.word;
  document.getElementById('fcMeaning').textContent=card.meaning;
  document.getElementById('fcAnalogy').textContent=card.analogy||'';
  flipped=false;document.getElementById('flashcard').classList.remove('flipped');
}
function flipCard(){if(deckQueue.length===0)return;flipped=!flipped;document.getElementById('flashcard').classList.toggle('flipped',flipped)}
function rateCard(rating){
  if(deckQueue.length===0)return;if(cardTimer){clearInterval(cardTimer);cardTimer=null}
  if(!flipped){flipCard();return}
  var idx=deckQueue[deckIndex],card=DECKS[currentDeck][idx],today=new Date().toISOString().slice(0,10);
  dbRun("INSERT INTO flashcard_log(deck,card_word,rating) VALUES(?,?,?)",[currentDeck,card.word,rating]);
  var rows=dbGet("SELECT interval_days,repetitions FROM card_srs WHERE deck=? AND card_idx=?",[currentDeck,idx]);
  var interval=rows.length?rows[0][0]:0,reps=rows.length?rows[0][1]:0;
  if(rating==='again'){interval=1;reps=0}else if(rating==='hard'){if(interval===0)interval=1;reps++}
  else{if(interval===0)interval=1;else{var si=SRS_INTERVALS.indexOf(interval);interval=si>=0&&si<SRS_INTERVALS.length-1?SRS_INTERVALS[si+1]:interval}reps++}
  var next=new Date(Date.now()+interval*86400000).toISOString().slice(0,10),mastered=interval>=MASTERY_INTERVAL?1:0;
  apiCall('PUT','/api/card-srs',{deck:currentDeck,card_idx:idx,rating:rating,interval_days:interval,repetitions:reps,next_review:next,mastered:mastered});
  dbRun("INSERT OR REPLACE INTO card_srs(deck,card_idx,interval_days,repetitions,next_review,mastered) VALUES(?,?,?,?,?,?)",[currentDeck,idx,interval,reps,next,mastered]);
  if(mastered)deckQueue.splice(deckIndex,1);else if(rating==='again'){deckQueue.splice(deckIndex,1);deckQueue.push(idx)}
  else deckQueue.splice(deckIndex,1);
  if(deckQueue.length>0)deckIndex=deckIndex%deckQueue.length;else deckIndex=0;
  checkStreak();showCard();if(deckQueue.length<DECKS[currentDeck].length)markTaskDone('flashcard');
}
document.addEventListener('click',function(e){var b=e.target.closest('.deck-btn');if(b)initDeck(b.dataset.deck)});

// Grammar/Syntax/Rhetoric stubs
function analyzeGrammar(){var i=document.getElementById('grammarInput').value.trim();if(!i)return;document.getElementById('grammarResult').innerHTML='<div class="gram-step"><pre>请分析：\n1. 找出主干 S+V+O\n2. 判断语病类型\n3. 给出修改意见</pre></div>';dbRun("INSERT INTO grammar_log(sentence,example_idx,module) VALUES(?,-1,'language')",[i]);checkStreak();markTaskDone('language')}
function analyzeSyntax(){var i=document.getElementById('syntaxInput').value.trim();if(!i)return;document.getElementById('syntaxResult').innerHTML='<div class="gram-step"><pre>请拆解：\n1. 提主干\n2. 识别句式\n3. 还原现代汉语语序</pre></div>';dbRun("INSERT INTO grammar_log(sentence,example_idx,module) VALUES(?,-1,'classical')",[i]);checkStreak()}
function analyzeRhetoric(){var i=document.getElementById('rhetoricInput').value.trim();if(!i)return;document.getElementById('rhetoricResult').innerHTML='<div class="gram-step"><pre>请分析：\n1. 明手法\n2. 析具体\n3. 阐效果</pre></div>';dbRun("INSERT INTO grammar_log(sentence,example_idx,module) VALUES(?,-1,'rhetoric')",[i]);checkStreak()}

function renderCalendarMonth(){
  var c=document.getElementById('calContent');if(!c)return;
  var now=new Date(),y=now.getFullYear(),m=now.getMonth();
  var first=new Date(y,m,1),last=new Date(y,m+1,0);
  var h='<div class="cal-header"><button onclick="renderCalendarMonth('+y+','+(m-1)+')">◀</button><span class="cal-month">'+y+'年'+(m+1)+'月</span><button onclick="renderCalendarMonth('+y+','+(m+1)+')">▶</button></div>';
  h+='<div class="cal-grid"><div class="cal-day-header">日</div><div class="cal-day-header">一</div><div class="cal-day-header">二</div><div class="cal-day-header">三</div><div class="cal-day-header">四</div><div class="cal-day-header">五</div><div class="cal-day-header">六</div>';
  for(var i=0;i<first.getDay();i++)h+='<div class="cal-day"></div>';
  var today=now.toISOString().slice(0,10);
  for(var d=1;d<=last.getDate();d++){var ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');h+='<div class="cal-day'+(ds===today?' today':'')+'">'+d+'</div>'}
  h+='</div>';c.innerHTML=h;
}
