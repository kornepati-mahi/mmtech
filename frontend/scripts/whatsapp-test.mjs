// Verifies the WhatsApp widget: hover reveals the service list and links pre-fill a message.
// Usage: node scripts/whatsapp-test.mjs
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const url = process.argv[2] || 'http://127.0.0.1:5173/'
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
await send('Page.navigate', { url })
await sleep(4000)

console.log('--- widget present? ---')
console.log(
  await evaluate(`(() => {
    const btn = document.querySelector('button[aria-label="Chat on WhatsApp"]');
    if (!btn) return 'MISSING';
    const r = btn.getBoundingClientRect();
    return JSON.stringify({ found: true, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), inViewport: r.right <= window.innerWidth && r.bottom <= window.innerHeight });
  })()`)
)

console.log('--- hover the launcher ---')
await evaluate(`(() => {
  const btn = document.querySelector('button[aria-label="Chat on WhatsApp"]');
  const r = btn.getBoundingClientRect();
  btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  return true;
})()`)
await sleep(900)

console.log(
  await evaluate(`(() => {
    const panel = [...document.querySelectorAll('div')].find(d => d.className.includes && String(d.className).includes('origin-bottom-right'));
    if (!panel) return 'PANEL MISSING';
    const cs = getComputedStyle(panel);
    const links = [...panel.querySelectorAll('a')];
    return JSON.stringify({
      opacity: cs.opacity,
      pointerEvents: cs.pointerEvents,
      linkCount: links.length,
      firstLink: links[0]?.getAttribute('href'),
      general: links[links.length - 1]?.getAttribute('href'),
    }, null, 2);
  })()`)
)

// Capture the open panel.
const shot = await send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: 900, y: 380, width: 530, height: 510, scale: 1 },
})
const { writeFileSync } = await import('node:fs')
writeFileSync(
  (process.env.TEMP || '.') + '/wa-panel.png',
  Buffer.from(shot.data, 'base64')
)
console.log('screenshot saved')

ws.close()
chrome.kill()
process.exit(0)
