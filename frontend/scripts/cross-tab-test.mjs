// Cross-tab check: an admin edit in one tab must reach the public site in another.
// Usage: node scripts/cross-tab-test.mjs
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const base = 'http://127.0.0.1:5173'
const port = 9222 + Math.floor(Math.random() * 500)

const chrome = spawn(
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${process.env.TEMP}/cdp-${port}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
)
process.on('exit', () => chrome.kill())

let targets = []
for (let i = 0; i < 60 && !targets.length; i++) {
  await sleep(300)
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`)
    targets = (await res.json()).filter(t => t.type === 'page')
  } catch {}
}

// Open a second tab.
if (targets.length < 2) {
  try {
    await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })
    await sleep(800)
    const res = await fetch(`http://127.0.0.1:${port}/json/list`)
    targets = (await res.json()).filter(t => t.type === 'page')
  } catch (e) {
    console.error('could not open a second tab', e.message)
  }
}

const connect = async target => {
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result)
      pending.delete(msg.id)
    }
  })
  const send = (method, params = {}) =>
    new Promise(resolve => {
      const msgId = ++id
      pending.set(msgId, resolve)
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
  const evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    return r.result?.value
  }
  await new Promise(r => ws.addEventListener('open', r))
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  return { send, evaluate, close: () => ws.close() }
}

const tabA = await connect(targets[0])
const tabB = await connect(targets[1])

// Tab A: public blog page
await tabA.send('Page.navigate', { url: `${base}/blog` })
await sleep(3000)

// Tab B: admin
await tabB.send('Page.navigate', { url: `${base}/backend/api/auth/dev-login.php` })
await sleep(1000)
await tabB.send('Page.navigate', { url: `${base}/admin/blog` })
await sleep(3000)

const marker = 'Cross tab post ' + Date.now()

console.log('--- tab B (admin): create a published post ---')
await tabB.evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('New post'));
  btn.click();
  return true;
})()`)
await sleep(800)
await tabB.evaluate(`(() => {
  const input = document.querySelector('#post-title');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, ${JSON.stringify(marker)});
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const select = document.querySelector('#post-status');
  const sset = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  sset.call(select, 'Published');
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`)
await sleep(400)
await tabB.evaluate(`(() => {
  const form = document.querySelector('main form');
  const btn = [...form.querySelectorAll('button')].find(b => b.innerText.includes('Create post'));
  btn.click();
  return true;
})()`)
await sleep(2500)

// Tab A should pick it up via BroadcastChannel without a reload.
await sleep(2500)

// diagnostics
const diag = await tabB.evaluate(`(async () => {
  const list = await (await fetch('/backend/api/blogs/admin-list.php', { credentials: 'include' })).json();
  const mine = (list.data || []).filter(p => p.title === ${JSON.stringify(marker)});
  const pub = await (await fetch('/backend/api/blogs/list.php')).json();
  return JSON.stringify({
    adminList: mine.map(p => ({ id: p.id, title: p.title, status: p.status })),
    publicHas: (pub.data || []).some(p => p.title === ${JSON.stringify(marker)}),
    hasBroadcastChannel: typeof BroadcastChannel !== 'undefined',
  });
})()`)
console.log('diagnostics:', diag)

const chanState = await tabA.evaluate(`JSON.stringify({
  hasBC: typeof BroadcastChannel !== 'undefined',
  title: document.title,
  path: location.pathname,
})`)
console.log('tab A state:', chanState)

const titles = await tabA.evaluate(`(() => {
  const els = [...document.querySelectorAll('main h2, main h3')];
  return JSON.stringify(els.map(e => e.innerText.trim()).filter(Boolean));
})()`)
console.log('--- tab A (public blog) ---')
console.log(titles)

const found = titles.includes(marker)
console.log(
  found
    ? '\nPASS: tab A updated automatically after the admin saved in tab B'
    : '\nFAIL: tab A did not update'
)

// cleanup
await tabB.evaluate(`(async () => {
  const list = await (await fetch('/backend/api/blogs/admin-list.php', { credentials: 'include' })).json();
  const post = (list.data || []).find(p => p.title === ${JSON.stringify(marker)});
  if (post) {
    await fetch('/backend/api/blogs/delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: post.id })
    });
  }
  return true;
})()`)
console.log('cleaned up')

tabA.close()
tabB.close()
chrome.kill()
process.exit(found ? 0 : 1)
