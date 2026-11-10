// Photographs the mock run's main screens at 1440x900 @2x with the system Chrome.
// Usage: node capture.mjs <work dir> <raw out dir>   (start.sh must be running)
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from 'node:fs'

const [work, out] = process.argv.slice(2).map((p) => path.resolve(p))
const base = `http://127.0.0.1:${process.env.PORT || 4310}`
const puppeteer = createRequire(path.join(work, 'run', 'package.json'))('puppeteer-core')
fs.mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({
	executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	headless: true,
	args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--hide-scrollbars'],
})
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// One browser context per mock user, so each has its own cookie and its own socket connection.
const open = async (user, url) => {
	const ctx = await browser.createBrowserContext()
	const page = await ctx.newPage()
	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
	if (user) await page.setCookie({ name: 'mock_user', value: user, url: base })
	await page.goto(base + url, { waitUntil: 'networkidle2' })
	return page
}
const playing = (page, sel) => page.waitForFunction((s) => { const v = document.querySelector(s + ' video, video' + s); return v && v.currentTime > 1 }, { timeout: 20000 }, sel)
const shot = (page, name) => page.screenshot({ path: path.join(out, name + '.png') })

// Home, signed out. The background is the generated gradient, not the real promo video.
const home = await open(null, '/')
await sleep(1500)
await shot(home, 'home')

// A few viewers on /stream so the viewer count and the admin's viewer list are not empty.
const viewer = await open('mock-viewer', '/stream')
for (const u of ['mock-student', 'mock-parent', 'mock-staff', 'mock-family']) await open(u, '/stream')
await playing(viewer, '#koistream-video')
await viewer.evaluate(() => setViewerCount())
await viewer.mouse.move(700, 880)
await sleep(3500) // let the video.js control bar fade
await shot(viewer, 'watch')

// The same page for an admin: chat turns on moderation mode. Hover the flagged message.
const mod = await open('mock-admin', '/stream')
await playing(mod, '#koistream-video')
await mod.evaluate(() => setViewerCount())
await mod.hover('#mockchat07')
await sleep(3500)
await shot(mod, 'moderation')

const dash = await open('mock-admin', '/admin/stream')
await playing(dash, '#stream-video')
await dash.mouse.move(900, 880)
await sleep(3500)
await shot(dash, 'admin-stream')

const users = await open('mock-admin', '/admin/users')
await users.type('#user-search-input', 'sample')
await users.waitForSelector('.table-rows .table-row')
await sleep(800)
await shot(users, 'admin-users')

const inspect = await open('mock-admin', '/admin/inspect/user/mock-muted')
await sleep(800)
await shot(inspect, 'admin-inspect-user')

await browser.close()
console.log(fs.readdirSync(out).join('\n'))
