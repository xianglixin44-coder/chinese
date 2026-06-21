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
