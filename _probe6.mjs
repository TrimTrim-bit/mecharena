/* probe6: boxing pub timing, lava plats across full round, 2048 AI taps */
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
for (const t of [800, 2000, 4000]) {
  await page.waitForTimeout(t === 800 ? 800 : 1200);
  console.log("boxing t+" + t, await js(`JSON.stringify({pub:!!window.PDX_GAME_STATE['boxingGame'],s:window.PDX_GAME_STATE['boxingGame']&&window.PDX_GAME_STATE['boxingGame'].bx&&window.PDX_GAME_STATE['boxingGame'].bx.map(b=>[Math.round(b.x),Math.round(b.hp)])})`));
}
await js(`try{showMenu()}catch(e){}`);
await js(`try{window.openGame('lavaescapeGame')}catch(e){}`);
for (let i = 0; i < 4; i++) {
  await page.waitForTimeout(1300);
  console.log("lava s" + i, await js(`JSON.stringify({plats:window.PDX_GAME_STATE['lavaescapeGame']&&window.PDX_GAME_STATE['lavaescapeGame'].plats&&window.PDX_GAME_STATE['lavaescapeGame'].plats.map(a=>a&&a.length),y:window.PDX_GAME_STATE['lavaescapeGame']&&window.PDX_GAME_STATE['lavaescapeGame'].pl&&window.PDX_GAME_STATE['lavaescapeGame'].pl.map(p=>p&&Math.round(p.y))})`));
}
await js(`try{showMenu()}catch(e){}`);
await js(`try{window.openGame('g2048Game')}catch(e){}`);
for (let i = 0; i < 4; i++) {
  await page.waitForTimeout(1800);
  console.log("2048 s" + i, await js(`JSON.stringify(window.PDX_GAME_STATE['g2048Game']&&window.PDX_GAME_STATE['g2048Game'].s)`));
}
await browser.close(); process.exit(0);
