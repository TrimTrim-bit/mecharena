/* probe8: boxing punch check */
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
await js(`try{showMenu()}catch(e){};window.setAIMode('both_ai')`);
await js(`try{window.openGame('boxingGame')}catch(e){}`);
const frames = [];
for (let i = 0; i < 8; i++) {
  await page.waitForTimeout(700);
  frames.push(await js(`JSON.stringify((function(){var s=window.PDX_GAME_STATE['boxingGame'];if(!s)return 'nopub';
    var b=s.bx;if(!b)return 'nokey:'+Object.keys(s).slice(0,12).join(',');
    return {x:b.map(x=>Math.round(x.x)),hp:b.map(x=>Math.round(x.hp)),strat:(window.__STRAT_CALLS||{}).boxingGame};})())`));
}
console.log(frames.join("\n"));
await browser.close(); process.exit(0);
