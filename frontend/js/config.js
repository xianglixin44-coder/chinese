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
