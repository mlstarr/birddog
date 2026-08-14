# Birddog

An amateur scouting simulation. You cover a draft class every spring with a
limited number of trips and a bonus pool that is the sum of the picks you own.
Forty seasons later the organisation finds out what you were right about.

## Putting it online (GitHub Pages)

1. Create a **public** repository.
2. Upload everything here, keeping the `css/` and `js/` folders intact.
3. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Wait a minute; the URL appears at the top of that page.
5. Open it on your phone, then Share → **Add to Home Screen**.

## Updating it later

Replace the changed files and **bump the `CACHE` name in `sw.js`**, or the
service worker keeps serving the old version. Close and reopen the app once.

## Saves

Three career slots, an autosave every season, three seasons of rollback, and
per-slot export/import. Use **Download a save file** occasionally — a browser
clearing its storage is the only thing that can lose a career.

## Files

    index.html              shell and the boot error reporter
    sw.js                   offline cache (bump CACHE when updating)
    css/style.css           all styling
    js/schools.js           region-aware school names
    js/core.js              prospect generation, scouting, report language
    js/text.js              composed scouting prose
    js/career.js            per-season development and the career sim
    js/world.js             rival prospect pool, inherited farm
    js/clubs.js             the other 29 clubs and how they draft
    js/economy.js           slot money, draft order, signing prices
    js/saves.js             slots, autosave, archive, export/import
    js/ui.js                every screen and all interaction
