// End-to-end check of the real admin flow:
// open the admin panel, create a post through the UI, then visit the public blog.
// Usage: node scripts/live-sync-test.mjs
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

let target = null
for (let i = 0; i < 60 && !target; i++) {
  await sleep(300)
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`)
    target = (await res.json()).find(t => t.type === 'page')
  } catch {}
}

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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''))
  return r.result?.value
}

await new Promise(r => ws.addEventListener('open', r))
await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

const marker = 'Live sync test post ' + Date.now()

// 1. admin session
await send('Page.navigate', { url: `${base}/backend/api/auth/dev-login.php` })
await sleep(1200)

// 2. admin panel
await send('Page.navigate', { url: `${base}/admin/blog` })
await sleep(3500)

console.log('--- admin: create the post through the UI ---')
const created = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('New post'));
  if (!btn) return 'no New post button';
  btn.click();
  return 'clicked';
})()`)
await sleep(900)

await evaluate(`(() => {
  const input = document.querySelector('#post-title');
  if (!input) return 'no title field';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, ${JSON.stringify(marker)});
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()`)
await sleep(400)

// set the status to Published so it is visible on the public site
await evaluate(`(() => {
  const select = document.querySelector('#post-status');
  if (!select) return 'no status field';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  setter.call(select, 'Published');
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`)
await sleep(400)

const submitted = await evaluate(`(() => {
  const form = document.querySelector('main form');
  if (!form) return 'no form';
  const btn = [...form.querySelectorAll('button')].find(b => b.innerText.includes('Create post'));
  if (!btn) return 'no submit button';
  btn.click();
  return 'submitted';
})()`)
console.log(created, '->', submitted)
await sleep(2500)

const saved = await evaluate(`(() => {
  const cards = [...document.querySelectorAll('main article')];
  return JSON.stringify(cards.map(c => c.innerText.split('\\n')[1] || c.innerText.slice(0, 40)));
})()`)
console.log('admin list now contains:', saved)

// 3. go to the public blog page in the same tab
await send('Page.navigate', { url: `${base}/blog` })
await sleep(3500)

console.log('--- public blog page ---')
const publicTitles = await evaluate(`(() => {
  const els = [...document.querySelectorAll('main h2, main h3')];
  return JSON.stringify(els.map(e => e.innerText.trim()).filter(Boolean));
})()`)
console.log(publicTitles)

const found = publicTitles.includes(marker)
console.log(found ? '\nPASS: the new post appears on the public page' : '\nFAIL: the new post did NOT appear')

// clean up
await send('Page.navigate', { url: `${base}/backend/api/auth/dev-login.php` })
await sleep(800)
await evaluate(`(async () => {
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
console.log('cleaned up test post')

ws.close()
chrome.kill()
process.exit(found ? 0 : 1)
