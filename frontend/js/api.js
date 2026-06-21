/* API 通信层 */
const API_BASE = 'http://localhost:3200';
let apiAvailable = false;

async function checkApi() {
  try {
    const r = await fetch(API_BASE + '/api/health', { signal: AbortSignal.timeout(2000) });
    apiAvailable = r.ok;
  } catch(e) { apiAvailable = false; }
  document.getElementById('apiBadge').textContent = apiAvailable ? '🔗 在线' : '📴 离线';
}

async function apiCall(method, path, body) {
  if (!apiAvailable) return null;
  try {
    const opts = { method, headers: {'Content-Type':'application/json'}, signal: AbortSignal.timeout(3000) };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(API_BASE + path, opts);
    if (!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}
