# Birddog — build 59

An amateur scouting simulation. You cover a draft class every spring with a
limited number of trips and a bonus pool that is the sum of the picks you own.
Forty seasons later the organisation finds out what you were right about.

## Am I running the current version?

The bottom of the title screen reads:

    build 59 · names match their country
    3 save slots · 29 rival clubs

Anything else means an older copy is cached. Clear the browser's site data once
(F12 → Application → Clear site data) and reload.

## Putting it online (GitHub Pages)

1. Create a **public** repository.
2. Upload everything here, keeping the `css/` and `js/` folders intact.
3. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Wait a minute; the URL appears at the top of that page.
5. Open it on your phone, then Share → **Add to Home Screen**.

## Updating it later

The service worker is network-first, so a new upload arrives on the next load
by itself. If it seems stuck, the front office has a **Check for a new version**
button. Adding `#reset` to the URL wipes all saves and starts clean.

## Saves

The app always opens on the career picker. Three slots, an autosave every
season, three seasons of rollback, and per-slot export/import.

## Files

    index.html              shell, boot error reporter, update handling
    sw.js                   offline cache, network-first
    css/style.css           all styling
    js/names.js             name pools and the countries they belong to
    js/market.js            this career's market biases, and how they drift
    js/schools.js           region-aware school names
    js/core.js              prospect generation, scouting, report assembly
    js/text.js              scouting prose — subjects, predicates, composition
    js/text2.js             generic predicates, tails and sentence shapes
    js/career.js            development, promotion, the career sim, trades
    js/world.js             rival prospect pool, inherited farm, name dedupe
    js/clubs.js             the other 29 clubs and how they draft
    js/economy.js           slot money, draft order, signing prices
    js/saves.js             slots, autosave, archive, export/import
    js/ui.js                every screen and all interaction
