# MECH ARENA

A browser-based mech combat game. The playable game, pilot progression, shop,
loadouts, seasons, and records run client-side; no account or game backend is
required.

## Run on Windows

1. Install Node.js if it is not already installed.
2. Double-click `start.bat`.
3. Keep the MECH ARENA Server window open while playing.

The first launch installs the JavaScript packages. That setup needs an internet
connection once. Later launches use the installed packages.

## Upload to a static website host

The project source folder is for editing; do not upload the whole folder.
To create the small static website bundle:

```bash
npm ci
npm run build
```

Upload the **contents of `dist/`** to the static host. Do not upload
`node_modules/` or the project source. The build output contains
the HTML page, styles, and browser game scripts and does not need Node.js or a
game server on the host. Hash-based routes support static hosts that do not
provide server-side route fallback.

`npm run preview` lets you check the production build locally before uploading.
Run `npm run test:arena` for the deterministic offline team-combat and
Search & Destroy objective-clock checks.

## Saves and private online PvP

Pilot progress is stored in the browser's local storage. It stays in that
browser and does not sync to another device. Private PvP parties support up to
four pilots using a six-character invite code. Multiplayer runs through a
Cloudflare Worker and Durable Objects; the game website can still be hosted as
static files.

### Run the party service locally

1. Start the room server with `npm run multiplayer:dev`.
2. In a second terminal, set `VITE_MULTIPLAYER_URL=http://127.0.0.1:8787` in
   `.env.local` and run `npm run dev`.
3. Open the game in two browser windows, create a party, and join with its code.

### Deploy online rooms

Cloudflare's Workers Free plan currently includes Durable Objects with SQLite,
subject to daily quotas and service limits. Create a Cloudflare account, run
`npx wrangler login`, then deploy with `npm run multiplayer:deploy`. The deploy
command prints the Worker URL. Set
`VITE_MULTIPLAYER_URL=https://YOUR-WORKER.workers.dev` in `.env.production`,
run `npm run build`, and upload the new `dist/` contents to the static host.
The multiplayer URL is public configuration, not a secret.

Free-tier availability and quotas can change; check
[Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
before publishing. Rooms are temporary, do not require accounts, and are
deleted after the party has been empty for 30 minutes. The first online mode is
private free-for-all PvP; online results do not award pilot progression yet,
and offline modes remain unchanged.

## Gameplay features

- Team Deathmatch and Search & Destroy join the offline AI battle rotation,
  alongside Free-For-All, survival and class-specific operations.
- Four new original urban districts—Copperline Exchange, Lantern Ward,
  Glassreach and Helix Yard—feature distinct street plans and building
  silhouettes. The battlefield footprint is expanded across every map.
- Team Deathmatch deploys allied AI squadmates against a larger hostile squad.
  Search & Destroy uses two marked bomb sites: hold E (or the labeled touch
  control) to plant, then defend the charge until detonation.
- Battlefields are randomly assigned for each sortie. Team Deathmatch and
  Search & Destroy prefer their map-tagged district pool; maps are not
  player-selectable.
- Mech and weapon customization, rarity-scaled equipment, shop unlocks, and a
  connected skill network.
- Daily contracts, weekly featured operations, and a 28-day season track.
- Permanent achievements and per-mode personal records.
- Temporary combat powerups dropped by defeated enemies.
