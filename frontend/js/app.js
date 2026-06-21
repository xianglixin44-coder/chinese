/* 应用核心逻辑 */
var currentPage='overview',currentDeck='shici',deckIndex=0,deckQueue=[],flipped=false;
var streak=0,lastActive='',templateCount=0,grammarCount=0;
var cardTimer=null,cardSeconds=20;
const DAILY_CARD_LIMIT=20;
const DAILY_TASKS=['flashcard','reading','classical','language','writing'];
var completedTasks={};

var dbLocal=null;
(async function initLocalDB(){
  try{const SQL=await initSqlJs({locateFile:f=>f});dbLocal=new SQL.Database();
    dbLocal.run("CREATE TABLE IF NOT EXISTS streak (id INTEGER PRIMARY KEY CHECK(id=1),count INTEGER DEFAULT 0,last_active TEXT)");
    dbLocal.run("INSERT OR IGNORE INTO streak VALUES(1,0,'')");
    dbLocal.run("CREATE TABLE IF NOT EXISTS flashcard_log (id INTEGER PRIMARY KEY AUTOINCREMENT,deck TEXT,card_word TEXT,rating TEXT,reviewed_at TEXT DEFAULT(datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS template_log (id INTEGER PRIMARY KEY AUTOINCREMENT,combo_a TEXT,combo_b TEXT,combo_c TEXT,topic TEXT,created_at TEXT DEFAULT(datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS grammar_log (id INTEGER PRIMARY KEY AUTOINCREMENT,sentence TEXT,example_idx INTEGER,module TEXT,created_at TEXT DEFAULT(datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS card_srs (deck TEXT,card_idx INTEGER,interval_days INTEGER DEFAULT 0,repetitions INTEGER DEFAULT 0,next_review TEXT,mastered INTEGER DEFAULT 0,PRIMARY KEY(deck,card_idx))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS assessments (item TEXT,week INTEGER,score INTEGER DEFAULT 0,updated_at TEXT DEFAULT(datetime('now','localtime')),PRIMARY KEY(item,week))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS training_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT,date TEXT,module TEXT,duration_min INTEGER,created_at TEXT DEFAULT(datetime('now','localtime')))");
    dbLocal.run("CREATE TABLE IF NOT EXISTS daily_tasks (date TEXT,task TEXT,PRIMARY KEY(date,task))");
  }catch(e){}
})();

function localRun(sql,params){if(!dbLocal)return;try{dbLocal.run(sql,params||[])}catch(e){}}
function localQuery(sql,params){if(!dbLocal)return[];try{var r=dbLocal.exec(sql,params||[]);return(r.length&&r[0].values)?r[0].values:[]}catch(e){return[]}}

async function getStreak(){
  var r=await apiCall('GET','/api/streak');
  if(r&&r.count!==undefined)return{count:r.count,lastActive:r.last_active||''};
  var lr=localQuery("SELECT count,last_active FROM streak WHERE id=1");
  return lr.length?{count:lr[0][0],lastActive:lr[0][1]}:{count:0,lastActive:''};
}
async function setStreak(count,la){
  localRun("UPDATE streak SET count=?,last_active=? WHERE id=1",[count,la]);
  apiCall('POST','/api/streak',{count,last_active:la});
}
function checkStreak(){
  var today=new Date().toDateString();
  if(lastActive!==today&&lastActive!==''){var yesterday=new Date(Date.now()-86400000).toDateString();streak=lastActive===yesterday?streak+1:0}
  else if(lastActive==='')streak=1;
  lastActive=today;setStreak(streak,today);
  document.getElementById('streakBadge').textContent=streak+'天';
}

function dbRun(sql,params){
  localRun(sql,params);
  if(sql.includes('flashcard_log'))apiCall('POST','/api/flashcard/log',{deck:params[0],card_word:params[1],rating:params[2]});
  else if(sql.includes('template_log'))apiCall('POST','/api/template/log',{combo_a:params[0],combo_b:params[1],combo_c:params[2],topic:params[3]});
  else if(sql.includes('grammar_log'))apiCall('POST','/api/grammar/log',{sentence:params[0],example_idx:params[1]||-1,module:params[2]||''});
  else if(sql.includes('training_sessions'))apiCall('POST','/api/training/session',{date:params[0],module:params[1],duration_min:params[2]});
  else if(sql.includes('card_srs'))apiCall('PUT','/api/card-srs',{deck:params[0],card_idx:params[1],rating:params[2]});
  else if(sql.includes('assessments'))apiCall('POST','/api/assessment',{item:params[0],week:params[1],score:params[2]});
  else if(sql.includes('streak'))apiCall('POST','/api/streak',{count:params[0],last_active:params[1]});
  else apiCall('POST','/api/run',{sql:sql,params:params});
}
function dbGet(sql,params){return localQuery(sql,params)}

// Navigation
function navigate(page,keepNav){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  if(!keepNav)document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active')});
  var pg=document.getElementById('page-'+page);if(pg)pg.classList.add('active');
  if(!keepNav){var nav=document.querySelector('.nav-item[data-page="'+page+'"]');if(nav)nav.classList.add('active')}
  else{var on=document.querySelector('.nav-item[data-page="overview"]');if(on)on.classList.add('active')}
  currentPage=page;
  if(page==='calendar')renderCalendar();
  var now=new Date();
  var ds=now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var dt=document.getElementById('dt-'+page);if(dt)dt.textContent=ds;
}

