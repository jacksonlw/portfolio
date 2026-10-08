// Prints resume/resume.html to public/resume.pdf with headless Chrome: `pnpm resume`.
// Set CHROME to a Chrome or Chromium binary if it isn't in the default macOS location.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const chrome =
  process.env.CHROME ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!existsSync(chrome)) {
  console.error(
    `Chrome not found at ${chrome}. Set CHROME to a Chrome or Chromium binary.`
  )
  process.exit(1)
}

const source = pathToFileURL(resolve('resume/resume.html')).href
const out = resolve(process.argv[2] ?? 'public/resume.pdf')

execFileSync(
  chrome,
  [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    `--print-to-pdf=${out}`,
    source
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] }
)
console.log(`Wrote ${out}`)
