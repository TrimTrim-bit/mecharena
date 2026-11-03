import fs from "fs";
const s = fs.readFileSync("./_source_snapshot/games_af.js", "utf8");
const i = s.indexOf('id:"2048"');
console.log("idx", i);
console.log(s.slice(Math.max(0, i - 300), i + 400).replace(/\n/g, " | "));
