// Does what the clone's gulpfile `static` task does (stylus -> bin/css, copy js and img to bin),
// without gulp. The one change: the hard-coded CloudFront HLS URL in the client scripts is
// pointed at the generated local test pattern. Usage: node build-static.js <clone dir>
const fs = require('fs'), path = require('path')
const clone = path.resolve(process.argv[2])
const stylus = require(path.join(clone, 'node_modules', 'stylus'))
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
const out = (rel, data) => { const p = path.join(clone, 'bin', rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data) }
const src = path.join(clone, 'src', 'static')
for (const f of walk(path.join(src, 'css'))) {
	if (!f.endsWith('.styl')) continue
	out(path.join('css', path.relative(path.join(src, 'css'), f)).replace(/\.styl$/, '.css'), stylus(fs.readFileSync(f, 'utf8')).set('filename', f).render())
}
for (const f of walk(path.join(src, 'js'))) {
	const js = fs.readFileSync(f, 'utf8').replace(/https:\/\/[a-z0-9]+\.cloudfront\.net\/[^"']+\.m3u8/g, '/mock-stream/stream.m3u8')
	out(path.join('js', path.relative(path.join(src, 'js'), f)), js)
}
for (const f of walk(path.join(src, 'img'))) out(path.join('img', path.relative(path.join(src, 'img'), f)), fs.readFileSync(f))
console.log('built bin/css, bin/js, bin/img')
