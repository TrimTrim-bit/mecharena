/* probe3: why g2048/boxing/lava not publishing */
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
await page.goto("http://127.0.0.1:8766/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(6000);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  return ev.result.value;
}
console.log("ids in catalog sample:", await js(`JSON.stringify((window.PDX_CATALOG||[]).filter(g=>/2048|box|lava|joust|marble|geometry/.test(g.id)).map(g=>g.id))`));
console.log("state keys:", await js(`JSON.stringify(Object.keys(window.PDX_GAME_STATE||{}).slice(0,40))`));
await js(`try{showMenu()}catch(e){}; window.setAIMode('both_ai')`);
console.log("2048:", await js(`(function(){try{window.openGame('g2048Game')}catch(e){return 'E'+e.message}
  return new Promise(r=>setTimeout(()=>{var s=window.PDX_GAME_STATE['g2048Game'];
    r(JSON.stringify({pub:!!s,keys:s?Object.keys(s).slice(0,15):null}));},2000));})()`));
console.log("boxing:", await js(`(function(){try{showMenu()}catch(e){};try{window.openGame('boxingGame')}catch(e){return 'E'+e.message}
  return new Promise(r=>setTimeout(()=>{var s=window.PDX_GAME_STATE['boxingGame'];
    r(JSON.stringify({pub:!!s,keys:s?Object.keys(s).slice(0,15):null}));},2000));})()`));
console.log("lava:", await js(`(function(){try{showMenu()}catch(e){};try{window.openGame('lavaescapeGame')}catch(e){return 'E'+e.message}
  return new Promise(r=>setTimeout(()=>{var s=window.PDX_GAME_STATE['lavaescapeGame'];
    r(JSON.stringify({pub:!!s,keys:s?Object.keys(s).slice(0,15):null,plats:s&&s.plats&&s.plats.map(a=>a&&a.length)}));},2000));})()`));
await browser.close(); process.exit(0);
