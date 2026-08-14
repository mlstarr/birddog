# Birddog

An amateur scouting simulation. You cover a draft class every spring with a
limited number of trips and a bonus pool that is the sum of the picks you own.
Forty seasons later the organisation finds out what you were right about.

## Putting it online

1. Create a **public** repository on GitHub.
2. Upload every file here, keeping the folder structure (`js/`, `css/`).
3. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Wait a minute. Your URL appears at the top of that page.
5. Open it on your phone, then Share → **Add to Home Screen**.

It installs as a standalone app: its own icon, full screen, and it works with
no connection at all after the first load.

## Updating it later

Replace the changed files and **bump the `CACHE` name in `sw.js`** — otherwise
the service worker keeps serving the old version. Close and reopen the app once
after updating.

## Saves

Three career slots, an autosave every season, and three seasons of rollback.
Use **Download a save file** in the front office now and then; a browser
clearing its storage is the only thing that can lose a career.
