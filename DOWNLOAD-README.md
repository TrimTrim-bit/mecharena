# Mech Arena: Evolution — editable project

Extract this ZIP into a folder and open it with your code editor. Share the
folder or this ZIP with collaborators; GitHub is not required.

## Included
- Original editable game logic, Three.js models, arenas, UI and styles under src/.
- Server functions, authentication pages and database entity definitions.
- Package manifest, dependency lockfile and build configuration.
- Original README.md and development guidance.

## Working locally
This is development source, not an installer or a standalone offline game.
Install Node.js and use npm ci to install the dependencies. Follow README.md
for the project's backend linking and local development workflow. Sign-in,
cloud saves and progression still require a configured Base44 backend.
The main game engine is src/lib/arenaEngine.js; game content is in
src/lib/gameData.js, src/lib/mech/ and src/lib/arena/.

## Security and snapshots
No player records, passwords, environment files, registry credentials, installed
packages, Git history or generated build outputs are included. Credentials and
backend access must be arranged separately by the project owner.
This is a snapshot of the version serving this download. Edits in the extracted
folder do not automatically sync back to the hosted app. Keep a backup before
merging changes from other coders. If you change backend entity definitions,
update src/lib/project-backend-snapshot.server.js for future source downloads.
