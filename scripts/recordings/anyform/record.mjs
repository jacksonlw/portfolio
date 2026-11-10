// Clip recorder: Chrome's own screencast (JPEG frames with timestamps, sent only when the page
// repaints) written out and assembled by ffmpeg into a constant 60 fps .mov. Playwright's built-in
// recordVideo is a soft, low-bitrate VP8 stream, so it isn't used.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { sleep } from './lib.mjs';

export async function startClip(page) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', (f) => {
    frames.push({ t: f.metadata.timestamp, data: f.data });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
  return {
    frames,
    // from/to trim seconds off the start and end; hold repeats the last frame for that long.
    async stop(outFile, { from = 0, to = 0, hold = 0 } = {}) {
      await sleep(150);
      await cdp.send('Page.stopScreencast');
      const dir = outFile.replace(/\.mov$/, '.frames');
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const t0 = frames[0].t + from, t1 = frames[frames.length - 1].t - to;
      // The frame on screen at t0 is the last one at or before it.
      let first = 0;
      while (first + 1 < frames.length && frames[first + 1].t <= t0) first++;
      const kept = frames.slice(first).filter((f, i) => i === 0 || f.t <= t1);
      let list = '';
      kept.forEach((f, i) => {
        const file = `${dir}/${String(i).padStart(5, '0')}.jpg`;
        fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
        const start = Math.max(f.t, t0);
        const end = i + 1 < kept.length ? kept[i + 1].t : t1 + hold;
        list += `file '${file}'\nduration ${Math.max(end - start, 0.001).toFixed(4)}\n`;
      });
      list += `file '${dir}/${String(kept.length - 1).padStart(5, '0')}.jpg'\n`;
      fs.writeFileSync(`${dir}/list.txt`, list);
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`,
        '-vf', 'fps=60,scale=in_range=full:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-an', outFile]);
      fs.rmSync(dir, { recursive: true, force: true });
      const span = kept[kept.length - 1].t - kept[0].t;
      console.log(`  ${outFile}: ${kept.length} frames over ${span.toFixed(1)} s (${(kept.length / Math.max(span, 0.1)).toFixed(0)} fps captured)`);
    },
  };
}

// A drawn pointer: headless Chrome paints none. It follows the real mouse events.
export async function addPointer(context) {
  await context.addInitScript(() => {
    const make = () => {
      if (document.getElementById('__pointer')) return;
      const el = document.createElement('div');
      el.id = '__pointer';
      el.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:22px;height:22px;transform:translate(-100px,-100px);will-change:transform';
      el.innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2l15 7.2-6.3 1.9-2.2 6.4z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      document.documentElement.appendChild(el);
      window.addEventListener('mousemove', (e) => { el.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 2}px)`; }, true);
    };
    if (document.documentElement) make();
    document.addEventListener('DOMContentLoaded', make);
  });
}

let at = { x: 720, y: 450 };
// Moves the mouse along an eased straight line, one event per ~16 ms.
export async function glide(page, x, y, ms = 600) {
  const steps = Math.max(2, Math.round(ms / 16));
  const from = { ...at };
  for (let i = 1; i <= steps; i++) {
    const k = i / steps, e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    await sleep(16);
  }
  at = { x, y };
}
export async function glideTo(page, locator, ms = 600) {
  const b = await locator.boundingBox();
  await glide(page, b.x + b.width / 2, b.y + b.height / 2, ms);
}
export function park(x, y) { at = { x, y }; }
