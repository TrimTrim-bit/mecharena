/* probe5: does state_bridge actually wrap PD.micro? timing of script load */
import path from "path"; import os from "os"; import fs from "fs";
function pr() {
  const base = path.join(os.homedir(), ".vscode/extensions");
  for (const e of fs.readdirSync(base).filter(d => d.includes("dscodegpt"))) {
    for (const sub of ["standalone/node_modules", ""]) {
      const c = path.join(base, e, sub);
      if (fs.existsSync(path.join(c, "patchright"))) return c;
    }
  }
  return null;
}
const { chromium } = await import("file:///" + path.join(pr(), "patchright", "index.mjs").replace(/\\/g, "/"));
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 30000 });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Runtime.enable");
await page.setViewportSize({ width: 1280, height: 800 });
const logs = [];
page.on("console", m => logs.push(m.text().slice(0, 160)));
await page.goto("http://127.0.0.1:8766/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(6000);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  return ev.result.value;
}
console.log("bridge warned?", logs.filter(l => l.includes("state_bridge") || l.includes("EXTRAS")).slice(0, 5));
console.log("PD.micro wrapped?", await js(`JSON.stringify({hasPD:!!window.PD, microIsNative:String(window.PD&&window.PD.micro).length<120})`));
console.log("gameCount:", await js(`String((window.PDX_CATALOG||[]).length)`));
console.log("2048 def found:", await js(`JSON.stringify((window.PDX_CATALOG||[]).find(g=>g.id==='g2048Game'))`));
await js(`try{showMenu()}catch(e){}; try{window.openGame('g2048Game')}catch(e){}`);
await page.waitForTimeout(2500);
console.log("screen active:", await js(`JSON.stringify([...document.querySelectorAll('.screen.active')].map(s=>s.id))`));
console.log("canvas there:", await js(`!!document.querySelector('#g2048GameCv')`));
console.log("state:", await js(`JSON.stringify(!!window.PDX_GAME_STATE['g2048Game'])`));
await browser.close(); process.exit(0);
