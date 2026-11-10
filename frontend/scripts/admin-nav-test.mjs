// Simulates the admin navigation flow: open a page, click Edit, navigate away and back.
// Usage: node scripts/admin-nav-test.mjs
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFileSync } from 'node:fs'

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
  return r.result?.value
}

await new Promise(r => ws.addEventListener('open', r))
await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

const go = async url => {
  await send('Page.navigate', { url })
  await sleep(2500)
}

// Establish an admin session through the dev-login helper, if present.
await go(`${base}/backend/api/auth/dev-login.php`)

const results = []
const check = async (label, page) => {
  const state = await evaluate(`(() => {
    const main = document.querySelector('main');
    const editors = document.querySelectorAll('main form').length;
    const scrolled = window.scrollY;
    const h = document.documentElement.scrollHeight;
    return JSON.stringify({ editors, scrolled, h, path: location.pathname, title: document.querySelector('h1')?.innerText || '' });
  })()`)
  const s = JSON.parse(state)
  results.push({ label, ...s })
  console.log(
    `${label.padEnd(38)} path=${s.path.padEnd(22)} forms=${s.editors} scrollY=${s.scrolled} pageH=${s.h} h1="${s.title}"`
  )
}

await go(`${base}/admin/reviews`)
await check('reviews loaded', 'reviews')

// Click "Edit" on the 3rd review card.
await evaluate(`(() => {
  const cards = [...document.querySelectorAll('main article')];
  const third = cards[2];
  if (!third) return 'no cards';
  const btn = [...third.querySelectorAll('button')].find(b => b.innerText.trim() === 'Edit');
  if (!btn) return 'no edit button';
  btn.click();
  return 'clicked';
})()`)
await sleep(1200)
await check('after clicking Edit on review 3', 'reviews-edit')

// Navigate to Dashboard, then back to Reviews.
await evaluate(`(() => {
  const link = [...document.querySelectorAll('aside a')].find(a => a.getAttribute('href') === '/admin/dashboard');
  link.click(); return 'ok';
})()`)
await sleep(1500)
await check('after clicking Dashboard', 'dashboard')

await evaluate(`(() => {
  const link = [...document.querySelectorAll('aside a')].find(a => a.getAttribute('href') === '/admin/reviews');
  link.click(); return 'ok';
})()`)
await sleep(1500)
await check('back on Reviews', 'reviews-again')

// Settings page: scroll down, navigate away, come back.
await evaluate(`(() => {
  const link = [...document.querySelectorAll('aside a')].find(a => a.getAttribute('href') === '/admin/settings');
  link.click(); return 'ok';
})()`)
await sleep(1800)
await evaluate('window.scrollTo(0, 1200)')
await sleep(600)
await check('settings scrolled down', 'settings-scrolled')

await evaluate(`(() => {
  const link = [...document.querySelectorAll('aside a')].find(a => a.getAttribute('href') === '/admin/dashboard');
  link.click(); return 'ok';
})()`)
await sleep(1500)
await evaluate(`(() => {
  const link = [...document.querySelectorAll('aside a')].find(a => a.getAttribute('href') === '/admin/settings');
  link.click(); return 'ok';
})()`)
await sleep(1800)
await check('back on Settings', 'settings-again')

writeFileSync(process.env.TEMP + '/admin-nav-results.json', JSON.stringify(results, null, 2))
ws.close()
chrome.kill()
process.exit(0)
