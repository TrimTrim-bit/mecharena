/* sweep2: verify all the user-flagged games now have goal-driven AI */
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
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Users\\timot\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe", timeout: 40000 });
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
await js(`window.setAIMode('both_ai')`);
const GAMES = [
  ["g2048Game", `(function(){var s=window.PDX_GAME_STATE['g2048Game'];return s&&s.s?s.s.join('-'):'nopub';})()`],
  ["boxingGame", `(function(){var s=window.PDX_GAME_STATE['boxingGame'];return s&&s.bx?'hp:'+s.bx.map(b=>Math.round(b.hp)).join('/'): 'nopub';})()`],
  ["joustGame", `(function(){var s=window.PDX_GAME_STATE['joustGame'];return s&&s.pl?s.pl.map(p=>Math.round(p.y)).join('/'): 'nopub';})()`],
  ["joustGame2", `(function(){var s=window.PDX_GAME_STATE['joustGame2'];return s&&s.pl?s.pl.map(p=>Math.round(p.y)).join('/'): 'nopub';})()`],
  ["tankbattleGame", `(function(){var s=window.PDX_GAME_STATE['tankbattleGame'];return s&&s.pl?s.pl.map(p=>Math.round(p.a*57.3)%360+'d').join('/'): 'nopub';})()`],
  ["tankGame", `(function(){var T=window.__PDX_TANK_STATE;return T&&T.tanks?T.tanks.map(t=>Math.round(t.a*57.3)%360+'d').join('/'): 'nopub';})()`],
  ["marbleGame", `(function(){var s=window.PDX_GAME_STATE['marbleGame'];return s&&s.pl?s.pl.map(p=>Math.round(p.x)+','+Math.round(p.y)).join('/'): 'nopub';})()`],
  ["lavaescapeGame", `(function(){var s=window.PDX_GAME_STATE['lavaescapeGame'];return s&&s.pl?s.pl.map(p=>Math.round(p.y)).join('/'): 'nopub';})()`],
  ["jumpGame", `(function(){var s=window.PDX_GAME_STATE['jumpGame'];return s&&s.st?s.st.map(p=>p.ph+':'+Math.round(p.x)).join('/'): 'nopub';})()`],
  ["skijumpGame", `(function(){var s=window.PDX_GAME_STATE['skijumpGame'];return s&&s.st?s.st.map(p=>p.best||0+'x'+Math.round(p.x)).join('/'): 'nopub';})()`],
  ["ropeGame", `(function(){var s=window.PDX_GAME_STATE['ropeGame'];return s&&s.pl?s.pl.map(p=>Math.round(p.h||0)).join('/'): 'nopub';})()`],
  ["geometryGame", `(function(){var s=window.PDX_GAME_STATE['geometryGame'];return s&&s.dist?s.dist.map(d=>Math.round(d)).join('/'): 'nopub';})()`],
  ["pong", `(function(){var s=window.PDX_GAME_STATE['pong'];return s&&s.p2?'y:'+Math.round(s.p2.y): 'nopub';})()`],
  ["volleyGame", `(function(){var s=window.PDX_GAME_STATE['volley'];return s&&s.ball?'bx:'+Math.round(s.ball.x)+' by:'+Math.round(s.ball.y)+' sc:'+s.score1+'-'+s.score2: 'nopub';})()`],
  ["hockeyGame", `(function(){var s=window.PDX_GAME_STATE['hockey'];return s&&s.p2?'p2:'+Math.round(s.p2.x)+','+Math.round(s.p2.y): 'nopub';})()`],
  ["bombGame", `(function(){var s=window.PDX_GAME_STATE['bomb'];return s&&s.p2?'p2:'+Math.round(s.p2.x): 'nopub';})()`],
  ["breadGame", `(function(){var s=window.PDX_GAME_STATE['bread'];return s&&s.p2?'p2:'+Math.round(s.p2.x): 'nopub';})()`],
  ["dodgeGame", `(function(){var s=window.PDX_GAME_STATE['dodge'];return s&&s.p2?'p2:'+Math.round(s.p2.x): 'nopub';})()`],
  ["sumoGame", `(function(){var s=window.PDX_GAME_STATE['sumo'];return s&&s.p2?'p2:'+Math.round(s.p2.x): 'nopub';})()`],
  ["spaceGame", `(function(){var T=window.__PDX_SPACE_STATE;return T&&T.ships?T.ships.map(t=>Math.round(t.y)).join('/'): 'nopub';})()`],
  ["potatoGame", `(function(){var T=window.__PDX_POTATO_STATE;return T&&T.players?T.players.map(t=>Math.round(t.x)+','+Math.round(t.y)).join('/'): 'nopub';})()`],
  ["snakeGame", `(function(){var s=window.PDX_GAME_STATE['snake'];return s&&s.p2?'p2:'+Math.round(s.p2.x)+','+Math.round(s.p2.y): 'nopub';})()`],
  ["basketGame", `(function(){var s=window.PDX_GAME_STATE['basket'];return s&&s.p2?'p2:'+Math.round(s.p2.x): 'nopub';})()`],
];
for (const [id, snap] of GAMES) {
  await js(`try{showMenu()}catch(e){}`);
  await page.waitForTimeout(350);
  await js(`try{window.openGame('${id}')}catch(e){}`);
  await page.waitForTimeout(2300);
  const a = await js(snap);
  await page.waitForTimeout(1600);
  const b = await js(snap);
  const moved = a !== b && !/nopub|nokey/.test(a);
  console.log((moved ? "PLAYS " : "STATIC") + "  " + id.padEnd(18), "|", a.slice(0, 44), "→", b.slice(0, 44));
}
await browser.close(); process.exit(0);
