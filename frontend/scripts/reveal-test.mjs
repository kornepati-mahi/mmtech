// Verifies that scroll-reveal elements become visible when scrolled into view.
// Usage: node scripts/reveal-test.mjs <url> <selector>
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const url = process.argv[2] || 'http://127.0.0.1:5173/'
const selector = process.argv[3] || 'figure'
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

const snapshot = async label => {
  const res = await evaluate(`(() => {
    const els = [...document.querySelectorAll('${selector}')];
    const info = els.map(el => {
      const r = el.getBoundingClientRect();
      const reveal = el.closest('.reveal');
      const cs = reveal ? getComputedStyle(reveal) : null;
      return {
        top: Math.round(r.top),
        visible: cs ? cs.opacity : 'n/a',
        hasClass: reveal ? reveal.classList.contains('is-visible') : false,
      };
    });
    return JSON.stringify({ scrollY: window.scrollY, count: els.length, items: info });
  })()`)
  const s = JSON.parse(res)
  const visible = s.items.filter(i => i.hasClass).length
  console.log(
    `${label.padEnd(30)} scrollY=${String(s.scrollY).padEnd(5)} elements=${s.count} revealed=${visible}`
  )
  return s
}

await snapshot('initial')

// Scroll through the page like a user would.
for (let y = 0; y <= 6000; y += 700) {
  await evaluate(`window.scrollTo(0, ${y})`)
  await sleep(220)
}
await sleep(1200)
await snapshot('after scrolling to bottom')

// Scroll back and check the review cards specifically.
await evaluate(`(() => {
  const els = [...document.querySelectorAll('${selector}')];
  const target = els[0];
  if (target) target.scrollIntoView({ block: 'center' });
  return true;
})()`)
await sleep(1500)
await snapshot('scrolled back to cards')

const detail = await evaluate(`(() => {
  const els = [...document.querySelectorAll('${selector}')];
  return JSON.stringify(els.slice(0, 4).map(el => {
    const r = el.getBoundingClientRect();
    const reveal = el.closest('.reveal');
    const cs = reveal ? getComputedStyle(reveal) : null;
    return {
      title: el.innerText.split('\\n')[0].slice(0, 42),
      top: Math.round(r.top),
      opacity: cs?.opacity,
      transform: cs?.transform,
      revealed: reveal?.classList.contains('is-visible'),
    };
  }), null, 2);
})()`)
console.log(detail)

ws.close()
chrome.kill()
process.exit(0)
