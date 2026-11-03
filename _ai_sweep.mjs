/* _ai_sweep: open EVERY registered game in both_ai mode, sample AI-side entity over 3 windows.
   Verdict: MOVES / SCORED / STATIC / NOPUB */
import path from "path";
import os from "os";
import fs from "fs";
function resolvePatchright() {
  const base = path.join(os.homedir(), ".vscode/extensions");
  const exts = fs.readdirSync(base).filter(d => d.includes("dscodegpt"));
  for (const e of exts) {
    const b = path.join(base, e);
    for (const sub of ["standalone/node_modules", ""]) {
      if (fs.existsSync(path.join(b, sub, "patchright"))) return path.join(b, sub);
    }
  }
  return null;
}
const pr = resolvePatchright();
const { chromium } = await import("file:///" + path.join(pr, "patchright", "index.mjs").replace(/\\/g, "/"));
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe", timeout: 40000 });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Runtime.enable");
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8765/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(5500);
async function js(expr) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (ev.exceptionDetails) return "EXC:" + String(ev.exceptionDetails.exception?.description || ev.exceptionDetails.text).slice(0, 150);
  return ev.result.value;
}
await js(`window.setAIMode('both_ai')`);
const ids = JSON.parse(await js(`JSON.stringify((window.PDX_CATALOG||[]).map(g=>g.id))`));
console.log("total games:", ids.length);
const results = {};
for (const id of ids) {
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(350);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(2400);
  const snap = `(function(){try{
    var st=window.PDX_GAME_STATE||{};var s=st['${id}']||st['${id.replace(/Game$/,'')}'];
    if(!s)return 'nopub';
    var me=s.p2||(s.pl&&s.pl[1])||(s.tanks&&s.tanks[1])||(s.ships&&s.ships[1])||(s.players&&s.players[1])||(s.chars&&s.chars[1])||(s.paddle&&s.paddle[1])||(s.snakes&&s.snakes[1]&&s.snakes[1][0])||(s.st&&s.st[1])||(s.bikes&&s.bikes[1]&&s.bikes[1][0])||(s.f&&s.f[1])||(s.bx&&s.bx[1])||(s.pads&&s.pads[1]);
    var mv=me?[Math.round(me.x||0),Math.round(me.y||0)].join(','):'noent';
    var sc=s.score?[s.score[0],s.score[1]].join('-'):(s.score1!==undefined?(s.score1+'-'+s.score2):'-');
    return mv+'|'+sc;
  }catch(e){return 'ERR:'+e.message}})()`;
  const s1 = await js(snap);
  await page.waitForTimeout(1100);
  const s2 = await js(snap);
  await page.waitForTimeout(1100);
  const s3 = await js(snap);
  const moved = (s1 !== s2) || (s2 !== s3);
  const scored = /nopub|noent|ERR/.test(s1) ? false :
    (s1.split("|")[1] !== s3.split("|")[1] && s3.split("|")[1] !== "-");
  let verdict = "NOPUB";
  if (!/nopub/.test(s1)) {
    verdict = moved ? (scored ? "SCORED+MOVES" : "MOVES") : scored ? "SCORED" : "STATIC";
  }
  results[id] = verdict;
  console.log(verdict.padEnd(14), id.padEnd(26), s1.slice(0, 44));
  await js(`try{window.showMenu()}catch(e){}`);
  await page.waitForTimeout(300);
}
const summary = {};
for (const [id, v] of Object.entries(results)) summary[v] = (summary[v] || []).concat(id);
for (const [v, list] of Object.entries(summary)) console.log("\n" + v + " (" + list.length + "): " + list.join(", "));
await browser.close();
process.exit(0);
