/* ============================================================
   SAVES
   Three named slots, an autosave taken every season, a short rollback history,
   and an archive of finished careers so a forty-year run leaves something
   behind. Hosted properly, this is durable — but the export button is still
   the only thing that survives a browser clearing its storage.
   ============================================================ */

const SAVE_VERSION = 8;
const SLOT_KEY = (n) => `birddog.slot.${n}`;
const META_KEY = "birddog.meta";
const ARCHIVE_KEY = "birddog.archive";
const ROLLBACK_KEY = (n) => `birddog.roll.${n}`;
const SLOTS = [1, 2, 3];

const STORE = {
  async get(k) {
    if (typeof window !== "undefined" && window.storage) {
      try { const r = await window.storage.get(k); return r && r.value ? r.value : null; } catch (e) { return null; }
    }
    try { return localStorage.getItem(k); } catch (e) { return null; }
  },
  async set(k, v) {
    if (typeof window !== "undefined" && window.storage) {
      try { await window.storage.set(k, v); return true; } catch (e) { return false; }
    }
    try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
  },
  async del(k) {
    if (typeof window !== "undefined" && window.storage) { try { await window.storage.delete(k); } catch (e) {} }
    try { localStorage.removeItem(k); } catch (e) {}
  },
};

let META = { slots: {}, activeSlot: 1 };
let ARCHIVE = [];

function slotSummary(s) {
  if (!s) return null;
  // Enough to choose between careers without opening them.
  const where = s.phase === "career-over" ? "career finished"
    : s.phase === "offseason" ? "offseason"
    : (s.draft && s.draft.idx < s.draft.picks.length) ? `mid-draft, pick ${s.draft.idx + 1} of ${s.draft.picks.length}`
    : `scouting, ${s.looksLeft} look${s.looksLeft === 1 ? "" : "s"} left`;
  return {
    year: s.year, seasons: (s.history || []).length, surplus: Math.round(s.lifetimeSurplus || 0),
    signed: s.signedTotal || 0, titles: s.titles || 0, hof: (s.hofList || []).length,
    farm: (s.farm || []).length, pick: s.draftPos, where,
    best: s.best ? s.best.name : null, saved: Date.now(),
  };
}

async function loadMeta() {
  try { const r = await STORE.get(META_KEY); if (r) META = JSON.parse(r); } catch (e) {}
  if (!META.slots) META.slots = {};
  if (!META.activeSlot) META.activeSlot = 1;
  try { const a = await STORE.get(ARCHIVE_KEY); if (a) ARCHIVE = JSON.parse(a); } catch (e) {}
  if (!Array.isArray(ARCHIVE)) ARCHIVE = [];
}
async function saveMeta() { await STORE.set(META_KEY, JSON.stringify(META)); }
async function saveArchive() { await STORE.set(ARCHIVE_KEY, JSON.stringify(ARCHIVE.slice(-30))); }

async function loadSlot(n) {
  try {
    const raw = await STORE.get(SLOT_KEY(n));
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.v === SAVE_VERSION ? d : null;
  } catch (e) { return null; }
}
async function writeSlot(n, s) {
  const ok = await STORE.set(SLOT_KEY(n), JSON.stringify(s));
  META.slots[n] = slotSummary(s);
  await saveMeta();
  return ok;
}
async function clearSlot(n) {
  await STORE.del(SLOT_KEY(n));
  await STORE.del(ROLLBACK_KEY(n));
  delete META.slots[n];
  await saveMeta();
}

/* ---------- rollback: the last few seasons, kept so a disaster isn't final ---------- */
async function pushRollback(n, s) {
  let list = [];
  try { const r = await STORE.get(ROLLBACK_KEY(n)); if (r) list = JSON.parse(r); } catch (e) {}
  if (!Array.isArray(list)) list = [];
  list.push({ year: s.year, at: Date.now(), data: JSON.stringify(s) });
  while (list.length > 3) list.shift();          // three deep is enough to be useful
  try { await STORE.set(ROLLBACK_KEY(n), JSON.stringify(list)); } catch (e) {}
}
async function listRollback(n) {
  try { const r = await STORE.get(ROLLBACK_KEY(n)); const l = r ? JSON.parse(r) : []; return Array.isArray(l) ? l : []; }
  catch (e) { return []; }
}

/* ---------- a finished career becomes a record ---------- */
function archiveCareer(s, title) {
  ARCHIVE.push({
    ended: s.year, title,
    surplus: Math.round(s.lifetimeSurplus || 0),
    war: Math.round(s.careerWAR || 0),
    signed: s.signedTotal || 0, mlb: s.mlbTotal || 0,
    titles: s.titles || 0, playoffs: s.playoffs || 0,
    hof: (s.hofList || []).map((h) => ({ name: h.name, pos: h.pos, year: h.signedYear })),
    ach: Object.keys(s.ach || {}).length,
    best: s.best ? { name: s.best.name, pos: s.best.pos, surplus: Math.round(s.best.surplus), war: s.best.war } : null,
    allStars: (s.hon && s.hon["All-Star"]) || 0,
    mvps: ((s.hon && s.hon.MVP) || 0) + ((s.hon && s.hon["Cy Young"]) || 0),
  });
  saveArchive();
}

/* ---------- moving a career in and out of a file ---------- */
function exportSave(s, label) {
  const payload = JSON.stringify({ birddog: SAVE_VERSION, exported: new Date().toISOString(), save: s });
  try {
    const blob = new Blob([payload], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `birddog-${label || s.year}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return true;
  } catch (e) { return false; }
}
function readSaveFile(file, cb) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const d = JSON.parse(fr.result);
      const s = d && d.save ? d.save : d;
      if (!s || s.v !== SAVE_VERSION) return cb(null, "That file is from a different version of the game.");
      cb(s, null);
    } catch (e) { cb(null, "That file could not be read."); }
  };
  fr.onerror = () => cb(null, "That file could not be read.");
  fr.readAsText(file);
}
