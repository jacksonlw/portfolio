// Does what the repo's `gulp static` did (Stylus to CSS, copy JS and images into bin/) without
// gulp or Babel, which a current browser doesn't need. Usage: node build-static.js <clone dir>
const fs = require("fs"), path = require("path");
const root = path.resolve(process.argv[2]);
const stylus = require(path.join(root, "node_modules/stylus"));
const src = path.join(root, "src/static"), out = path.join(root, "bin");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "css"), { recursive: true });
for (const f of fs.readdirSync(path.join(src, "css"))) {
  const file = path.join(src, "css", f);
  const css = stylus(fs.readFileSync(file, "utf8")).set("filename", file).set("compress", true).render();
  fs.writeFileSync(path.join(out, "css", f.replace(/\.styl$/, ".css")), css);
}
fs.cpSync(path.join(src, "js"), path.join(out, "js"), { recursive: true });
fs.cpSync(path.join(src, "img"), path.join(out, "img"), { recursive: true });
