/* verify2: sidebar buttons, volleyball serve, AI strategies, cinema motion */
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
const errs = [];
cdp.on("Runtime.exceptionThrown", ev => errs.push(String(ev.exceptionDetails?.exception?.description || "").slice(0, 140)));
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:8766/index.html?v=" + Date.now(), { waitUntil: "commit", timeout: 15000 }).catch(() => { });
await page.waitForTimeout(6000);
async function js(expr, awaitP) {
  const ev = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: !!awaitP });
  return ev.result.value;
}
const out = {};
/* catalog loaded? */
out.core = await js(`JSON.stringify({cat:(window.PDX_CATALOG||[]).length,cards:document.querySelectorAll('#menu .game-card[data-id]').length})`);
/* sidebar: hover edge should open; shop button opens shop screen */
out.sidebarOpen = await js(`(function(){var sb=document.getElementById('dockSidebar');return JSON.stringify({strip:!!document.getElementById('dockHoverStrip'),openNow:sb.classList.contains('open')});})()`);
await js(`(function(){window.toggleDock();})();`);
out.shopBtn = await js(`(function(){
  var sb=document.getElementById('dockSidebar');
  var btn=[...sb.querySelectorAll('.sidebar-btn')].find(b=>/SHOP/i.test(b.textContent));
  btn.click();
  return new Promise(r=>setTimeout(()=>{
    var act=document.querySelector('.screen.active');
    r(JSON.stringify({active:act&&act.id,shopVisible:!!document.getElementById('shopScreen'),tabs:document.querySelectorAll('#shopScreen .shop-tab').length}));
  },500));
})()`, true);
await js(`try{showMenu()}catch(e){}`);
/* settings button opens settings panel */
out.settingsBtn = await js(`(function(){
  var sb=document.getElementById('dockSidebar');
  window.toggleDock();
  var btn=[...sb.querySelectorAll('.sidebar-btn')].find(b=>/SETTINGS/i.test(b.textContent));
  btn.click();
  return new Promise(r=>setTimeout(()=>{
    r(JSON.stringify({settingsOpen:document.getElementById('settingsPanel').classList.contains('open')}));
  },500));
})()`, true);
await js(`(function(){document.getElementById('settingsPanel').classList.remove('open');try{showMenu()}catch(e){}})()`);
/* volleyball: serve arcs over the net (ball crosses midline before touching floor) */
out.volley = await js(`(function(){
  window.openGame('volleyGame');
  return new Promise(r=>setTimeout(()=>{
    var s=window.PDX_GAME_STATE&&window.PDX_GAME_STATE['volley'];
    var b=s&&s.ball;
    r(JSON.stringify({pub:!!s,ball:b?{x:Math.round(b.x),y:Math.round(b.y),vx:Math.round(b.vx||0),vy:Math.round(b.vy||0)}:'none'}));
  },900));
})()`, true);
await page.waitForTimeout(1500);
out.volleyMid = await js(`(function(){var s=window.PDX_GAME_STATE['volley'];var b=s&&s.ball;return JSON.stringify(b?{x:Math.round(b.x),y:Math.round(b.y)}:'none');})()`);
await js(`try{showMenu()}catch(e){}`);
/* lava escape: P2 has platforms in its half */
out.lava = await js(`(function(){
  window.setAIMode('both_ai');window.openGame('lavaescapeGame');
  return new Promise(r=>setTimeout(()=>{
    var s=window.PDX_GAME_STATE['lavaescapeGame'];
    var plats=(s&&s.plats&&s.plats[1]||[]);
    var p2=s&&s.pl[1];
    r(JSON.stringify({p2plats:plats.length,p2:{x:p2&&Math.round(p2.x),grounded:p2&&p2.grounded},inOwnHalf:plats.length&&plats.every(pl=>pl.x>=450&&pl.x<900)}));
  },2200));
})()`, true);
/* 2048: AI slides tiles */
out.g2048 = await js(`(function(){
  try{showMenu()}catch(e){}
  window.openGame('g2048Game');
  return new Promise(r=>setTimeout(()=>{
    var s=window.PDX_GAME_STATE['g2048Game'];
    r(JSON.stringify({pub:!!s,sc:s&&s.s&&s.s[1]}));
  },2200));
})()`, true);
await page.waitForTimeout(2500);
out.g2048b = await js(`(function(){var s=window.PDX_GAME_STATE['g2048Game'];return JSON.stringify(s&&s.s&&{p2:s.s[1],p1:s.s[0]});})()`);
/* boxing: AI moves+punches */
out.boxing = await js(`(function(){
  try{showMenu()}catch(e){}
  window.openGame('boxingGame');
  return new Promise(r=>setTimeout(()=>{
    var s=window.PDX_GAME_STATE['boxingGame'];
    var b=s&&s.bx&&s.bx[1];
    r(JSON.stringify({pub:!!s,x:b&&Math.round(b.x)}));
  },2000));
})()`, true);
await page.waitForTimeout(2000);
out.boxing2 = await js(`(function(){var s=window.PDX_GAME_STATE['boxingGame'];var b=s&&s.bx&&s.bx[1];return JSON.stringify({x:b&&Math.round(b.x),hp:b&&Math.round(b.hp),foeHp:s&&s.bx&&Math.round(s.bx[0].hp)});})()`);
/* cinema: does a video animate */
await js(`try{showMenu()}catch(e){}`);
out.cinema = await js(`(function(){
  window.PDX_playLocalVideo({id:"vid_ocean",title:"OCEAN",desc:"t"});
  var cs=[...document.querySelectorAll('canvas')];
  window.__cv=cs[cs.length-1];
  return 'opened';
})()`);
const hashes = [];
for (let i = 0; i < 5; i++) { await page.waitForTimeout(700); hashes.push(await js(`(function(){var cv=window.__cv;if(!cv)return 'NO';var c=cv.getContext('2d');var d=0;for(var y=20;y<490;y+=17){var r=c.getImageData(0,y,900,1).data;for(var x=0;x<900;x+=29)d=(d+r[x*4]+r[x*4+1]+r[x*4+2])%99991;}return d;})()`)); }
out.cinemaAnimate = new Set(hashes).size > 1;
out.errors = errs.slice(0, 6);
console.log(JSON.stringify(out, null, 1));
await browser.close(); process.exit(0);
