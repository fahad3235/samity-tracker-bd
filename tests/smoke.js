// Headless-Chrome smoke test for samity-tracker-bd (raw CDP, no deps).
// Usage: node tests/smoke.js <chrome-binary> <port>
// Serves nothing: loads file:// URL directly.
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CHROME = process.argv[2] || '/opt/meta-chromium/chrome';
const PORT = parseInt(process.argv[3] || '9231', 10);
const DIR = path.resolve(__dirname, '..');
const URL = 'file://' + DIR + '/index.html?asof=2026-10-26';

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' got=' + JSON.stringify(extra) : '')); }
}

function req(method, p) {
  return new Promise((resolve, reject) => {
    const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method }, (res) => {
      let s = ''; res.on('data', (c) => s += c); res.on('end', () => resolve({ status: res.statusCode, body: s }));
    });
    r.on('error', reject); r.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync('/tmp/samity-smoke-');
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile, 'about:blank'],
    { stdio: 'ignore' });
  let wsUrl = null;
  try {
    for (let i = 0; i < 60 && !wsUrl; i++) {
      await sleep(500);
      try {
        const v = await req('GET', '/json/version');
        if (v.status === 200) {
          const created = await req('PUT', '/json/new?' + encodeURIComponent(URL));
          if (created.status === 200) {
            const t = JSON.parse(created.body);
            wsUrl = t.webSocketDebuggerUrl;
          }
        }
      } catch (e) { /* not up yet */ }
    }
    if (!wsUrl) throw new Error('chrome did not start');

    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let seq = 0; const pending = new Map();
    const consoleErrors = [], pageErrors = [];
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error))); else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(JSON.stringify(msg.params.args));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails.exception.description || 'exception');
      }
    };
    const send = (method, params) => new Promise((resolve, reject) => {
      const id = ++seq; pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
    const ev = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    await send('Runtime.enable');
    await send('Page.enable');
    await sleep(1500);

    check('title', await ev('document.title') === 'Samity Tracker BD', await ev('document.title'));
    check('setup visible initially', await ev('!document.getElementById("setupCard").hidden'));
    check('app hidden initially', await ev('document.getElementById("appCard").hidden'));

    // Create group: Para Samity, 5000/mo, from 2026-10, 3 members
    await ev(`document.getElementById("groupName").value = "Para Samity"`);
    await ev(`document.getElementById("contribution").value = "5000"`);
    await ev(`document.getElementById("startMonth").value = "2026-10"`);
    await ev(`document.getElementById("memberNames").value = "Rahim\\nKarim\\nSumon"`);
    await ev(`document.getElementById("createBtn").click()`);
    await sleep(500);
    check('app visible after create', await ev('!document.getElementById("appCard").hidden'));
    check('group name shown', await ev('document.getElementById("groupNameOut").textContent') === 'Para Samity');
    check('pot 15,000.00', await ev('document.getElementById("vPot").textContent') === '15,000.00');
    check('member rows 3', await ev('document.querySelectorAll("#memberBody tr").length') === 3);
    check('rotation first receiver Rahim', await ev(`(() => { document.getElementById("tabRotation").click(); return document.querySelector("#rotationBody tr td:nth-child(2)").textContent; })()`) === 'Rahim');
    check('rotation rows >= 6', await ev('document.querySelectorAll("#rotationBody tr").length') >= 6);

    // Contributions: mark Rahim Oct paid, then check member paid total
    await ev(`document.getElementById("tabContrib").click()`);
    await ev(`document.querySelector("#contribBody tr td.paid-cell button").click()`);
    await sleep(300);
    check('cell becomes paid', await ev('document.querySelector("#contribBody tr td.paid-cell button").className') === 'paid-yes');
    await ev(`document.getElementById("tabMembers").click()`);
    check('member paid total 5,000.00', await ev('document.querySelector("#memberBody tr td:nth-child(2)").textContent') === '5,000.00');
    check('collected 5,000.00', await ev('document.getElementById("vCollected").textContent') === '5,000.00');

    // Validation: duplicate member rejected
    await ev(`document.getElementById("newMemberName").value = "Rahim"`);
    await ev(`document.getElementById("addMemberBtn").click()`);
    check('dup member error shown', await ev('!document.getElementById("memberError").hidden'));
    check('still 3 members', await ev('document.querySelectorAll("#memberBody tr").length') === 3);

    // Add month -> contributions columns grow
    await ev(`document.getElementById("tabContrib").click()`);
    const colsBefore = await ev('document.querySelectorAll("#contribHead th").length');
    await ev(`document.getElementById("addMonthBtn").click()`);
    await sleep(300);
    check('add month grows columns', await ev('document.querySelectorAll("#contribHead th").length') === colsBefore + 1);

    // BN toggle: pot renders Bengali digits
    await ev(`document.getElementById("langBtn").click()`);
    await sleep(300);
    check('BN pot digits', /[\u09e6-\u09ef]/.test(await ev('document.getElementById("vPot").textContent')), await ev('document.getElementById("vPot").textContent'));

    // Reload persistence
    await send('Page.reload', { ignoreCache: true });
    await sleep(1500);
    check('persists after reload', await ev('document.getElementById("groupNameOut").textContent') === 'Para Samity');
    check('lang persists after reload', await ev('document.getElementById("langBtn").textContent') === 'English');

    // 390px mobile: no horizontal overflow
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(500);
    check('390px no overflow', await ev('document.documentElement.scrollWidth <= 390'), await ev('document.documentElement.scrollWidth'));

    check('zero console errors', consoleErrors.length === 0, consoleErrors);
    check('zero page errors', pageErrors.length === 0, pageErrors);
  } finally {
    chrome.kill('SIGKILL');
  }
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('SMOKE ERROR', e); process.exit(1); });
