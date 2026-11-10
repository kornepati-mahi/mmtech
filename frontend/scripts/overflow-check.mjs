// Minimal CDP helper: find elements wider than the viewport.
// Usage: node scripts/overflow-check.mjs <url> [width]
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const url = process.argv[2] || 'http://127.0.0.1:5173/'
const width = Number(process.argv[3] || 390)
const port = 9222 + Math.floor(Math.random() * 400)

const chrome = spawn(
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    `--window-size=${width},900`,
    '--user-data-dir=' + process.env.TEMP + `/cdp-${port}`,
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
    const list = await res.json()
    target = list.find(t => t.type === 'page')
  } catch {}
}
if (!target) {
  console.error('could not reach chrome')
  process.exit(1)
}

const ws = new WebSocket(target.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
const events = []

ws.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result)
    pending.delete(msg.id)
  } else if (msg.method) {
    events.push(msg)
  }
})

const send = (method, params = {}) =>
  new Promise(resolve => {
    const msgId = ++id
    pending.set(msgId, resolve)
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })

await new Promise(r => ws.addEventListener('open', r))

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height: 900,
  deviceScaleFactor: 1,
  mobile: width < 700,
})
await send('Page.navigate', { url })
await sleep(3500)

const expression = `(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    const right = r.right + window.scrollX;
    if (right > vw + 1) {
      const cs = getComputedStyle(el);
      if (cs.position === 'absolute' || cs.position === 'fixed') return;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).slice(0, 110),
        right: Math.round(right),
        width: Math.round(r.width),
      });
    }
  });
  return JSON.stringify({
    vw,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: offenders.slice(0, 14),
  }, null, 2);
})()`

const res = await send('Runtime.evaluate', { expression, returnByValue: true })
console.log(res.result?.value ?? JSON.stringify(res))
ws.close()
chrome.kill()
process.exit(0)
