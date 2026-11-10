// CDP screenshot tool with true device emulation.
// Usage: node scripts/shot.mjs <url> <out.png> [width] [height] [fullPage]
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFileSync } from 'node:fs'

const url = process.argv[2]
const out = process.argv[3]
const width = Number(process.argv[4] || 1440)
const height = Number(process.argv[5] || 900)
const fullPage = process.argv[6] === 'full'

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
if (!target) {
  console.error('chrome did not start')
  process.exit(1)
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

await new Promise(r => ws.addEventListener('open', r))
await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 700,
})
await send('Emulation.setTouchEmulationEnabled', { enabled: width < 700 })
await send('Page.navigate', { url })
await sleep(4000)

// Optional: visit a URL first to establish cookies (e.g. a dev-login endpoint).
const preUrl = process.argv[7]
if (preUrl) {
  await send('Page.navigate', { url: preUrl })
  await sleep(1500)
  await send('Page.navigate', { url })
  await sleep(4000)
}

let clip
if (fullPage) {
  const { result } = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth})',
    returnByValue: true,
  })
  const { h, w } = JSON.parse(result.value)
  await send('Emulation.setDeviceMetricsOverride', {
    width: Math.max(width, w),
    height: h,
    deviceScaleFactor: 1,
    mobile: width < 700,
  })
  await sleep(1200)
  clip = { x: 0, y: 0, width: Math.max(width, w), height: h, scale: 1 }
}

const shot = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: fullPage,
  ...(clip ? { clip } : {}),
})
writeFileSync(out, Buffer.from(shot.data, 'base64'))
console.log(`saved ${out} (${width}x${fullPage ? 'full' : height})`)
ws.close()
chrome.kill()
process.exit(0)