function startTask(page){
  if(page==='flashcard')navigate('classical',true);else navigate(page,true);
}

// Daily tasks
async function loadCompletedTasks(){
  completedTasks={};var today=new Date().toISOString().slice(0,10);
  if(apiAvailable){var d=await apiCall('POST','/api/query',{sql:"SELECT task FROM daily_tasks WHERE date=?",params:[today]});if(d&&d.rows)d.rows.forEach(function(r){completedTasks[r[0]]=true})}
  var rows=dbGet("SELECT task FROM daily_tasks WHERE date=?",[today]);rows.forEach(function(r){completedTasks[r[0]]=true});
  renderDailyChecklist();
}
function markTaskDone(task){
  var today=new Date().toISOString().slice(0,10);
  dbRun("INSERT OR IGNORE INTO daily_tasks (date,task) VALUES(?,?)",[today,task]);
  apiCall('POST','/api/training/session',{date:today,module:task,duration_min:5});
  completedTasks[task]=true;renderDailyChecklist();
}
function renderDailyChecklist(){
  var done=Object.keys(completedTasks).length,total=DAILY_TASKS.length;
  document.getElementById('progressLabel').textContent=done+'/'+total+' 项完成';
  document.getElementById('progressFill').style.width=Math.round(done/total*100)+'%';
  DAILY_TASKS.forEach(function(t){var el=document.querySelector('.daily-task[data-task="'+t+'"]');if(el)el.classList.toggle('done',!!completedTasks[t])});
  if(done>=total){
    var now=new Date();
    document.getElementById('celebration').classList.add('show');
    document.getElementById('taskProgress').style.display='none';
    document.getElementById('dailyChecklist').style.display='none';
    document.getElementById('celebCards').textContent=DECKS[currentDeck].length;
    document.getElementById('celebDay').textContent=streak;
    var d2=now.getFullYear()+'年'+(now.getMonth()+1)+'月'+now.getDate()+'日 '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    var sessions=dbGet("SELECT SUM(duration_min) FROM training_sessions WHERE date=?",[now.toISOString().slice(0,10)]);
    document.getElementById('celebMeta').textContent=d2+' · '+(sessions.length&&sessions[0][0]?sessions[0][0]:0)+'分钟';
  }
}

// Templates
function renderTemplates(){
  var tabs=['A','B','C'];tabs.forEach(function(l){
    var c=document.getElementById('tabs'+l+'-content');if(!c)return;
    var h='';for(var i=1;i<=4;i++){var k=l+i;var t=TEMPLATES[k]||'';h+='<div class="tab-content'+(i===1?' active':'')+'" id="tab-'+k+'"><p style="line-height:1.8">'+htmlesc(t)+'</p></div>'}
    c.innerHTML=h;
  });
}
function applyTemplate(){
  var a=document.getElementById('selA').value,b=document.getElementById('selB').value,c=document.getElementById('selC').value;
  var input=document.getElementById('templateInput').value;
  var p='<span class="tmpl-tag A">'+a+'</span> '+htmlesc(TEMPLATES[a])+'\n\n';
  p+='<span class="tmpl-tag B">'+b+'</span> '+htmlesc(TEMPLATES[b])+'\n\n';
  p+='<span class="tmpl-tag C">'+c+'</span> '+htmlesc(TEMPLATES[c])+'\n\n<hr>'+htmlesc(input);
  document.getElementById('templatePreview').innerHTML=p;
  dbRun("INSERT INTO template_log(combo_a,combo_b,combo_c,topic) VALUES(?,?,?,?)",[a,b,c,input]);
  checkStreak();markTaskDone('writing');
}
function switchTab(tabsId,tabId){
  var c=document.getElementById(tabsId);if(!c)return;
  c.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});
  var btn=c.querySelector('.tab-btn[data-tab="'+tabId+'"]');if(btn)btn.classList.add('active');
  var cc=document.getElementById(tabsId+'-content');if(!cc)return;
  cc.querySelectorAll('.tab-content').forEach(function(tc){tc.classList.remove('active')});
  var tc=document.getElementById('tab-'+tabId);if(tc)tc.classList.add('active');
}

function htmlesc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function toggleAnswer(id){var el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'block':'none'}

// Init
document.addEventListener('DOMContentLoaded',async function(){
  await checkApi();
  var st=await getStreak();streak=st.count;lastActive=st.lastActive;
  await loadCompletedTasks();checkStreak();
  renderTemplates();renderReadingTabs();renderSymbols();initDeck('shici');
  updateHomeStats();
  renderCalendarMonth();
});

function updateHomeStats(){
  var today=new Date().toISOString().slice(0,10);
  var c=dbGet("SELECT COUNT(*) FROM flashcard_log WHERE deck=? AND date(reviewed_at)=?",[currentDeck,today]);
  document.getElementById('ovCards').textContent=c.length?c[0][0]:0;
}
