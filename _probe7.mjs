/* probe7: does the 2048 AI plan actually reach g.I[1]? */
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
await js(`try{showMenu()}catch(e){};window.setAIMode('both_ai');
  window.__log=[];
  (function(){var _pd=window.PD.micro;})();`);
await js(`try{window.openGame('g2048Game')}catch(e){}`);
// hook update to log I[1] each frame
await js(`(function(){
  var st=window.PDX_GAME_STATE;
  window.__frames=[];
  var iv=setInterval(function(){
    var s=st['g2048Game'];if(!s)return;
    window.__frames.push({I:s.I&&s.I[1],sc:s.s&&s.s[1],cnt:(window.__frames.length)});
    if(window.__frames.length>240)clearInterval(iv);
  },50);
})()`);
await page.waitForTimeout(6500);
console.log(await js(`JSON.stringify({frames:window.__frames.length,
  slides:window.__frames.filter(f=>f.I&&(f.pl||f.pr||f.pu||f.pd)).length,
  score:window.__frames.slice(-3).map(f=>f.sc),
  stratCalls:window.__STRAT_CALLS,
  bridgeHas:g=>null,
  gameKeys:!!window.PDX_GAME_STATE['g2048Game']})`));
await browser.close(); process.exit(0);
