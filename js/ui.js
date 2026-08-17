/* ============================================================
   BIRDDOG — browser build
   ============================================================ */

/* ---------- state ---------- */
const SAVE_KEY = "birddog.save.v7";
// Bump this with every release. It is the only way to tell, from inside the
// running app, which version you are actually looking at.
const BUILD = "build 59 \u00b7 names match their country";
const SEASONS = 40;
let S = null;
let UI = { sort: "ofp", filter: "all", sel: null, pickSel: null, expand: {}, toast: null, screen: "title", armed: null };

function newGame() {
  const S2 = {
    v: SAVE_VERSION, year: 2026, budget: 150, bonusPaid: 0, lifetimeSurplus: 0, teamWAR: 0, wins: 0, losses: 0, draftPos: 3,
    upgrades: { scouts: 0, crosscheck: 0, analytics: 0, medical: 0, playerdev: 0, intl: 0, picks: 0, video: 0, proscout: 0, agents: 0 },
    looksLeft: 18, prospects: [], intlProspects: [], intlOffers: {},
    draft: null, history: [], lastResults: null, phase: "scouting",
    farm: [], shadow: [], closed: [], seasonReport: null, pending: [], ach: {}, playoffs: 0, titles: 0,
    pendingHOF: [], hofList: [], rivals: [],
    clubs: seedClubs(), pool: [], market: rollMarket(), acquired: [],
    staff: [makeScout(0), makeScout(0), makeScout(0), makeScout(0), makeScout(0)],
    careerWAR: 0, allStars: 0, superstars: 0, signedTotal: 0, mlbTotal: 0,
    winsSum: 0, bigSeasons: 0, best: null,
  };
  MARKET = S2.market;
  S2.rivals = seedRivals(S2.year);
  seedFarm(S2);
  // the club he left you isn't empty, so it isn't a 63-win team either
  S2.teamWAR = Math.round(S2.farm.reduce((a, r) => a + r.st.warTotal, 0) * 10) / 10;
  dedupeNames(S2);
  computeSeason(S2);
  openClass(S2);
  return S2;
}

function looksMaxOf(s) { return 18 + 4 * s.upgrades.scouts; }
// Thirty picks pass between each of your selections, so a 29-name follow list
// is emptied before your third round. Real departments follow hundreds.
function classSizeOf(s) { return 74 + 11 * s.upgrades.video; }

function openClass(s) {
  const need = classSizeOf(s);
  // Cover far more of the country than you can follow, then let the department
  // decide who is worth a follow — weighted toward where you actually pick.
  const pool = [];
  for (let i = 0; i < 190; i++) pool.push(genProspect(s.year));
  for (let i = 0; i < 4; i++) { const p = genProspect(s.year); p.buzz = clamp(Math.round(p.buzz - ri(16, 30)), 20, 80); pool.push(p); }
  for (let i = 0; i < 3; i++) { const p = genProspect(s.year); p.buzz = clamp(Math.round(p.buzz + ri(10, 22)), 20, 82); pool.push(p); }
  assignConsensus(pool);                       // one ordered board, no ties
  pool.forEach((p) => applyEconomy(p, p.consensus));
  s.pool = pool;                               // the universe every club drafts from
  const arr = pool
    .map((p) => ({ p, key: Math.pow(rnd(), 1 / followWeight(p.consensus, s.draftPos)) }))
    .sort((a, b) => b.key - a.key).slice(0, need + 5).map((x) => x.p);
  arr.forEach(freezeBoard);
  if (!s.staff || !s.staff.length) s.staff = [makeScout(0), makeScout(0), makeScout(0), makeScout(0), makeScout(0)];
  arr.forEach((p, i) => (p.sc = i % s.staff.length));
  arr.sort((a, b) => a.consensus - b.consensus || b.buzz - a.buzz);
  arr.forEach((p, i) => (p.rank = i + 1));
  for (const p of arr) runLook(s, p, "area");
  s.prospects = arr;

  const nIntl = s.upgrades.intl > 0 ? 4 + 3 * s.upgrades.intl : 0;
  const ia = [];
  const ipool = intlPoolTotal(s);
  for (let i = 0; i < nIntl; i++) { const p = genProspect(s.year, { intl: true }); intlEconomy(p, ipool); ia.push(p); }
  ia.sort((a, b) => b.buzz - a.buzz);
  ia.forEach((p, i) => (p.rank = i + 1));
  ia.forEach(freezeBoard);
  ia.forEach((p, i) => (p.sc = i % s.staff.length));
  for (const p of ia) runLook(s, p, "area");
  s.intlProspects = ia;

  s.looksLeft = looksMaxOf(s);
  s.intlOffers = {};
  s.draft = null;
  s.mandate = rollMandate(s);
  dedupeNames(s);
}

/* ---------- persistence (see saves.js) ---------- */
let HAS_SAVE = false, BOOT_SAVE = null;
function save() {
  if (!S) return;
  HAS_SAVE = true;
  writeSlot(META.activeSlot, S);
}
function wipe() {
  HAS_SAVE = false; BOOT_SAVE = null;
  clearSlot(META.activeSlot);
}

/* ---------- the things worth remembering that aren't money ---------- */
const ACHIEVEMENTS = [
  { k: "first", n: "First Blood", d: "A player you signed reaches the majors." },
  { k: "star", n: "Cornerstone", d: "Develop a 6-WAR season." },
  { k: "mvp", n: "Best in the League", d: "One of yours wins an MVP or a Cy Young." },
  { k: "roy", n: "Instant Impact", d: "One of yours wins Rookie of the Year." },
  { k: "steal", n: "Steal of the Draft", d: "A player signed under $500K produces 15 WAR." },
  { k: "bargain5", n: "Bargain Bin", d: "Five players signed under $1M reach the majors." },
  { k: "pipeline", n: "Pipeline", d: "Five top-100 prospects in your system at once." },
  { k: "pipeline10", n: "Best Farm in Baseball", d: "Ten top-100 prospects at once." },
  { k: "factory", n: "The Factory", d: "Twenty-five signings reach the majors." },
  { k: "perfect", n: "Dead-On", d: "Sign a player whose final grade lands within 2 points of your FV." },
  { k: "fleece", n: "Fleeced Them", d: "Return $75M or more in a single trade." },
  { k: "soldlow", n: "One That Hurt", d: "Trade a player who then becomes a good big leaguer elsewhere." },
  { k: "soldhigh", n: "Read the Market", d: "Sell three players who did nothing after the deal." },
  { k: "briefs10", n: "Company Man", d: "Satisfy ten ownership briefs." },
  { k: "dynasty", n: "Dynasty", d: "Five straight 90-win seasons." },
  { k: "playoff", n: "October", d: "Reach the postseason." },
  { k: "title", n: "World Series", d: "Win it all." },
  { k: "title3", n: "Three Rings", d: "Win three World Series." },
  { k: "intl3", n: "Global Reach", d: "Three international signings reach the majors." },
  { k: "helium", n: "Ahead of the Curve", d: "A player drafted after pick 100 becomes a top-10 prospect." },
  { k: "forty", n: "Forty-Bomb", d: "One of yours hits 40 homers in a season." },
  { k: "allstar10", n: "Perennial", d: "Twenty All-Star selections across your career." },
  { k: "war500", n: "Five Hundred", d: "500 career WAR produced by your signings." },
  { k: "hof", n: "Cooperstown", d: "Sign a player who is elected to the Hall of Fame." },
  { k: "hof3", n: "A Wing of Their Own", d: "Three of your signings elected to the Hall." },
  { k: "generational", n: "Best of a Generation", d: "Develop a player with 3+ MVP or Cy Young awards." },
  { k: "clean", n: "Whole Board", d: "Sign all eight-plus picks in a single draft." },
];
function unlock(k) { if (!S.ach) S.ach = {}; if (!S.ach[k]) { S.ach[k] = S.year; return true; } return false; }
function checkAchievements(ctx) {
  const got = [];
  const A = (k, cond) => { if (cond && unlock(k)) got.push(ACHIEVEMENTS.find((a) => a.k === k)); };
  const closedAll = S.closed;
  A("first", (S.mlbTotal || 0) >= 1);
  A("star", ctx.events.some((e) => (e.season.war || 0) >= 6));
  A("mvp", (S.hon && ((S.hon.MVP || 0) + (S.hon["Cy Young"] || 0)) >= 1));
  A("roy", (S.hon && (S.hon["Rookie of the Year"] || 0) >= 1));
  A("forty", ctx.events.some((e) => e.season.awards.some((x) => /homer season/.test(x))));
  A("allstar10", (S.hon && (S.hon["All-Star"] || 0) >= 20));
  A("war500", (S.careerWAR || 0) >= 500);
  A("factory", (S.mlbTotal || 0) >= 25);
  A("steal", closedAll.some((c) => c.bonus < 0.5 && c.res.totalWAR >= 15)
    || S.farm.some((r) => r.bonus < 0.5 && r.st.warTotal >= 15));
  A("bargain5", closedAll.filter((c) => c.bonus < 1 && c.res.reachedMLB).length
    + S.farm.filter((r) => r.bonus < 1 && r.st.mlbYears > 0).length >= 5);
  A("intl3", closedAll.filter((c) => c.p.isIntl && c.res.reachedMLB).length
    + S.farm.filter((r) => r.p.isIntl && r.st.mlbYears > 0).length >= 3);
  const rf = rankedFarm();
  A("pipeline", rf.filter((x) => x.rank && x.rank <= 100).length >= 5);
  A("pipeline10", rf.filter((x) => x.rank && x.rank <= 100).length >= 10);
  A("helium", rf.some((x) => x.r.pick > 100 && x.rank && x.rank <= 10));
  A("briefs10", (S.mandatesMet || 0) >= 10);
  A("fleece", ctx.trades.some((t) => t.ret >= 75));
  A("soldlow", (S.soldLow || 0) >= 1);
  A("soldhigh", (S.soldHigh || 0) >= 3);
  A("perfect", ctx.closedRecs.some((c) => c && c.fvGap != null && c.fvGap <= 2));
  A("hof", (S.hofList || []).length >= 1);
  A("hof3", (S.hofList || []).length >= 3);
  A("generational", closedAll.some((c) => {
    const h = c.res.honors || [];
    return h.filter((x) => x === "MVP" || x === "Cy Young").length >= 3;
  }));
  A("clean", ctx.allPicksSigned);
  A("playoff", S.playoffs >= 1);
  A("title", S.titles >= 1);
  A("title3", S.titles >= 3);
  const w = S.history.slice(-5).map((h) => h.wins);
  A("dynasty", w.length === 5 && w.every((x) => x >= 90));
  return got;
}

/* ---------- ownership's brief ---------- */
// A short directive each spring, worth real budget. Sometimes it lines up with
// what you wanted to do anyway. Sometimes it costs you the player you liked.
const MANDATES = [
  { k: "colbat", text: "Ownership wants a polished college bat with your first pick.", reward: 70 },
  { k: "arms2", text: "The system is short on pitching. Sign at least three arms.", reward: 65 },
  { k: "premium", text: "Get us up the middle — sign a catcher or a shortstop.", reward: 60 },
  { k: "underslot", text: "Stay disciplined: commit no more than 85% of your pool.", reward: 55 },
  { k: "hs2", text: "Ownership wants upside. Sign at least two high schoolers.", reward: 65 },
  { k: "bargain", text: "Find us something for nothing — sign a player under $400K who reaches Double-A.", reward: 80, pending: true },
  { k: "firstround", text: "Do not miss on the first pick. He has to reach the majors and be worth something there.", reward: 90, pending: true },
  { k: "twoway", text: "Ownership wants a shortstop or centre fielder — someone who can actually run.", reward: 60 },
  { k: "juco", text: "Scout the small schools. Sign two players out of junior college or a non-power programme.", reward: 55 },
  { k: "lefty", text: "We need left-handed pitching. Sign two.", reward: 60 },
  { k: "overslot", text: "Be aggressive — go over slot on at least one pick and get someone who fell.", reward: 65 },
  { k: "spread", text: "No eggs in one basket. Nobody gets more than 40% of the pool.", reward: 55 },
  { k: "prep", text: "Ownership wants youth. Half your signings should be high schoolers or international amateurs.", reward: 70 },
  { k: "intl", text: "Justify the academy — sign at least two international amateurs.", reward: 60, needs: "intl" },
];
function rollMandate(s) {
  const pool = MANDATES.filter((m) => !m.needs || s.upgrades[m.needs] > 0);
  return { ...pick(pool), done: null };
}
function checkSigningMandate(s, signed) {
  const m = s.mandate;
  if (!m) return false;
  const withPick = signed.filter((y) => y.pick);
  const first = withPick.length ? withPick.sort((a, b) => a.pick - b.pick)[0] : null;
  switch (m.k) {
    case "colbat": return !!first && !first.p.isP && first.p.origin === "COL";
    case "arms2": return signed.filter((x) => x.p.isP).length >= 3;
    case "premium": return signed.some((x) => x.p.pos === "C" || x.p.pos === "SS");
    case "underslot": return committed(s) <= poolTotal(s) * 0.85;
    case "hs2": return signed.filter((x) => x.p.origin === "HS").length >= 2;
    case "intl": return signed.filter((x) => x.p.isIntl).length >= 2;
    case "twoway": return signed.some((x) => (x.p.pos === "SS" || x.p.pos === "CF"));
    case "juco": return signed.filter((x) => x.p.origin === "JUCO").length >= 2;
    case "lefty": return signed.filter((x) => x.p.pos === "LHP").length >= 2;
    case "overslot": return signed.some((x) => x.pick && x.bonus > x.slot * 1.15);
    case "spread": return signed.length > 0 && signed.every((x) => x.bonus <= poolTotal(s) * 0.40);
    case "prep": return signed.length >= 2 && signed.filter((x) => x.p.origin === "HS" || x.p.isIntl).length >= signed.length / 2;
  }
  return false;   // bargain and firstround can only be judged later
}
// Briefs whose answer takes years. Checked every season until met or expired.
function checkPendingMandate(s, m) {
  const live = s.farm.filter((r) => m.signedIds.includes(r.p.id));
  const done = s.closed.filter((c) => m.signedIds.includes(c.p.id));
  if (m.k === "bargain")
    return live.some((r) => r.bonus < 0.4 && r.st.li >= 3) || done.some((c) => c.bonus < 0.4 && c.res.years.some((y) => ["Double-A", "Triple-A", "MLB"].includes(y.level)));
  if (m.k === "firstround") {
    if (!m.firstPick) return false;
    const id = m.firstPick.p.id;
    const l = s.farm.find((r) => r.p.id === id), d = s.closed.find((c) => c.p.id === id);
    if (l) return l.st.warTotal >= 5;
    if (d) return d.res.reachedMLB && d.res.totalWAR >= 5;
  }
  return false;
}

/* ---------- evaluation helpers ---------- */
// The industry's opinion, frozen before your staff files anything. Every arrow
// you see afterwards is movement away from this number.
const TOOLS_OF = (p) => p.isP ? ["fb", "brk", "ch", "cmd", "dur", "delivery"] : ["hit", "power", "run", "field", "arm", "disc"];
function freezeBoard(p) {
  p.board = {};
  for (const t of TOOLS_OF(p)) p.board[t] = priorFor(p, `${t}_fut`).m;
  const gk = p.isP ? ["fb", "brk", "ch", "cmd"] : ["hit", "power", "run", "field", "arm"];
  const w = p.isP ? [0.32, 0.24, 0.14, 0.30] : [0.40, 0.26, 0.09, 0.16, 0.09];
  p.boardOFP = gk.reduce((a, k, i) => a + w[i] * p.board[k], 0);
}
// Direction only. The size of the move lives in the reports, not in a number.
const ARROWS = [
  [10, "\u25b2\u25b2", "well above the board", "up2"],
  [3.5, "\u25b2", "above the board", "up1"],
  [-3.5, "\u2014", "in line with the board", "flat"],
  [-10, "\u25bc", "below the board", "dn1"],
  [-9999, "\u25bc\u25bc", "well below the board", "dn2"],
];
const arrowFor = (d) => ARROWS.find((a) => d >= a[0]) || ARROWS[ARROWS.length - 1];
const toolDelta = (p, t) => getEst(p, `${t}_fut`).m - (p.board ? p.board[t] : priorFor(p, `${t}_fut`).m);
const ofpDelta = (p) => estOFP(p) - (p.boardOFP != null ? p.boardOFP : estOFP(p));
const arrowOf = (p) => arrowFor(ofpDelta(p));
const ordinal = (n) => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd"
  : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");
// "L/R" read as two positions side by side. Say what it means.
const handed = (p) => p.bats === "S" ? `switch, T${p.throws}` : `B${p.bats}/T${p.throws}`;
// Your department will not put a number on a player it hasn't seen enough of.
// Reading the reports is how you decide whether he's worth the trips that earn one.
// An FV is a commitment, and your department doesn't make one cheaply. It takes
// sustained coverage AND more than one kind of look — you cannot earn a number
// by watching the same player play five games.
const LOOK_WEIGHT = { area: 0.5, game: 1, work: 1, bg: 0.8, med: 0.8, data: 1.6, xc: 2.6 };
function coverage(p) {
  let c = 0;
  for (const k in p.seen) {
    let w = LOOK_WEIGHT[k] || 1;
    if (k === "data") w += 0.35 * S.upgrades.analytics;
    if (k === "xc") w += 0.35 * S.upgrades.crosscheck;
    c += (p.seen[k] || 0) * w;
  }
  return Math.round(c * 10) / 10;
}
function fvNeed() {
  return Math.round((4.5 - 0.35 * S.upgrades.crosscheck - 0.15 * S.upgrades.analytics) * 10) / 10;
}
function fvKinds(p) { return Object.keys(p.seen).filter((k) => k !== "area" && p.seen[k] > 0).length; }
function fvReady(p) { return coverage(p) >= fvNeed() && fvKinds(p) >= 2; }
const fvOf = (p) => r5(estOFP(p));
// Two of your players can be #4 and #7 in baseball. They cannot both be #1.
// Your players are ranked by slotting them into the actual population of
// prospects in baseball — the other 29 clubs' players included.
function mergedBoard() {
  const mine = S.farm.map((r) => ({ r, g: prospectGrade(r), mine: true }));
  const theirs = (S.rivals || []).map((v) => ({ riv: v, g: v.grade }));
  const all = mine.concat(theirs).sort((a, b) => b.g - a.g);
  all.forEach((x, i) => (x.rank = i + 1));
  return all;
}
function rankedFarm() {
  const board = mergedBoard();
  return board.filter((x) => x.mine).map((x) => ({ ...x, rank: x.rank <= 500 ? x.rank : null }));
}

function estOFP(p) {
  const gk = p.isP ? ["fb", "brk", "ch", "cmd"] : ["hit", "power", "run", "field", "arm"];
  const w = p.isP ? [0.32, 0.24, 0.14, 0.30] : [0.40, 0.26, 0.09, 0.16, 0.09];
  return gk.reduce((s, k, i) => s + w[i] * getEst(p, `${k}_fut`).m, 0);
}
function certainty(p) {
  const gk = p.isP ? ["fb", "brk", "ch", "cmd"] : ["hit", "power", "run", "field", "arm"];
  const avg = gk.reduce((s, k) => s + (sdOf(getEst(p, `${k}_cur`)) + sdOf(getEst(p, `${k}_fut`))) / 2, 0) / gk.length;
  return clamp(1 - (avg - 4) / 12, 0, 1);
}
function priceRead(p) { return p.askKnown ? p.askKnown : marketRange(p); }

/* ---------- toast ---------- */
let toastT = null;
function toast(m) { UI.toast = m; clearTimeout(toastT); toastT = setTimeout(() => { UI.toast = null; render(); }, 2200); render(); }

/* ============================================================
   RENDER
   ============================================================ */
const el = (id) => document.getElementById(id);

let render = function () {
  const app = el("app");
  // a finished draft is finished — don't let a stale screen strand the player
  if (S) {
    if (S.phase === "offseason" && ["class", "draft", "intl", "prospect"].includes(UI.screen)) UI.screen = "office";
    if (UI.screen === "player" && !S.farm.some((r) => r.p.id === UI.farmSel)) UI.screen = "farm";
    if (S.phase === "career-over" && !["career", "season", "farm", "player", "title"].includes(UI.screen)) UI.screen = "career";
    if (UI.screen === "season" && !S.seasonReport) UI.screen = "office";
  }
  let html = "";
  if (UI.screen === "title") html = viewTitle();
  else if (UI.screen === "office") html = topBar() + viewOffice() + nav();
  else if (UI.screen === "class") html = topBar() + viewClass() + nav();
  else if (UI.screen === "prospect") html = topBar() + viewProspect() + nav();
  else if (UI.screen === "draft") html = topBar() + viewDraft() + nav();
  else if (UI.screen === "intl") html = topBar() + viewIntl() + nav();
  else if (UI.screen === "season") html = viewSeason() + nav();
  else if (UI.screen === "farm") html = topBar() + viewFarm() + nav();
  else if (UI.screen === "player") html = topBar() + viewFarmPlayer() + nav();
  else if (UI.screen === "archive") html = viewArchive();
  else if (UI.screen === "database") html = topBar() + viewDatabase() + nav();
  else if (UI.screen === "career") html = viewCareer() + nav();

  if (UI.toast) html += `<div class="toast">${UI.toast}</div>`;
  app.innerHTML = html;
  // The page scrolls on the window, not on #app — setting app.scrollTop did
  // nothing, so every render left you wherever you happened to be, usually the
  // bottom of the list you just tapped in.
  if (UI.keepScroll) {
    // an in-place action: stay put
    const y = UI.keepScroll; UI.keepScroll = 0;
    try { window.scrollTo(0, y); } catch (e) {}
  } else {
    // a new screen: start at the top
    try { window.scrollTo(0, 0); } catch (e) {}
    if (app.scrollTop) app.scrollTop = 0;
    if (typeof document !== "undefined") {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }
}

// Whatever goes wrong, there is always a way out of it.
const renderSafe = render;
render = function () {
  try { renderSafe(); }
  catch (err) {
    document.getElementById("app").innerHTML = `<div class="wrap">
      <div class="eyebrow">Something broke</div>
      <h2>This save won't open</h2>
      <div class="card note">The career file is damaged or was written by an older version, so the screen
      couldn't be drawn. Starting a new career clears it. If you have a save file on your device you can load that instead.</div>
      <div class="card"><div class="dim xs" style="font-family:var(--mono)">${String(err && err.message || err)}</div></div>
      <button class="btn pri" data-a="restart">Clear it and start a new career</button>
      <div class="sp"></div>
      <label class="btn ghost file">Load a save file<input type="file" accept="application/json" data-a="importfile" hidden></label>
    </div>`;
  }
};

function nav() {
  const on = (k) => (UI.screen === k
    || (UI.screen === "prospect" && k === "class")
    || (UI.screen === "player" && k === "farm")
    || (UI.screen === "intl" && k === "draft")) ? "on" : "";
  if (S.phase === "career-over") {
    return `<div class="nav">
      <button data-a="tab" data-k="career" class="${on("career")}">Career</button>
      <button data-a="tab" data-k="season" class="${on("season")}">Season</button>
      <button data-a="tab" data-k="farm" class="${on("farm")}">Farm</button></div>`;
  }
  if (S.phase === "offseason") {
    return `<div class="nav">
      <button data-a="tab" data-k="office" class="${on("office")}">Office</button>
      <button data-a="tab" data-k="season" class="${on("season")}">Season</button>
      <button data-a="tab" data-k="farm" class="${on("farm")}">Farm</button></div>`;
  }
  return `<div class="nav">
    <button data-a="tab" data-k="office" class="${on("office")}">Office</button>
    <button data-a="tab" data-k="class" class="${on("class")}">Class</button>
    <button data-a="tab" data-k="farm" class="${on("farm") || on("database") ? "on" : ""}">Farm</button>
    <button data-a="todraft" class="${UI.screen === "draft" || UI.screen === "intl" ? "on" : ""}">Draft</button></div>`;
}

function topBar() {
  const pool = S.draft ? poolTotal(S) - committed(S) : (S.draft === null ? estPool(S) : 0);
  return `<div class="topbar"><div class="tbin">
    <div class="yr">${S.year}</div><div class="vr"></div>
    <div class="stat"><span>Looks</span><b class="${S.looksLeft === 0 ? "bad" : ""}">${S.looksLeft}/${looksMaxOf(S)}</b></div>
    <div class="stat"><span>Pick</span><b>#${S.draftPos}</b></div>
    <div class="stat"><span>Pool</span><b class="amb">${money(pool)}</b></div>
    <div class="stat"><span>Budget</span><b class="good">${money(S.budget)}</b></div>
    <button class="resetbtn" data-a="goreset" aria-label="Start a new career">&#8635;</button>
  </div></div>`;
}
function estPool(s) {
  const tmp = { ...s, draft: null };
  const picks = buildPicks(s);
  return Math.round(picks.reduce((a, p) => a + p.slot, 0) * 100) / 100;
}

/* ---------- title ---------- */
function viewTitle() {
  const slots = SLOTS.map((n) => ({ n, m: META.slots[n] }));
  const any = slots.some((x) => x.m);
  return `<div class="wrap title">
    <div class="eyebrow">Amateur scouting</div>
    <h1>BIRD<span class="amb">DOG</span></h1>
    <div class="rule"></div>
    <p class="lede">You cover an amateur class every spring with a limited number of trips, a draft slot
    you did not choose, and a bonus pool that is the sum of the picks you own. Forty seasons later the
    organisation finds out what you were right about.</p>

    <div class="eyebrow mt">Choose a career</div>
    ${slots.map(({ n, m }) => m ? `<div class="card slot">
        <button class="full" data-a="useslot" data-k="${n}">
          <div class="rowtop"><div class="flex mn">
            <div class="nm">${m.year} &middot; season ${m.seasons + 1} of 40</div>
            <div class="amb sm">${m.where || "in progress"}${m.pick ? ` &middot; holds pick #${m.pick}` : ""}</div>
            <div class="dim sm">${money(m.surplus)} lifetime &middot; ${m.signed} signed${m.farm ? ` &middot; ${m.farm} in the system` : ""}${m.titles ? ` &middot; ${m.titles} title${m.titles === 1 ? "" : "s"}` : ""}${m.hof ? ` &middot; ${m.hof} HOF` : ""}</div>
            ${m.best ? `<div class="dim xs">best signing: ${m.best}</div>` : ""}
          </div><div class="ofp"><b class="amb">&rsaquo;</b><span>resume</span></div></div>
        </button>
        <div class="grid3 mt8">
          <button class="stance" data-a="expslot" data-k="${n}">Export</button>
          <label class="stance file">Replace<input type="file" accept="application/json" data-a="impslot" data-k="${n}" hidden></label>
          <button class="stance" data-a="delslot" data-k="${n}">Erase</button>
        </div>
        ${UI.armed === "del" + n ? `<div class="card warn mt8">Erase slot ${n} permanently?
          <div class="grid2 mt8"><button class="btn" data-a="disarm">Keep it</button>
          <button class="btn pri" data-a="delslotgo" data-k="${n}">Erase</button></div></div>` : ""}
      </div>` : `<div class="card slot empty">
        <div class="dim sm">Slot ${n} &mdash; empty</div>
        <div class="grid2 mt8">
          <button class="btn" data-a="newslot" data-k="${n}">Start a career</button>
          <label class="btn ghost file">Load a file<input type="file" accept="application/json" data-a="impslot" data-k="${n}" hidden></label>
        </div></div>`).join("")}

    ${ARCHIVE.length ? `<div class="sp"></div><button class="btn ghost" data-a="tab" data-k="archive">Past careers (${ARCHIVE.length})</button>` : ""}
    ${!any ? `<div class="card mt8">
      <div class="pt"><b>The board is not your board.</b><span>Every player arrives with an industry ranking and a price anchored to it. Your job is to find where that ranking is wrong.</span></div>
      <div class="pt"><b>Slot money is the constraint.</b><span>Each pick carries an assigned value. Sign a college senior cheap and the savings fund an over-slot run at someone who fell.</span></div>
      <div class="pt"><b>Winning costs you.</b><span>The players you develop make the big club better, which pushes your pick later and shrinks next year's pool.</span></div>
    </div>` : ""}
    <div class="build">${BUILD}<br>${SLOTS.length} save slots \u00b7 ${(S && S.clubs ? S.clubs.length : 29)} rival clubs</div>
  </div>`;
}

/* ---------- office ---------- */
function viewOffice() {
  const rows = UPGRADES2.map((u) => {
    const t = S.upgrades[u.k], maxed = t >= u.max, cost = maxed ? null : u.cost[t], afford = !maxed && S.budget >= cost;
    return `<div class="card up">
      <div class="uphead"><div class="upname">${u.name}</div>
        <div class="pips">${Array.from({ length: u.max }).map((_, i) => `<i class="${i < t ? "on" : ""}"></i>`).join("")}</div></div>
      <div class="dim sm">${maxed ? u.effect : u.desc[t]}</div>
      ${maxed ? `<div class="done">Fully built</div>`
        : `<button class="btn ${afford ? "pri" : ""}" data-a="buy" data-k="${u.k}" ${afford ? "" : "disabled"}>
             ${afford ? `Buy — ${money(cost)}` : `${money(cost)} — need ${money(cost - S.budget)} more`}</button>`}
    </div>`;
  }).join("");

  const hist = S.history.length ? `<div class="eyebrow mt">Track record</div>` + [...S.history].reverse().map((h) =>
    `<div class="hrow"><b>${h.year ?? "—"}</b><span class="grade ${(h.grade || "C")[0]}">${h.grade || "—"}</span>
      <span class="dim sm flex">pick #${h.pos ?? "?"} · ${h.signedCount ?? 0} signed · ${h.best || ""}</span>
      <b class="${(h.surplus || 0) >= 0 ? "good" : "bad"}">${(h.surplus || 0) >= 0 ? "+" : ""}${money(h.surplus || 0)}</b></div>`).join("") : "";

  return `<div class="wrap">
    <div class="ohead">
      <div class="eyebrow">${S.phase === "offseason" ? `Offseason · ${S.year} class closed` : "Front office"}</div>
      <button class="newlink" data-a="arm" data-k="restart">New career</button>
    </div>
    <h2>${S.phase === "offseason" ? "Spend what they earned" : "Build the department"}</h2>
    ${UI.armed === "restart" ? `<div class="card warn">
      Start a new career? This erases ${S.history.length} class${S.history.length === 1 ? "" : "es"} and
      ${money(S.lifetimeSurplus)} of lifetime surplus. There is no undo.
      <div class="grid2 mt8"><button class="btn" data-a="disarm">Keep playing</button>
      <button class="btn pri" data-a="restart">Erase and start over</button></div></div>` : ""}
    ${S.phase === "offseason" ? `<div class="card note">The ${S.year} draft is finished. Anything you buy now is in place before the ${S.year + 1} class arrives.</div>` : ""}
    <div class="card">
      <div class="statrow">
        <div class="stat"><span>Budget</span><b class="good">${money(S.budget)}</b></div>
        <div class="stat"><span>Lifetime</span><b>${money(S.lifetimeSurplus)}</b></div>
        <div class="stat"><span>Classes</span><b>${S.history.length}</b></div>
      </div>
      <div class="dim sm mt8">Budget is the surplus value your signings produced. It buys staff and picks — it is not bonus money.</div>
    </div>
    ${S.mandate && S.phase !== "offseason" ? `<div class="card mandate"><div class="eyebrow">From ownership</div>
      <div class="sm">${S.mandate.text}</div>
      <div class="xs amb mt4">Worth ${money(S.mandate.reward)} if you deliver.</div></div>` : ""}
    <div class="card season">
      <div class="eyebrow">Year ${S.history.length + (S.phase === "offseason" ? 0 : 1)} of ${SEASONS} · last season</div>
      <div class="big">${S.wins}–${S.losses}</div>
      <div class="dim sm">${seasonNote()} You hold the <b class="amb">#${S.draftPos}</b> pick, worth ${money(slotValue(S.draftPos))} of slot money,
      and ${6 + S.upgrades.picks} picks totalling <b class="amb">${money(estPool(S))}</b>.
      ${S.draftNote ? `<br><span class="amb">${S.draftNote}</span>` : ""}</div>
    </div>
    ${rows}
    ${S.upgrades.analytics >= 1 ? (() => {
      const rows = marketReport(S.market, S.upgrades.analytics);
      return `<div class="eyebrow mt">Market research</div>
      <div class="card">
        <div class="dim sm mb">What the department has worked out about the industry you are competing
        against. Every market has its own habits, and they shift over the years.
        ${S.upgrades.analytics < 3 ? `A deeper department would see more of them, and put numbers on it.` : ``}</div>
        ${rows.map((r) => `<div class="hrow">
          ${r.exact ? `<b class="${r.v > 0 ? "bad" : "good"}">${r.v > 0 ? "+" : ""}${r.v}</b>`
            : `<b class="${r.v > 0 ? "bad" : "good"}">${r.v > 0 ? "over" : "under"}</b>`}
          <span class="dim sm flex"><b>${r.name}</b> — ${r.note}</span></div>`).join("")}
        <div class="dim xs mt8">${S.upgrades.analytics >= 3
          ? "Positive means the market pays too much. Negative means it is a bargain."
          : "\u201cOver\u201d means the market pays too much for it; \u201cunder\u201d means it is going cheap."}</div>
      </div>`;
    })() : ""}
    <div class="eyebrow mt">Achievements <span class="dim">${Object.keys(S.ach || {}).length} of ${ACHIEVEMENTS.length}</span></div>
    <div class="card">${ACHIEVEMENTS.map((a) => {
      const y = S.ach && S.ach[a.k];
      return `<div class="achrow ${y ? "got" : ""}"><b>${a.n}</b><span>${a.d}</span>${y ? `<i>${y}</i>` : ""}</div>`;
    }).join("")}</div>
    <div class="eyebrow mt">Your area staff</div>
    <div class="card">
      <div class="dim sm mb">These are your people for the length of your career, and every one of them has habits.
      Watch enough of their work and you'll learn what to discount.</div>
      ${S.staff.map((sc) => {
        const known = sc.filed >= 45 || S.upgrades.crosscheck >= 2;
        return `<div class="hrow"><b>${sc.name}</b>
          <span class="dim sm flex">${known ? scoutTendency(sc) : `${sc.filed} reports filed — not enough yet to read him`}</span></div>`;
      }).join("")}
    </div>
    ${hist}
    <div class="sp"></div>
    ${S.phase === "offseason"
      ? `<button class="btn pri" data-a="next">On to ${S.year + 1}</button>
         <div class="sp"></div>
         <button class="btn ghost" data-a="tab" data-k="season">Review the ${S.year} season</button>`
      : `<button class="btn pri" data-a="tab" data-k="class">Go scout the ${S.year} class</button>`}
    <div class="sp"></div>
    <button class="btn ghost" data-a="dlsave">Download a save file</button>
    <div class="sp"></div>
    <button class="btn ghost" data-a="tab" data-k="database">The database — everyone you've signed</button>
    <div class="sp"></div>
    <button class="btn ghost" data-a="tab" data-k="title">Switch career</button>
    <div class="sp"></div>
    <button class="btn ghost" data-a="forceupdate">Check for a new version</button>
    ${UI.armed === "roll" ? `<div class="card warn mt8">Go back to the start of an earlier season?
      Anything after it is lost.<div class="grid3 mt8">
      ${[0, 1, 2].map((i) => `<button class="stance" data-a="rollback" data-k="${i}">${i === 0 ? "Last season" : (i + 1) + " back"}</button>`).join("")}</div>
      <button class="btn mt8" data-a="disarm">Never mind</button></div>`
      : `<div class="sp"></div><button class="btn ghost" data-a="arm" data-k="roll">Roll back a season</button>`}
    <div class="sp"></div>
    <button class="btn ghost" data-a="arm" data-k="restart">Start a new career</button>
    <div class="build">${BUILD}<br>${SLOTS.length} save slots \u00b7 ${(S && S.clubs ? S.clubs.length : 29)} rival clubs</div>
  </div>`;
}
function seasonNote() {
  if (S.history.length === 0) return "You inherited a bad roster, which is the only reason you have a pick this high.";
  if (S.wins >= 92) return "The club is good now, and good clubs draft late.";
  if (S.wins >= 82) return "Respectable. Your graduates are showing up in the lineup.";
  return "Still rebuilding, which at least keeps your pick near the top.";
}

const UPGRADES2 = [
  { k: "scouts", name: "Area scout network", max: 4, cost: [55, 130, 240, 400],
    desc: ["Two more area guys. +4 looks a spring and sharper area reports.", "Regional coverage. +4 looks.", "National coverage. +4 looks.", "Best staff in the game. +4 looks."],
    effect: "+4 looks per spring, sharper free area reports" },
  { k: "crosscheck", name: "Cross-checkers", max: 3, cost: [70, 165, 320],
    desc: ["Hire a national cross-checker. Unlocks cross-check looks.", "Second cross-checker.", "Elite evaluation staff."],
    effect: "Unlocks cross-checks; less error in every report" },
  { k: "analytics", name: "Analytics department", max: 3, cost: [65, 155, 300],
    desc: ["Build the department. Unlocks data pulls.", "Proprietary models — very precise measurables.",
      "Market research: a standing report on where the industry misprices players."],
    effect: "Unlocks data pulls, precise measurables, and a read on market inefficiency" },
  { k: "medical", name: "Medical & performance", max: 3, cost: [50, 120, 235],
    desc: ["Team physician on staff. Unlocks medical reviews.", "Full performance staff.", "Elite sports-science group."],
    effect: "Unlocks medicals; your signings get hurt less" },
  { k: "playerdev", name: "Player development", max: 4, cost: [85, 175, 330, 520],
    desc: ["Rebuild the complex and the coaching staff.", "Pitching lab and hitting lab.", "Individual dev plans.", "Best system in baseball."],
    effect: "+12% development per tier for everyone you sign" },
  { k: "picks", name: "Front office dealmaking", max: 4, cost: [90, 190, 350, 560],
    desc: ["Trade for a competitive balance pick after round 1. More picks, more pool.", "A second extra pick.", "A third.", "A fourth."],
    effect: "Extra picks each draft, which adds slot money to your pool" },
  { k: "proscout", name: "Pro scouting department", max: 3, cost: [70, 160, 300],
    desc: ["Start valuing your own players the way rival clubs do. Puts a number on what each is worth in trade.",
      "Deeper coverage — see exactly how far the industry's view of a player has drifted from your staff's.",
      "Advance work on the amateur board too: where each player is expected to come off it."],
    effect: "Trade valuations on your own players, and a read on where amateurs will go" },
  { k: "agents", name: "Agent relations", max: 3, cost: [55, 130, 240],
    desc: ["Build relationships with the advisors. Players take your under-slot offers more often.",
      "Deeper trust. Better odds again, and a tighter read on what a player will actually sign for.",
      "Nobody negotiates better. Under-slot offers land far more often than they should."],
    effect: "Under-slot offers land more often; sharper signability reads" },
  { k: "intl", name: "International operations", max: 3, cost: [60, 140, 265],
    desc: ["Open a Dominican academy. Adds a separate international pool and a class of 16-year-olds.", "Expand to Venezuela and Colombia.", "Global pipeline."],
    effect: "A separate international pool, signed outside the draft" },
  { k: "video", name: "Video & coverage tech", max: 3, cost: [40, 95, 190],
    desc: ["Video everywhere. More of the class shows up on your board.", "Expanded coverage.", "Nothing gets past you."],
    effect: "More players in each class" },
];

/* ---------- class list ---------- */
function viewClass() {
  const list = visibleList();
  const chips = (name, opts, cur) => opts.map(([k, l]) =>
    `<button class="chip ${cur === k ? "on" : ""}" data-a="${name}" data-k="${k}">${l}</button>`).join("");
  const first = S.history.length === 0 && S.looksLeft === looksMaxOf(S)
    ? `<div class="card note"><b>Where to start. </b>Your area staff has already filed a rough write-up on everyone — that's what these grades are built from,
       and one man on one day can be wrong about a whole player. The projected pick and the price come from the industry, not from you.
       Look for names where your grade and their projected pick disagree.</div>` : "";
  return `<div class="wrap">
    <div class="chips">${chips("filter", [["all", "All"], ["star", "\u2605 List"], ["hit", "Hitters"], ["pit", "Arms"], ["seen", "Followed"]], UI.filter)}
      <div class="vr2"></div>${chips("sort", [["ofp", "My read"], ["move", "Movement"], ["rank", "Board"], ["ask", "Price"]], UI.sort)}</div>
    ${S.mandate ? `<div class="card mandate"><div class="eyebrow">From ownership</div>
      <div class="sm">${S.mandate.text}</div>
      <div class="xs amb mt4">Worth ${money(S.mandate.reward)} to the department if you deliver.</div></div>` : ""}
    ${first}
    ${S.looksLeft === 0 ? `<div class="card warn">Spring is over. No looks left — it's draft day.</div>` : ""}
    ${list.map(cardFor).join("")}
    <div class="sp"></div>
    <button class="btn pri" data-a="todraft">Go to draft day</button>
  </div>`;
}
function visibleList() {
  let a = [...S.prospects];
  if (UI.filter === "hit") a = a.filter((p) => !p.isP);
  if (UI.filter === "pit") a = a.filter((p) => p.isP);
  if (UI.filter === "seen") a = a.filter((p) => p.looks > 0);
  if (UI.filter === "star") a = a.filter((p) => p.star);
  if (UI.sort === "rank") a.sort((x, y) => x.rank - y.rank);
  if (UI.sort === "ofp") a.sort((x, y) => (fvReady(y) ? 1 : 0) - (fvReady(x) ? 1 : 0) || estOFP(y) - estOFP(x));
  if (UI.sort === "move") a.sort((x, y) => ofpDelta(y) - ofpDelta(x));
  if (UI.sort === "ask") a.sort((x, y) => y.ask - x.ask || x.rank - y.rank);
  return a;
}
function cardFor(p) {
  const ofp = estOFP(p), cert = certainty(p), pr = priceRead(p);
  return `<button class="card row" data-a="open" data-id="${p.id}">
    <div class="rowtop">
      <div class="proj"><b>${p.consensus <= 330 ? "#" + p.consensus : "—"}</b><span>proj</span></div>
      <div class="flex mn"><div class="nm">${p.name}</div>
        <div class="dim sm mn">${p.pos} · ${handed(p)} · ${p.age} · ${p.level}</div></div>
      <div class="ofp">${fvReady(p) ? `<b class="fv ${arrowOf(p)[3]}">${fvOf(p)}</b><span>your FV</span>` : `<b class="arrow ${arrowOf(p)[3]}">${arrowOf(p)[1]}</b><span>your read</span>`}</div>
    </div>
    <div class="rowbot">
      <span class="starbtn ${p.star ? "on" : ""}" data-a="star" data-id="${p.id}">${p.star ? "\u2605" : "\u2606"}</span>
      <div class="bar"><i style="width:${cert * 100}%"></i></div>
      <span class="dim xs">${p.looks === 0 ? "AREA ONLY" : p.looks + " LOOK" + (p.looks > 1 ? "S" : "")}</span>
      <span class="xs ${p.askKnown ? "amb" : "dim"}">${p.askKnown ? "asks ~" + moneyK(pr.lo) : moneyK(pr.lo) + "–" + moneyK(pr.hi)}</span>
      ${S.upgrades.proscout >= 3 ? `<span class="xs dim">~#${p.goneBy || (p.goneBy = Math.round(p.takenAt * (0.85 + rnd() * 0.3)))}</span>` : ""}
    </div></button>`;
}

/* ---------- prospect ---------- */
function viewProspect() {
  const p = (S.prospects.concat(S.intlProspects)).find((x) => x.id === UI.sel);
  if (!p) { UI.screen = "class"; return viewClass(); }
  const tools = p.isP
    ? [["Fastball", "fb"], ["Breaking", "brk"], ["Change", "ch"], ["Command", "cmd"], ["Durability", "dur"], ["Delivery", "delivery"]]
    : [["Hit", "hit"], ["Power", "power"], ["Run", "run"], ["Field", "field"], ["Arm", "arm"], ["Approach", "disc"]];
  const looks = Object.entries(LOOK_DEFS).filter(([k, d]) => !d.hidden && (!d.req || S.upgrades[d.req] > 0));
  const pr = priceRead(p);
  return `<div class="wrap">
    <button class="back" data-a="back">← Back to ${UI.from === "intl" ? "international signings" : UI.from === "draft" ? "the board" : "the class"}</button>
    <div class="phead">
      <div class="eyebrow">${p.isIntl ? "International FA" : "Projected pick #" + p.consensus} · ${p.level}
        <button class="starbtn big ${p.star ? "on" : ""}" data-a="star" data-id="${p.id}">${p.star ? "\u2605 on your list" : "\u2606 add to list"}</button></div>
        ${S.staff && S.staff.length && p.sc != null ? `<div class="dim xs">Covered by ${S.staff[p.sc % S.staff.length].name}</div>` : ""}
      <h2>${p.name}</h2>
      <div class="dim sm">${p.pos} · bats ${p.bats === "S" ? "switch" : p.bats === "L" ? "left" : "right"}, throws ${p.throws === "L" ? "left" : "right"} · ${p.ht}, ${p.wt} lb · age ${p.age}<br>${p.school}${p.origin !== "INTL" ? ` (${p.home})` : ""}</div>
    </div>
    <div class="card">
      <div class="gh"><span class="eyebrow">The board / your read</span>
        <span class="readout"><b class="ofpbig">${r5(p.boardOFP != null ? p.boardOFP : estOFP(p))}</b><i>board</i>
        ${fvReady(p) ? `<b class="ofpbig fv ${arrowOf(p)[3]}">${fvOf(p)}</b><i>your FV</i>`
          : `<em class="arrow ${arrowOf(p)[3]}">${arrowOf(p)[1]}</em>`}</span></div>
      <div class="readnote ${arrowOf(p)[3]}">${fvReady(p)
        ? `Your department will commit to a number: <b>FV ${fvOf(p)}</b>, ${arrowOf(p)[2]}. That's what your people believe — it is not what he is.`
        : `Your reports have him ${arrowOf(p)[2]}. No number yet — coverage ${coverage(p)} of ${fvNeed()}${fvKinds(p) < 2 ? `, and they need at least two different kinds of look` : ``}. Read the file and decide whether he's worth the rest.`}</div>
      ${tools.map(([l, t]) => toolRow(p, l, t)).join("")}
      <div class="hr"></div>
      ${["makeup", "health", "frame"].map((k) => {
        const e = p.est[`${k}_cur`], nm = k === "frame" ? "Projection" : k === "makeup" ? "Makeup" : "Health";
        return `<div class="kv"><span>${nm}</span><b class="${e ? wordFor(k, e.m)[1] : "unk"}">${e ? wordFor(k, e.m)[0] : "not looked into"}</b></div>`;
      }).join("")}
      <div class="kv"><span>${p.isIntl ? "Market expects" : "Slot at his projected pick"}</span><b class="dim">${p.isIntl ? moneyK(p.slotAsk * 0.7) + "–" + moneyK(p.slotAsk * 1.4) : moneyK(p.slotAsk)}</b></div>
      <div class="kv"><span>He'll sign for</span><b class="${p.askKnown ? "amb" : "unk"}">${p.askKnown ? moneyK(p.askKnown.lo) + "–" + moneyK(p.askKnown.hi) : "do the background work"}</b></div>
      <div class="dim xs mt8">The number is the industry's grade. The bar is how much your staff has actually seen. Until they have seen enough of him, you get a direction and the reports — no number.</div>
    </div>
    <div class="eyebrow">Send someone</div>
    <div class="grid2">${looks.map(([k, d]) => `
      <button class="card look" data-a="look" data-id="${p.id}" data-k="${k}" ${S.looksLeft < d.cost ? "disabled" : ""}>
        <div class="lh"><span>${d.name}</span><i class="amb">${d.cost}</i></div>
        <div class="dim xs">${d.blurb}</div>
        ${p.seen[k] ? `<div class="xs dim mt4">${p.seen[k]}× DONE</div>` : ""}
      </button>`).join("")}</div>
    ${(!S.upgrades.medical || !S.upgrades.analytics || !S.upgrades.crosscheck)
      ? `<div class="dim xs mb">Medicals, data pulls and cross-checks each need a department built in the front office.</div>` : ""}
    <div class="eyebrow">Reports (${p.reports.length})</div>
    ${[...p.reports].reverse().map(reportCard).join("")}
  </div>`;
}

// Character, medicals and physical projection are read in words, not grades —
// nobody hands you a 55 on a kid's work ethic.
const WORDBANDS = {
  makeup: [[62, "glowing reports", "good"], [53, "clean, no concerns", "good"], [45, "nothing either way", ""],
           [37, "some questions", "amb"], [-99, "serious concerns", "bad"]],
  health: [[60, "clean, durable", "good"], [50, "no structural concerns", "good"], [42, "minor history", ""],
           [34, "flags on the file", "amb"], [-99, "significant concerns", "bad"]],
  frame:  [[60, "lots of room left", "good"], [50, "room to fill out", "good"], [42, "mostly filled out", ""],
           [34, "close to maxed", "amb"], [-99, "physically maxed", "bad"]],
};
function wordFor(k, m) { const r = WORDBANDS[k].find((x) => m >= x[0]); return [r[1], r[2]]; }

function toolRow(p, label, tool) {
  const ef = getEst(p, `${tool}_fut`);
  const seen = clamp(1 - (sdOf(ef) - 5.5) / 11, 0, 1);
  const boardG = p.board ? r5(p.board[tool]) : r5(priorFor(p, `${tool}_fut`).m);
  const a = arrowFor(toolDelta(p, tool));
  return `<div class="tool">
    <span class="tl">${label}</span>
    <span class="bg2">${boardG}</span>
    <div class="conf"><i style="width:${seen * 100}%"></i></div>
    <span class="arrow ${a[3]}">${a[1]}</span></div>`;
}
function reportCard(r) {
  return `<div class="paper">
    <div class="ph ${r.shaky ? "shakyrep" : ""}"><span>${r.header}${r.by ? " &middot; " + r.by : ""}</span><span class="up">${r.shaky ? "<b>low confidence</b> &middot; " : ""}${LOOK_DEFS[r.kind].name}</span></div>
    ${r.lines.map((l) => typeof l === "string"
      ? `<div class="rl plain">${l}</div>`
      : `<div class="rl">${l.t ? `<span class="rt">${l.t}</span>` : `<span class="rt blank"></span>`}<span class="rs">${l.s}</span></div>`).join("")}
    ${r.numbers.length ? `<div class="pnum">${r.numbers.join(" · ")}</div>` : ""}</div>`;
}

/* ============================================================
   DRAFT DAY
   ============================================================ */
function startDraft() {
  S.draft = { picks: buildPicks(S), idx: 0, taken: {}, gone: {}, clubOffset: ri(0, 28), log: [] };
  if (!S.clubs || !S.clubs.length) S.clubs = seedClubs();
    if (!S.market) S.market = rollMarket();
    MARKET = S.market;
  buildClubBoards(S.clubs, S.pool);
  // everything ahead of your first pick happens before you are on the clock
  S.draft.lastGone = runRivalPicks(S, 1, S.draft.picks[0].overall);
  S.draft.log = S.draft.lastGone.map((x) => ({ n: x.at, name: x.p.name, pos: x.p.pos, club: x.club }));
  rollEvent();
  UI.pickSel = null; UI.screen = "draft"; save(); render();
}
function currentPick() { return S.draft.picks[S.draft.idx]; }

// Between your picks, the other twenty-nine clubs make theirs.
function advanceBoard() {
  const d = S.draft;
  if (!d || d.idx === 0) return;
  const from = d.picks[d.idx - 1].overall + 1;
  const to = d.idx < d.picks.length ? d.picks[d.idx].overall : from + 14;
  d.lastGone = runRivalPicks(S, from, to);
  d.log = d.log.concat(d.lastGone.map((x) => ({ n: x.at, name: x.p.name, pos: x.p.pos, club: x.club })));
}

// Things happen while you're on the clock. Prices move, physicals come back,
// somebody's summer coach finally picks up the phone.
function rollEvent() {
  const d = S.draft;
  if (!d || d.idx >= d.picks.length) return;
  const pk = d.picks[d.idx];
  if (pk.evt !== undefined) return;
  pk.evt = null;
  if (rnd() > 0.42) return;
  const av = availableAt().sort((a, b) => estOFP(b) - estOFP(a)).slice(0, 12);
  if (!av.length) return;
  const t = av[Math.floor(rnd() * av.length)];
  const roll = rnd();
  let text, tone = "warn";
  if (roll < 0.26) {
    const mult = 1.25 + rnd() * 0.4;
    t.ask = Math.round(t.ask * mult * 100) / 100;
    if (t.askKnown) { t.askKnown.lo *= mult; t.askKnown.hi *= mult; }
    text = `${t.name}'s advisor just called. He's raised his number — he now wants roughly ${moneyK(t.ask)} to sign.`;
  } else if (roll < 0.46) {
    const mult = 0.55 + rnd() * 0.25;
    t.ask = Math.round(Math.max(0.04, t.ask * mult) * 100) / 100;
    if (t.askKnown) { t.askKnown.lo *= mult; t.askKnown.hi *= mult; }
    text = `Word from ${t.name}'s camp: he wants to start his career and will take well under his projection — about ${moneyK(t.ask)}.`;
    tone = "good";
  } else if (roll < 0.66) {
    const h = clamp(gauss(t.health, 4), 12, 88);
    observe(t, "health_cur", h, 18);
    const bad = h < 45;
    if (bad) { t.ask = Math.round(t.ask * 0.72 * 100) / 100; if (t.askKnown) { t.askKnown.lo *= 0.72; t.askKnown.hi *= 0.72; } }
    text = bad
      ? `Our doctors just flagged ${t.name}'s physical. There's something on the file, and his price has come down because of it.`
      : `${t.name}'s medicals came back clean. Nothing on the file at all.`;
    tone = bad ? "warn" : "good";
  } else if (roll < 0.84) {
    const mk = clamp(gauss(t.makeup, 4.5), 12, 88);
    observe(t, "makeup_cur", mk, 22);
    text = mk < 44
      ? `${t.name}'s summer coach finally called back, and it wasn't good. There are makeup concerns nobody had put in writing.`
      : `Late background on ${t.name} came in glowing. Three separate people volunteered the same thing.`;
    tone = mk < 44 ? "warn" : "good";
  } else {
    t.takenAt = Math.max(pk.overall, Math.round(t.takenAt * 0.55));
    text = `Two clubs ahead of you have been calling on ${t.name}. He is not going to last much longer.`;
  }
  pk.evt = { id: t.id, text, tone };
}
// takenAt is the overall pick at which some other club calls his name. Every
// pick before yours belongs to somebody else, so he is gone only if takenAt is
// STRICTLY less than the pick you're on — at 1-1 nobody can be off the board.
function availableAt() {
  return S.prospects.filter((p) => !S.draft.gone[p.id]);
}
// Of the players your department followed, who did the other clubs just take?
function goneSince() {
  return (S.draft.lastGone || []).filter((x) => S.prospects.some((p) => p.id === x.p.id));
}
function poolLeft() { return Math.round((poolTotal(S) - committed(S)) * 100) / 100; }

function viewDraft() {
  const d = S.draft;
  if (d.idx >= d.picks.length) return viewDraftDone();
  const pk = currentPick();
  const gone = goneSince();
  const avail = availableAt();

  if (UI.pickSel) {
    const p = S.prospects.find((x) => x.id === UI.pickSel);
    return viewConfirm(p, pk);
  }
  const ds = UI.dsort || "ofp";
  const sorted = avail.sort((a, b) =>
    ds === "move" ? ofpDelta(b) - ofpDelta(a)
    : ds === "rank" ? a.consensus - b.consensus
    : ds === "ask" ? a.ask - b.ask
    : estOFP(b) - estOFP(a));
  return `<div class="wrap">
    <div class="eyebrow">Draft day ${S.year}</div>
    <h2>Round ${pk.round}, pick #${pk.overall}</h2>
    <div class="card statrow">
      <div class="stat"><span>Slot here</span><b class="amb">${money(pk.slot)}</b></div>
      <div class="stat"><span>Pool left</span><b>${money(poolLeft())}</b></div>
      <div class="stat"><span>Picks left</span><b>${d.picks.length - d.idx}</b></div>
    </div>
    ${pk.evt ? `<div class="card evt ${pk.evt.tone}"><div class="eyebrow">On the clock</div><div class="sm">${pk.evt.text}</div></div>` : ""}
    ${gone.length ? `<div class="card gone"><div class="eyebrow">${S.draft.idx === 0 ? `Gone before your first pick` : `Off the board since your last pick`}</div>
      ${gone.map((x) => `<div class="sm dim">#${x.at} — <b>${x.p.name}</b> (${x.p.pos}) to the ${x.club}</div>`).join("")}</div>` : ""}
    ${d.idx === 0 ? `<div class="card note"><b>How the money works. </b>Your pool is the sum of your slots.
      Sign someone below his slot and the savings roll forward; go over slot and you have to find it somewhere else.
      A player's price follows where he was <em>projected</em> — so a talent who slides is expensive, and a college senior is nearly free.</div>` : ""}
    <div class="eyebrow">On the board</div>
    <div class="chips">${[["ofp", "My read"], ["move", "Movement"], ["rank", "Board"], ["ask", "Cheapest"]].map(([k, l]) =>
      `<button class="chip ${ds === k ? "on" : ""}" data-a="dsort" data-k="${k}">${l}</button>`).join("")}</div>
    ${sorted.slice(0, 40).map((p) => draftRow(p, pk)).join("")}
    <div class="sp"></div>
    <button class="btn ghost" data-a="pass">Pass on this pick</button>
  </div>`;
}
function draftRow(p, pk) {
  const pr = priceRead(p), ofp = estOFP(p);
  const over = pr.lo > pk.slot;
  return `<button class="card row" data-a="pick" data-id="${p.id}">
    <div class="rowtop">
      <div class="proj"><b>#${p.consensus}</b><span>proj</span></div>
      <div class="flex mn"><div class="nm">${p.name}</div>
        <div class="dim sm mn">${p.pos} · ${p.level} · ${schoolLine(p)} · ${p.looks ? p.looks + " looks" : "area only"}</div></div>
      <div class="ofp">${fvReady(p) ? `<b class="fv ${arrowOf(p)[3]}">${fvOf(p)}</b><span>your FV</span>` : `<b class="arrow ${arrowOf(p)[3]}">${arrowOf(p)[1]}</b><span>your read</span>`}</div>
    </div>
    <div class="rowbot">
      <span class="xs ${p.askKnown ? "amb" : "dim"}">${p.askKnown ? "asks " + moneyK(pr.lo) + "–" + moneyK(pr.hi) : "market " + moneyK(pr.lo) + "–" + moneyK(pr.hi)}</span>
      <span class="xs ${over ? "bad" : "good"}">${over ? "over slot" : "at or under slot"}</span>
      ${S.upgrades.proscout >= 3 ? `<span class="xs dim">off the board ~#${p.goneBy || (p.goneBy = Math.round(p.takenAt * (0.85 + rnd() * 0.3)))}</span>` : ""}
    </div></button>`;
}
function viewConfirm(p, pk) {
  const pr = priceRead(p);
  const bonus = UI.bonus == null ? Math.min(poolLeft(), Math.max(pk.slot, Math.round(pr.hi * 100) / 100)) : UI.bonus;
  const hi = signChance(bonus / pr.lo), lo = signChance(bonus / pr.hi);
  const pct = lo === hi ? `${Math.round(lo * 100)}%` : `${Math.round(lo * 100)}–${Math.round(hi * 100)}%`;
  const diff = Math.round((bonus - pk.slot) * 100) / 100;
  return `<div class="wrap">
    <button class="back" data-a="unpick">← Back to the board</button>
    <div class="eyebrow">Round ${pk.round}, pick #${pk.overall} · slot ${money(pk.slot)}</div>
    <h2>${p.name}</h2>
    <div class="dim sm mb">${p.pos} · ${p.level} · ${p.school} · your read: ${arrowOf(p)[2]} · projected #${p.consensus}</div>
    <div class="card">
      <div class="gh"><span class="eyebrow">Bonus</span><b class="ofpbig">${moneyK(bonus)}</b></div>
      <div class="grid4">
        ${[-1, -0.1, 0.1, 1].map((dd) => `<button class="step" data-a="bonus" data-d="${dd}">${dd > 0 ? "+" : "−"}${Math.abs(dd) >= 1 ? "$1M" : "100K"}</button>`).join("")}
      </div>
      <div class="grid2 mt8">
        <button class="btn ghost" data-a="setbonus" data-v="${pk.slot}">Pay exactly slot</button>
        <button class="btn ghost" data-a="setbonus" data-v="${Math.round(pr.hi * 100) / 100}">Meet his number</button>
      </div>
      <div class="kv mt8"><span>${diff >= 0 ? "Over slot by" : "Under slot by"}</span><b class="${diff > 0 ? "bad" : "good"}">${moneyK(Math.abs(diff))}</b></div>
      <div class="kv"><span>Pool left after this</span><b>${money(Math.round((poolLeft() - bonus) * 100) / 100)}</b></div>
      <div class="odds ${hi >= 0.5 ? "good" : hi > 0 ? "amb" : "bad"}">
        ${hi === 0 ? "Nowhere near his number. He goes back to school and you lose the pick."
          : `About ${pct} to sign.${p.askKnown ? "" : " Rough — you never checked his signability."}${hi < 0.5 ? " This is a lowball." : ""}`}
      </div>
    </div>
    <button class="btn pri" data-a="confirm" data-id="${p.id}" ${bonus > poolLeft() ? "disabled" : ""}>
      ${bonus > poolLeft() ? "Over your pool" : `Draft him at ${moneyK(bonus)}`}</button>
    <div class="sp"></div>
    <button class="btn ghost" data-a="file" data-id="${p.id}">
      ${UI.showFile ? "Hide the file" : `Read the file (${p.reports.length} report${p.reports.length === 1 ? "" : "s"})`}</button>
    ${UI.showFile ? fileBlock(p) : ""}
  </div>`;
}
function fileBlock(p) {
  const tools = p.isP
    ? [["Fastball", "fb"], ["Breaking", "brk"], ["Change", "ch"], ["Command", "cmd"], ["Durability", "dur"], ["Delivery", "delivery"]]
    : [["Hit", "hit"], ["Power", "power"], ["Run", "run"], ["Field", "field"], ["Arm", "arm"], ["Approach", "disc"]];
  return `<div class="sp"></div>
    <div class="card">
      <div class="gh"><span class="eyebrow">The board / your read</span>
        <span class="readout"><b class="ofpbig">${r5(p.boardOFP != null ? p.boardOFP : estOFP(p))}</b><i>board</i>
        ${fvReady(p) ? `<b class="ofpbig fv ${arrowOf(p)[3]}">${fvOf(p)}</b><i>your FV</i>`
          : `<em class="arrow ${arrowOf(p)[3]}">${arrowOf(p)[1]}</em>`}</span></div>
      <div class="readnote ${arrowOf(p)[3]}">${fvReady(p)
        ? `Your department will commit to a number: <b>FV ${fvOf(p)}</b>, ${arrowOf(p)[2]}. That's what your people believe — it is not what he is.`
        : `Your reports have him ${arrowOf(p)[2]}. No number yet — coverage ${coverage(p)} of ${fvNeed()}${fvKinds(p) < 2 ? `, and they need at least two different kinds of look` : ``}. Read the file and decide whether he's worth the rest.`}</div>
      ${tools.map(([l, t]) => toolRow(p, l, t)).join("")}
      <div class="hr"></div>
      ${["makeup", "health", "frame"].map((k) => {
        const e = p.est[`${k}_cur`], nm = k === "frame" ? "Projection" : k === "makeup" ? "Makeup" : "Health";
        return `<div class="kv"><span>${nm}</span><b class="${e ? wordFor(k, e.m)[1] : "unk"}">${e ? wordFor(k, e.m)[0] : "not looked into"}</b></div>`;
      }).join("")}
    </div>
    ${p.reports.length ? [...p.reports].reverse().map(reportCard).join("")
      : `<div class="card note">Nothing but the area report on this one.</div>`}`;
}

function viewDraftDone() {
  const taken = S.draft.picks.filter((p) => p.pid);
  const hasIntl = S.upgrades.intl > 0 && S.intlProspects.length;
  return `<div class="wrap">
    <div class="eyebrow">Draft day ${S.year}</div><h2>Your class</h2>
    <div class="card statrow">
      <div class="stat"><span>Drafted</span><b>${taken.length}</b></div>
      <div class="stat"><span>Committed</span><b class="amb">${money(committed(S))}</b></div>
      <div class="stat"><span>Pool left</span><b>${money(poolLeft())}</b></div>
    </div>
    ${taken.map((pk) => { const p = S.prospects.find((x) => x.id === pk.pid);
      return `<div class="card row"><div class="rowtop">
        <div class="proj"><b>#${pk.overall}</b><span>pick</span></div>
        <div class="flex mn"><div class="nm">${p.name}</div><div class="dim sm">${p.pos} · ${moneyK(pk.bonus)} vs ${moneyK(pk.slot)} slot</div></div>
        <div class="ofp">${fvReady(p) ? `<b class="fv ${arrowOf(p)[3]}">${fvOf(p)}</b><span>your FV</span>` : `<b class="arrow ${arrowOf(p)[3]}">${arrowOf(p)[1]}</b><span>your read</span>`}</div></div></div>`; }).join("")}
    <div class="sp"></div>
    ${hasIntl ? `<button class="btn pri" data-a="tointl">On to international signings</button>`
      : `<button class="btn pri" data-a="resolve">Sign them and fast-forward six years</button>`}
  </div>`;
}

/* ---------- international ---------- */
function viewIntl() {
  const left = Math.round((intlPoolTotal(S) - intlCommitted(S)) * 100) / 100;
  return `<div class="wrap">
    <div class="eyebrow">International amateurs</div><h2>${S.year} signing period</h2>
    <div class="dim sm mb">A separate pool, outside the draft. Sixteen-year-olds: the widest gaps between what a body might become and what it is.</div>
    <div class="card statrow">
      <div class="stat"><span>Intl pool</span><b class="amb">${money(intlPoolTotal(S))}</b></div>
      <div class="stat"><span>Left</span><b>${money(left)}</b></div>
    </div>
    ${[...S.intlProspects].sort((a, b) => estOFP(b) - estOFP(a)).map((p) => {
      const off = S.intlOffers[p.id] || 0, pr = priceRead(p);
      return `<div class="card row">
        <button class="rowtop full" data-a="open" data-id="${p.id}">
          <div class="flex mn"><div class="nm">${p.name}</div>
            <div class="dim sm mn">${p.pos} · age ${p.age} · ${p.school} · ${p.looks ? p.looks + " looks" : "area only"}</div></div>
          <div class="ofp">${fvReady(p) ? `<b class="fv ${arrowOf(p)[3]}">${fvOf(p)}</b><span>your FV</span>` : `<b class="arrow ${arrowOf(p)[3]}">${arrowOf(p)[1]}</b><span>your read</span>`}</div>
        </button>
        <div class="rowbot"><span class="xs ${p.askKnown ? "amb" : "dim"}">${p.askKnown ? "asks " + moneyK(pr.lo) + "–" + moneyK(pr.hi) : "market " + moneyK(pr.lo) + "–" + moneyK(pr.hi)}</span>
          <span class="xs">${off ? `<b class="amb">offer ${moneyK(off)}</b>` : ""}</span></div>
        <div class="grid4 mt8">${[-0.5, -0.1, 0.1, 0.5].map((d) =>
          `<button class="step" data-a="ioff" data-id="${p.id}" data-d="${d}">${d > 0 ? "+" : "−"}${Math.abs(d) >= 0.5 ? "500K" : "100K"}</button>`).join("")}</div>
      </div>`;
    }).join("")}
    <div class="sp"></div>
    <button class="btn pri" data-a="resolve">Sign them and fast-forward six years</button>
  </div>`;
}

/* ============================================================
   RESOLUTION
   ============================================================ */
function resolve() {
  const signed = [], missed = [];
  for (const pk of S.draft.picks) {
    if (!pk.pid) continue;
    const p = S.prospects.find((x) => x.id === pk.pid);
    if (rnd() < signChance(pk.bonus / p.ask, S.upgrades.agents)) {
      signed.push({ p, bonus: pk.bonus, pick: pk.overall, slot: pk.slot });
      S.farm.push(initRecord(p, pk.bonus, pk.overall, pk.slot, S.year, S.upgrades, false));
    } else missed.push({ p, off: pk.bonus, pick: pk.overall });
  }
  for (const p of S.intlProspects) {
    const off = S.intlOffers[p.id] || 0;
    if (off <= 0) continue;
    if (rnd() < signChance(off / p.ask, S.upgrades.agents)) {
      signed.push({ p, bonus: off, pick: null, slot: 0 });
      S.farm.push(initRecord(p, off, null, 0, S.year, S.upgrades, false));
    } else missed.push({ p, off, pick: null });
  }
  // The ones you looked at and didn't take keep playing somewhere else.
  const mine = new Set(signed.map((x) => x.p.id));
  S.prospects.filter((p) => !mine.has(p.id) && p.looks > 0)
    .sort((a, b) => estOFP(b) - estOFP(a)).slice(0, 5)
    .slice(0, 4).forEach((p) => S.shadow.push(initRecord(p, Math.max(0.1, p.ask), null, 0, S.year, S.upgrades, true)));

  const spent = Math.round(signed.reduce((a, x) => a + x.bonus, 0) * 10) / 10;
  const mandateMet = checkSigningMandate(S, signed);
  const mandateBonus = mandateMet && S.mandate ? S.mandate.reward : 0;
  if (!mandateMet && S.mandate && S.mandate.pending) {
    S.pending.push({ ...S.mandate, year: S.year, expires: S.year + 6, signedIds: signed.map((x) => x.p.id), firstPick: signed.filter((x) => x.pick).sort((a, b) => a.pick - b.pick)[0] });
  }
  S.budget = Math.round((S.budget + mandateBonus) * 10) / 10;
  S.mandatesMet = (S.mandatesMet || 0) + (mandateMet ? 1 : 0);
  S.mandatesTotal = (S.mandatesTotal || 0) + 1;
  S.signedTotal = (S.signedTotal || 0) + signed.length;
  // the draft is over; the pool and the clubs' private boards are dead weight
  S.pool = [];
  if (S.clubs) S.clubs.forEach((c) => { delete c.board; });
  if (S.draft) { S.draft.log = (S.draft.log || []).slice(0, 60); delete S.draft.lastGone; }
  S.bonusPaid = Math.round(((S.bonusPaid || 0) + spent) * 10) / 10;
  S.signingReport = { year: S.year, signed, missed, spent, mandate: S.mandate, mandateMet, mandateBonus };
  advanceSeason(spent);
}

/* ---------- one year passes ---------- */
function advanceSeason(bonusesPaid) {
  const events = [], closedNow = [], debuts = [], graduated = [];
  let mlbWAR = 0, seasonSurplus = -(bonusesPaid || 0);

  for (const rec of S.farm) {
    const wasMLB = rec.st.mlbYears > 0;
    const r = stepSeason(rec, S.upgrades, S.year);
    if (!r) continue;
    seasonSurplus += r.season.surplus;
    if (r.season.level === "MLB") {
      mlbWAR += r.season.war || 0;
      if (!wasMLB) debuts.push(rec);
    }
    events.push({ rec, season: r.season });
    if (r.closed) closedNow.push(rec);
  }
  for (const rec of S.shadow) stepSeason(rec, S.upgrades, S.year);

  // players who came back in trades are on the big league roster
  const vetLines = [];
  for (const v of (S.acquired || [])) {
    const r = stepReturnPlayer(v, S.year);
    if (!r) continue;
    mlbWAR += r.war;
    seasonSurplus += r.surplus;
    vetLines.push({ v, season: r });
  }
  // A club out of the race sells. Those prospects land in your system.
  const sold = [];
  for (const v of (S.acquired || [])) {
    if (v.done || v.yearsLeft > 2) continue;
    const outOfIt = S.wins < 82;
    if (outOfIt && rnd() < 0.34) {
      const deal = sellVeteran(v, S.year, S.upgrades, S.wins);
      deal.got.forEach((r) => S.farm.push(r));
      sold.push(deal);
      v.done = true; v.soldOn = true;
    }
  }
  const vetGone = (S.acquired || []).filter((v) => v.done && !v.soldOn);
  S.acquired = (S.acquired || []).filter((v) => !v.done);
  S.soldTotal = (S.soldTotal || 0) + sold.length;
  vetGone.forEach((v) => {
    S.lifetimeSurplus = Math.round((S.lifetimeSurplus + 0) * 10) / 10;   // already booked yearly
  });

  ageRivals(S);
  driftMarket(S.market);
  dedupeNames(S);

  // close the books on anyone whose time is up
  for (const rec of closedNow) {
    if (rec.st.outcome === "traded" && rec.st.trade && rec.st.trade.got) {
      S.acquired = (S.acquired || []).concat([rec.st.trade.got]);
    }
    if (rec.st.outcome === "traded") {
      const cont = { p: rec.p, bonus: 0, pick: null, slot: 0, signedYear: rec.signedYear, shadow: true,
        wasTraded: { ret: rec.st.trade.ret, year: S.year, stance: rec.st.trade.stance, warForYou: rec.st.warTotal } };
      cont.st = JSON.parse(JSON.stringify(rec.st));
      cont.st.done = false; cont.st.outcome = null; cont.st.trade = null;
      cont.st.seasons = []; cont.st.warTotal = 0; cont.st.honors = [];
      S.shadow.push(cont);
    }
    const res = closeRecord(rec);
    let fvGap = null;
    try {
      const gk = rec.p.isP ? ["fb", "brk", "ch", "cmd"] : ["hit", "power", "run", "field", "arm"];
      const w = rec.p.isP ? [0.32, 0.24, 0.14, 0.30] : [0.40, 0.26, 0.09, 0.16, 0.09];
      const said = gk.reduce((a, k, i) => a + w[i] * getEst(rec.p, `${k}_fut`).m, 0);
      const became = gk.reduce((a, k, i) => a + w[i] * res.finalGrades[k], 0);
      fvGap = Math.abs(r5(said) - r5(became));
    } catch (e) {}
    S.closed.push({ p: rec.p, bonus: rec.bonus, pick: rec.pick, slot: rec.slot, signedYear: rec.signedYear, res, fvGap });
    S.lifetimeSurplus = Math.round((S.lifetimeSurplus + res.surplus) * 10) / 10;
    if (res.reachedMLB) S.mlbTotal = (S.mlbTotal || 0) + 1;
    if (!S.best || res.surplus > S.best.surplus)
      S.best = { name: rec.p.name, pos: rec.p.pos, year: rec.signedYear, pick: rec.pick,
        bonus: rec.bonus, surplus: res.surplus, war: res.totalWAR, verdict: res.verdict };
    for (const h of res.honors) { S.hon = S.hon || {}; S.hon[h] = (S.hon[h] || 0) + 1; }
    if (res.outcome === "control-complete") graduated.push(rec);
    const hp = hofChance(res);
    if (hp > 0 && rnd() < hp)
      S.pendingHOF.push({ name: rec.p.name, pos: rec.p.pos, signedYear: rec.signedYear,
        pick: rec.pick, war: res.totalWAR, honors: res.honorList, year: S.year + ri(6, 11) });
  }
  S.farm = S.farm.filter((r) => !r.st.done);
  if (S.closed.length > 6) for (let i = 0; i < S.closed.length - 6; i++) {
    const c = S.closed[i];
    if (c.res.years && c.res.years.length) { c.res.seasonsPlayed = c.res.years.length; c.res.years = []; c.res.notes = []; }
    if (c.p && c.p.est) { c.p = { id: c.p.id, name: c.p.name, pos: c.p.pos, isP: c.p.isP, origin: c.p.origin, level: c.p.level, archName: c.p.archName, makeup: c.p.makeup, health: c.p.health, fut: c.p.fut, consensus: c.p.consensus, isIntl: c.p.isIntl }; }
  }
  if (S.shadow.length > 22) S.shadow = S.shadow.slice(-22);
  // seasons already played are the bulk of a live record; keep the last eight
  for (const r of S.farm) if (r.st.seasons.length > 9) r.st.seasons = r.st.seasons.slice(-9);
  for (const r of S.shadow) if (r.st.seasons.length > 2) r.st.seasons = r.st.seasons.slice(-2);

  const shadowClosed = S.shadow.filter((r) => r.st.done);
  S.shadow = S.shadow.filter((r) => !r.st.done);
  const gotAway = shadowClosed.filter((r) => !r.wasTraded).map((rec) => ({ p: rec.p, res: closeRecord(rec) }))
    .filter((x) => x.res.surplus > 45).sort((a, b) => b.res.surplus - a.res.surplus).slice(0, 3);
  // the verdict on every deal, delivered when his career is over and not before
  const epilogues = shadowClosed.filter((r) => r.wasTraded).map((rec) => {
    const after = Math.round(rec.st.warTotal * 10) / 10;
    if (after >= 12) S.soldLow = (S.soldLow || 0) + 1;
    if (after < 2) S.soldHigh = (S.soldHigh || 0) + 1;
    return { name: rec.p.name, pos: rec.p.pos, t: rec.wasTraded, after,
      verdict: after >= 12 ? "low" : after < 2 ? "high" : "fair" };
  });

  // the writers vote, years after he stopped being yours
  const inducted = [];
  S.pendingHOF = (S.pendingHOF || []).filter((h) => {
    if (S.year >= h.year) { inducted.push(h); S.hofList.push(h); S.hon = S.hon || {}; S.hon["Hall of Fame"] = (S.hon["Hall of Fame"] || 0) + 1; return false; }
    return true;
  });

  // long-running ownership briefs
  const paid = [];
  S.pending = (S.pending || []).filter((m) => {
    if (checkPendingMandate(S, m)) { S.budget = Math.round((S.budget + m.reward) * 10) / 10; S.mandatesMet = (S.mandatesMet || 0) + 1; paid.push(m); return false; }
    return S.year < m.expires;
  });

  seasonSurplus = Math.round(seasonSurplus * 10) / 10;
  S.budget = Math.round((S.budget + seasonSurplus) * 10) / 10;
  S.careerWAR = Math.round(((S.careerWAR || 0) + mlbWAR) * 10) / 10;
  S.teamWAR = Math.round((S.teamWAR * 0.55 + mlbWAR) * 10) / 10;
  computeRecord(S);
  S.winsSum = (S.winsSum || 0) + S.wins;
  S.bigSeasons = (S.bigSeasons || 0) + (S.wins >= 90 ? 1 : 0);

  // October
  let postseason = null, postMoney = 0;
  // October is scarcer, and how far you go depends heavily on how good you are.
  // Flat title odds meant an 88-win club and a 100-win club were nearly the
  // same, so there was never a reason to push.
  const pOdds = clamp((S.wins - 82) / 16, 0, 0.94);
  if (rnd() < pOdds) {
    S.playoffs = (S.playoffs || 0) + 1;
    const won = rnd() < clamp(0.045 + Math.max(0, S.wins - 84) / 105, 0.03, 0.34);
    // Ownership shares the gate. This is why buying wins is a strategy and not
    // simply a way to burn surplus.
    if (won) {
      S.titles = (S.titles || 0) + 1; postseason = "title";
      postMoney = 155; S.postMoneyTotal = (S.postMoneyTotal || 0) + 155;
    } else {
      postseason = "berth";
      postMoney = 55; S.postMoneyTotal = (S.postMoneyTotal || 0) + 55;
    }
    seasonSurplus += postMoney;
  }

  computeDraftPos(S, postseason);

  const grade = seasonSurplus >= 120 ? "A+" : seasonSurplus >= 80 ? "A" : seasonSurplus >= 45 ? "B+"
    : seasonSurplus >= 20 ? "B" : seasonSurplus >= 5 ? "C+" : seasonSurplus >= -5 ? "C" : seasonSurplus >= -20 ? "D" : "F";

  const unlocked = checkAchievements({ events, trades: closedNow.map((r) => r.st.trade).filter(Boolean),
    closedRecs: S.closed.slice(-closedNow.length), allPicksSigned: S.draft &&
      S.draft.picks.filter((pk) => pk.pid).length === S.draft.picks.length && S.draft.picks.length >= 8 });
  S.seasonReport = { year: S.year, events, postseason, postMoney, sold, unlocked, inducted, epilogues, vetLines, vetGone, closed: S.closed.slice(-closedNow.length || 0).slice(0, 99),
    closedRecs: closedNow.map((rec) => S.closed[S.closed.length - closedNow.length + closedNow.indexOf(rec)]),
    debuts: debuts.map((r) => r.p.name), graduated: graduated.map((r) => r.p.name),
    gotAway, mlbWAR: Math.round(mlbWAR * 10) / 10, seasonSurplus, grade, paid,
    signing: S.signingReport, wins: S.wins, losses: S.losses };
  S.history.push({ year: S.year, pos: S.draftPos, surplus: seasonSurplus, grade,
    signedCount: S.signingReport ? S.signingReport.signed.length : 0, wins: S.wins,
    best: S.signingReport && S.signingReport.signed.length ? S.signingReport.signed[0].p.name : "—" });

  S.phase = S.history.length >= SEASONS ? "career-over" : "offseason";
  pushRollback(META.activeSlot, S);
  if (S.phase === "career-over" && !S.archived) {
    S.archived = true;
    archiveCareer(S, careerTier(legacyScore(S))[1]);
  }
  UI.screen = "season"; UI.expand = {}; save(); render();
}

function nextYear() {
  if (S.phase === "career-over") { UI.screen = "career"; return render(); }
  S.year += 1;
  openClass(S);
  S.seasonReport = null; S.signingReport = null;
  S.phase = "scouting";
  UI.screen = "class"; UI.sel = null; UI.pickSel = null; UI.filter = "all"; save(); render();
}

const CAREER_TIERS = [
  [9000, "Hall of Fame", "They name the complex after you. Thirty years of finding people nobody else saw."],
  [7600, "Legendary", "One of the great scouting directors of the era. Other clubs copied your process."],
  [6200, "Elite", "A long run at the top of the profession. You built a pipeline that never dried up."],
  [5000, "Very good", "Consistently ahead of the board. A few misses, but the hit rate held up for three decades."],
  [3700, "Solid", "A respectable career. You beat the consensus more often than not."],
  [2500, "Adequate", "Roughly what a competent department produces. Some good years, some forgettable ones."],
  [1300, "Underwhelming", "You drafted close to the board and got close-to-board results."],
  [600, "Poor", "The money mostly went out and didn't come back. It's a hard job."],
  [-1e9, "A cautionary tale", "Forty years, very little to show for it. Somewhere there's a file with your name on it."],
];
// A career is not only the money. Ownership remembers October. Judging purely
// on surplus made every win-now decision a self-inflicted wound, which is not
// how the job is actually assessed.
function legacyScore(s) {
  return Math.round((s.lifetimeSurplus || 0)
    + (s.titles || 0) * 420
    + (s.playoffs || 0) * 55
    + ((s.hofList || []).length) * 120);
}
function careerTier(v) { return CAREER_TIERS.find((t) => v >= t[0]); }

function viewCareer() {
  // anyone still waiting on the writers gets resolved so the record is complete
  if (S.pendingHOF && S.pendingHOF.length) {
    S.pendingHOF.forEach((h) => { h.posthumous = true; S.hofList.push(h); S.hon = S.hon || {}; S.hon["Hall of Fame"] = (S.hon["Hall of Fame"] || 0) + 1; });
    S.pendingHOF = []; save();
  }
  const [, title, blurb] = careerTier(legacyScore(S));
  const hit = S.signedTotal ? Math.round((S.mlbTotal / S.signedTotal) * 100) : 0;
  const grades = S.history.map((h) => h.grade);
  const gcount = {}; grades.forEach((g) => (gcount[g[0]] = (gcount[g[0]] || 0) + 1));
  return `<div class="wrap res">
    <div class="eyebrow">2026 – ${S.year} · forty seasons</div>
    <h2 class="careertitle">${title}</h2>
    <div class="card"><div class="dim sm" style="line-height:1.6">${blurb}</div></div>
    <div class="card">
      <div class="eyebrow">Lifetime surplus value</div>
      <div class="careerbig ${S.lifetimeSurplus >= 0 ? "good" : "bad"}">${money(S.lifetimeSurplus)}</div>
      <div class="dim xs">Everything your signings produced in team control, minus what they cost.</div>
    </div>
    <div class="grid2">
      <div class="card">
      <div class="eyebrow">How the number was reached</div>
      <div class="kv"><span>Surplus value created</span><b>${money(S.lifetimeSurplus || 0)}</b></div>
      <div class="kv"><span>${S.titles || 0} World Series</span><b class="amb">${money((S.titles || 0) * 420)}</b></div>
      <div class="kv"><span>${S.playoffs || 0} postseason berths</span><b class="amb">${money((S.playoffs || 0) * 55)}</b></div>
      <div class="kv"><span>${(S.hofList || []).length} Hall of Famers</span><b class="amb">${money(((S.hofList || []).length) * 120)}</b></div>
      <div class="hr"></div>
      <div class="kv"><span><b>Career standing</b></span><b class="good">${money(legacyScore(S))}</b></div>
      <div class="dim xs mt8">The job is not only about surplus. Ownership remembers October,
      and so does everybody else.</div>
    </div>
    ${[["Players signed", S.signedTotal || 0], ["Reached the majors", `${S.mlbTotal || 0} (${hit}%)`],
         ["All-Star selections", (S.hon && S.hon["All-Star"]) || 0], ["MVPs / Cy Youngs", ((S.hon && S.hon.MVP) || 0) + ((S.hon && S.hon["Cy Young"]) || 0)],
         ["Rookies of the Year", (S.hon && S.hon["Rookie of the Year"]) || 0], ["Gold Gloves", (S.hon && S.hon["Gold Glove"]) || 0],
         ["Ownership briefs met", `${S.mandatesMet || 0} of ${S.mandatesTotal || 0}`],
         ["Career WAR produced", S.careerWAR || 0], ["Average club record", `${Math.round((S.winsSum || 0) / SEASONS)}–${162 - Math.round((S.winsSum || 0) / SEASONS)}`],
         ["90-win seasons", S.bigSeasons || 0], ["Postseason berths", S.playoffs || 0],
         ["World Series titles", S.titles || 0], ["Hall of Famers", (S.hofList || []).length], ["Achievements", `${Object.keys(S.ach || {}).length} of ${ACHIEVEMENTS.length}`],
         ["Bonus money spent", money(S.bonusPaid || 0)], ["October revenue", money(S.postMoneyTotal || 0)],
         ["Veterans acquired in trades", (S.acquired || []).length + (S.soldTotal || 0)], ["Still in the system", S.farm.length]
        ].map(([l, v]) => `<div class="card stt"><span>${l}</span><b>${v}</b></div>`).join("")}
    </div>
    ${S.hofList && S.hofList.length ? `<div class="eyebrow mt">Hall of Famers you signed</div>
      <div class="card">${S.hofList.map((h) => `<div class="hrow"><b class="amb">${h.name}</b>
        <span class="dim sm flex">${h.pos} &middot; ${h.signedYear} class${h.pick ? ` &middot; pick #${h.pick}` : ""} &middot; ${h.war} WAR for you${h.posthumous ? " &middot; elected after you retired" : ` &middot; elected ${h.year}`}</span></div>`).join("")}</div>` : ""}
    ${S.best ? `<div class="card">
      <div class="eyebrow">The best player you ever signed</div>
      <div class="nm" style="font-size:22px">${S.best.name}</div>
      <div class="dim sm">${S.best.pos} · ${S.best.year} class${S.best.pick ? ` · pick #${S.best.pick}` : " · intl FA"} · signed ${moneyK(S.best.bonus)}</div>
      <div class="amb sm mt8">${S.best.verdict}</div>
      <div class="dim sm">${S.best.war} WAR in six years · ${money(S.best.surplus)} of surplus on his own</div>
    </div>` : ""}
    ${S.ach && Object.keys(S.ach).length ? `<div class="eyebrow mt">Achievements</div>
      <div class="card">${ACHIEVEMENTS.filter((a) => S.ach[a.k]).map((a) =>
        `<div class="achrow got"><b>${a.n}</b><span>${a.d}</span><i>${S.ach[a.k]}</i></div>`).join("")}</div>` : ""}
    <div class="eyebrow mt">Every class</div>
    <div class="card">${S.history.map((h) =>
      `<div class="hrow"><b>${h.year}</b><span class="grade ${(h.grade || "C")[0]}">${h.grade}</span>
        <span class="dim sm flex">pick #${h.pos ?? "?"} · ${h.signedCount ?? 0} signed</span>
        <b class="${(h.surplus || 0) >= 0 ? "good" : "bad"}">${(h.surplus || 0) >= 0 ? "+" : ""}${money(h.surplus || 0)}</b></div>`).join("")}</div>
    <div class="sp"></div>
    ${UI.armed === "restart"
      ? `<div class="card warn">Start over from 2026? This career will be erased.</div>
         <button class="btn" data-a="disarm">Not yet</button><div class="sp"></div>
         <button class="btn pri" data-a="restart">Start a new career</button>`
      : `<button class="btn pri" data-a="arm" data-k="restart">Start a new career</button>`}
  </div>`;
}

function viewSeason() {
  const R = S.seasonReport;
  if (!R) return `<div class="wrap"><div class="dim">No season yet.</div></div>`;
  const sg = R.signing;
  const active = R.events.filter((e) => !S.closed.some((c) => c.p.id === e.rec.p.id));
  const byLevel = {};
  for (const e of R.events) (byLevel[e.season.level] = byLevel[e.season.level] || []).push(e);
  const order = ["MLB", "Triple-A", "Double-A", "High-A", "Low-A", "Complex"];
  const gradeCol = R.grade[0];
  return `<div class="wrap res">
    <div class="eyebrow">The ${R.year} season</div>
    <h2>${R.wins}–${R.losses}</h2>
    <div class="card gradecard">
      <div class="gbig ${gradeCol}">${R.grade}</div>
      <div><div class="big ${R.seasonSurplus >= 0 ? "good" : "bad"}">${R.seasonSurplus >= 0 ? "+" : ""}${money(R.seasonSurplus)}</div>
      <div class="dim sm">surplus earned this year · ${R.mlbWAR} WAR from your people in the majors</div></div>
    </div>
    ${R.postseason === "title" ? `<div class="card evt good"><div class="eyebrow">October</div>
      <div class="big good">World Series champions</div>
      <div class="dim sm">Your people are a large part of why. Ownership credits the department
      <b class="good">${money(R.postMoney)}</b> out of the postseason gate.</div></div>`
      : R.postseason === "berth" ? `<div class="card evt good"><div class="eyebrow">October</div>
      <div class="sm">Reached the postseason. <b class="good">${money(R.postMoney)}</b> back to the department
      out of the gate.</div></div>` : ""}
    ${R.sold && R.sold.length ? R.sold.map((d) => `<div class="card evt"><div class="eyebrow">Sold at the deadline</div>
      <div class="sm">${d.name} went out for ${d.got.length} prospect${d.got.length === 1 ? "" : "s"} —
      ${d.got.map((r) => `<b>${r.p.name}</b> (${r.pos || r.p.pos}, ${LEVELS[r.st.li]})`).join(", ")}.</div>
      <div class="dim sm mt4">They are in your system now. What they become is your problem.</div></div>`).join("") : ""}
    ${R.inducted && R.inducted.length ? R.inducted.map((h) => `<div class="card hof">
      <div class="eyebrow">Baseball Hall of Fame</div>
      <div class="big amb">${h.name}</div>
      <div class="dim sm">${h.pos} &middot; you signed him in ${h.signedYear}${h.pick ? ` with pick #${h.pick}` : " as an international free agent"}.
      ${h.war} WAR in the six years he was yours${h.honors && h.honors.length ? ` &middot; ${h.honors.join(", ")}` : ""}.</div>
      <div class="sm amb mt4">Elected to the Hall of Fame.</div></div>`).join("") : ""}
    ${R.unlocked && R.unlocked.length ? `<div class="card evt good"><div class="eyebrow">Unlocked</div>
      ${R.unlocked.filter(Boolean).map((a) => `<div class="sm"><b class="amb">${a.n}</b> — ${a.d}</div>`).join("")}</div>` : ""}
    ${sg ? `<div class="card"><div class="eyebrow">${R.year} signings</div>
      <div class="sm dim">${sg.signed.length} signed for ${money(sg.spent)}${sg.missed.length ? ` · ${sg.missed.length} didn't sign` : ""}</div>
      ${sg.mandate ? `<div class="sm mt4 ${sg.mandateMet ? "good" : "dim"}">${sg.mandateMet
        ? `Ownership's brief delivered — ${money(sg.mandateBonus)} added.`
        : (sg.mandate.pending ? `Ownership's brief is still open: ${sg.mandate.text}` : `Ownership's brief not delivered.`)}</div>` : ""}
      </div>` : ""}
    ${R.paid && R.paid.length ? R.paid.map((m) => `<div class="card evt good"><div class="eyebrow">Brief satisfied</div>
      <div class="sm">${m.text}</div><div class="sm good mt4">${money(m.reward)} added, ${S.year - m.year} years after you were given it.</div></div>`).join("") : ""}
    ${R.debuts.length ? `<div class="card evt good"><div class="eyebrow">Big league debuts</div><div class="sm">${R.debuts.join(", ")}</div></div>` : ""}
    ${R.closedRecs && R.closedRecs.length ? `<div class="eyebrow mt">Out of your hands</div>
      ${R.closedRecs.filter(Boolean).map((c) => closedCard(c)).join("")}` : ""}
    ${R.epilogues && R.epilogues.length ? `<div class="eyebrow mt">The deals, settled</div>
      ${R.epilogues.map((e) => `<div class="card ${e.verdict === "high" ? "evt good" : e.verdict === "low" ? "evt" : ""}">
        <div class="rowtop"><div class="flex mn"><div class="nm">${e.name}</div>
          <div class="dim sm">${e.pos} · traded ${e.t.year} for ${money(e.t.ret)}${e.t.stance === "shop" ? " · you had him on the block" : e.t.stance === "keep" ? " · you'd told them he was untouchable" : ""}</div></div>
          <div class="ofp"><b class="${e.verdict === "high" ? "good" : e.verdict === "low" ? "bad" : "dim"}">${e.after}</b><span>WAR after</span></div></div>
        <div class="sm ${e.verdict === "high" ? "good" : e.verdict === "low" ? "bad" : "dim"}">${e.verdict === "high"
          ? "He did nothing after the deal. You sold at exactly the right time."
          : e.verdict === "low" ? "He became a good big leaguer somewhere else. That one cost you."
          : "About what the return was worth. A fair deal."}</div></div>`).join("")}` : ""}
    ${R.gotAway.length ? `<div class="eyebrow mt">The ones that got away</div>
      ${R.gotAway.map(({ p, res }) => `<div class="card ghostcard"><div class="rowtop">
        <div class="flex mn"><div class="nm">${p.name}</div>
        <div class="dim sm">${p.pos} · you scouted him in ${p.rank ? R.year : ""} and passed · ${res.totalWAR} WAR elsewhere</div></div>
        <div class="ofp"><b class="bad">${money(res.surplus)}</b><span>surplus</span></div></div>
        <div class="sm bad">${res.verdict}</div></div>`).join("")}` : ""}
    ${R.vetLines && R.vetLines.length ? `<div class="eyebrow mt">Acquired in trades</div>
      <div class="card">${R.vetLines.map(({ v, season }) => `<div class="fline">
        <span class="fn">${v.name}</span><span class="fp dim">${v.pos}</span>
        <span class="fs">${season.line} &middot; ${money(v.salary)} salary</span>
        <span class="wr ${season.war >= 2 ? "good" : ""}">${season.war.toFixed(1)}</span>
        <div class="xs finj ${season.surplus >= 0 ? "dim" : "bad"}">${season.surplus >= 0 ? "+" : ""}${money(season.surplus)} surplus &middot; ${v.yearsLeft} year${v.yearsLeft === 1 ? "" : "s"} left &middot; came back for ${v.from}</div>
      </div>`).join("")}
      <div class="dim xs mt8">A paid veteran earns close to what he is worth, so the surplus is thin.
      What he buys you is wins.</div></div>` : ""}
    ${R.vetGone && R.vetGone.length ? `<div class="card evt"><div class="eyebrow">Contracts expired</div>
      ${R.vetGone.map((v) => `<div class="sm">${v.name} &mdash; ${v.warTotal} WAR over ${v.seasons.length} season${v.seasons.length === 1 ? "" : "s"}, ${v.surplus >= 0 ? "+" : ""}${money(v.surplus)} surplus. Acquired for ${v.from}.</div>`).join("")}</div>` : ""}
    <div class="eyebrow mt">Your system, ${R.year}</div>
    ${order.filter((l) => byLevel[l]).map((l) => `<div class="card">
      <div class="eyebrow">${l}</div>
      ${byLevel[l].sort((a, b) => (b.season.war || 0) - (a.season.war || 0)).map((e) => `<div class="fline">
        <span class="fn">${e.rec.p.name}</span><span class="fp dim">${e.rec.pos || e.rec.p.pos}</span>
        <span class="fs">${e.season.line}</span>
        ${e.season.war != null ? `<span class="wr ${e.season.war >= 2 ? "good" : ""}">${e.season.war.toFixed(1)}</span>` : ""}
        ${e.season.injNote ? `<div class="bad xs finj">${e.season.injNote} — ${e.season.missed} days</div>` : ""}
        ${e.season.awards.length ? `<div class="xs amb finj">${e.season.awards.join(" &middot; ")}</div>` : ""}
        ${e.season.posMove ? `<div class="xs finj ${e.season.posMove.up ? "good" : "amb"}">${e.season.posMove.up ? "Moved up to" : "Moved off " + e.season.posMove.from + " to"} ${e.season.posMove.to}</div>` : ""}
        ${e.season.jumped === 2 ? `<div class="xs finj good">Skipped a level</div>` : ""}
        ${e.season.repeated >= 3 ? `<div class="xs finj bad">${ordinal(e.season.repeated)} year at this level</div>` : e.season.repeated === 2 ? `<div class="xs finj dim">Repeating the level</div>` : ""}
      </div>`).join("")}</div>`).join("")}
    <div class="sp"></div>
    <button class="btn pri" data-a="tab" data-k="office">${S.phase === "career-over" ? "See how your career went" : "To the front office"}</button>
  </div>`;
}

function closedCard(c) {
  const open = UI.expand[c.p.id];
  const res = c.res;
  const truth = c.p.isP ? [["Fastball", "fb"], ["Breaking", "brk"], ["Change", "ch"], ["Command", "cmd"]]
    : [["Hit", "hit"], ["Power", "power"], ["Run", "run"], ["Field", "field"], ["Arm", "arm"]];
  return `<div class="card">
    <button class="full" data-a="exp" data-id="${c.p.id}">
      <div class="rowtop"><div class="flex mn"><div class="nm">${c.p.name}</div>
        <div class="dim sm">${c.p.pos} · ${c.signedYear} class · ${c.pick ? "pick #" + c.pick : "intl FA"} · ${moneyK(c.bonus)}</div>
        <div class="rolechip">${res.trade ? `Traded at ${res.trade.age}` : res.role}${res.injuryDays >= 130 ? ` · ${res.injuryDays} days lost` : ""}</div></div>
        <div class="ofp"><b class="${res.surplus >= 0 ? "good" : "bad"}">${res.surplus >= 0 ? "+" : ""}${money(res.surplus)}</b><span>${open ? "HIDE" : "FINAL"}</span></div></div>
      <div class="verdict">${res.verdict}</div>
      ${res.honorList.length ? `<div class="honors">${res.honorList.map((h) => `<span>${h}</span>`).join("")}</div>` : ""}</button>
    ${open ? careerDetail(c.p, c.bonus, res, truth) : ""}</div>`;
}

function viewArchive() {
  return `<div class="wrap">
    <button class="back" data-a="tab" data-k="title">← Back</button>
    <div class="eyebrow">The record book</div><h2>Past careers</h2>
    ${ARCHIVE.length ? [...ARCHIVE].reverse().map((c) => `<div class="card">
      <div class="rowtop"><div class="flex mn">
        <div class="nm">${c.title}</div>
        <div class="dim sm">retired ${c.ended} &middot; ${c.signed} signed, ${c.mlb} reached the majors</div>
      </div><div class="ofp"><b class="good">${money(c.surplus)}</b><span>lifetime</span></div></div>
      <div class="dim sm mt8">${c.war} WAR &middot; ${c.titles} World Series &middot; ${c.playoffs} postseasons
        &middot; ${c.allStars} All-Star selections &middot; ${c.ach} achievements</div>
      ${c.best ? `<div class="sm amb mt4">Best signing: ${c.best.name} (${c.best.pos}) — ${c.best.war} WAR, ${money(c.best.surplus)}</div>` : ""}
      ${c.hof && c.hof.length ? `<div class="sm mt4">Hall of Famers: ${c.hof.map((h) => h.name).join(", ")}</div>` : ""}
    </div>`).join("") : `<div class="card note">No completed careers yet.</div>`}
  </div>`;
}

/* ---------- everyone you ever signed ---------- */
function viewDatabase() {
  const rows = S.closed.map((c) => ({
    name: c.p.name, pos: c.p.pos, year: c.signedYear, pick: c.pick, bonus: c.bonus,
    war: c.res.totalWAR, surplus: c.res.surplus, verdict: c.res.verdict,
    hon: (c.res.honorList || []).join(", "), live: false,
  })).concat(S.farm.map((r) => ({
    name: r.p.name, pos: r.pos || r.p.pos, year: r.signedYear, pick: r.pick, bonus: r.bonus,
    war: r.st.warTotal, surplus: r.st.surplus, verdict: LEVELS[r.st.li], hon: "", live: true, id: r.p.id,
  })));
  const q = (UI.dbq || "").toLowerCase();
  let list = rows.filter((r) => !q || r.name.toLowerCase().includes(q) || r.pos.toLowerCase() === q);
  const sort = UI.dbsort || "surplus";
  list.sort((a, b) => sort === "surplus" ? b.surplus - a.surplus : sort === "war" ? b.war - a.war
    : sort === "year" ? b.year - a.year : String(a.name).localeCompare(String(b.name)));
  return `<div class="wrap">
    <div class="eyebrow">Every player you have signed</div><h2>The database</h2>
    <div class="card statrow">
      <div class="stat"><span>Signed</span><b>${rows.length}</b></div>
      <div class="stat"><span>In the system</span><b>${S.farm.length}</b></div>
      <div class="stat"><span>Reached MLB</span><b class="amb">${S.mlbTotal || 0}</b></div>
    </div>
    <div class="chips">${[["surplus", "Surplus"], ["war", "WAR"], ["year", "Class"], ["name", "Name"]].map(([k, l]) =>
      `<button class="chip ${sort === k ? "on" : ""}" data-a="dbsort" data-k="${k}">${l}</button>`).join("")}</div>
    ${list.length ? list.slice(0, 120).map((r) => `<div class="card row ${r.live ? "" : "ghostcard"}">
      <div class="rowtop">
        <div class="proj"><b>${r.pick ? "#" + r.pick : "FA"}</b><span>${r.year}</span></div>
        <div class="flex mn">${r.live
          ? `<button class="full" data-a="fplayer" data-id="${r.id}"><div class="nm">${r.name}</div></button>`
          : `<div class="nm">${r.name}</div>`}
          <div class="dim sm mn">${r.pos} &middot; ${moneyK(r.bonus)} &middot; ${r.war} WAR${r.hon ? " &middot; " + r.hon : ""}</div>
          <div class="dim xs">${r.verdict}</div></div>
        <div class="ofp"><b class="${r.surplus >= 0 ? "good" : "bad"}">${r.surplus >= 0 ? "+" : ""}${money(r.surplus)}</b><span>${r.live ? "so far" : "final"}</span></div>
      </div></div>`).join("") : `<div class="card note">Nobody signed yet.</div>`}
    ${list.length > 120 ? `<div class="dim xs">Showing the first 120 of ${list.length}.</div>` : ""}
  </div>`;
}

function viewFarmPlayer() {
  const rec = S.farm.find((r) => r.p.id === UI.farmSel);
  if (!rec) return `<div class="wrap"><button class="btn ghost" data-a="back" data-k="farm">Back to the farm</button></div>`;
  const p = rec.p, st = rec.st;
  const x = rankedFarm().find((y) => y.r.p.id === p.id);
  const lastSeason = st.seasons[st.seasons.length - 1];
  const ovrNow = p.isP ? pitOVR(st.g) : hitOVR(st.g);
  const gk = p.isP ? ["fb", "brk", "ch", "cmd"] : ["hit", "power", "run", "field", "arm"];
  const w = p.isP ? [0.32, 0.24, 0.14, 0.30] : [0.40, 0.26, 0.09, 0.16, 0.09];
  let said = null;
  try { said = r5(gk.reduce((a, k, i) => a + w[i] * getEst(p, `${k}_fut`).m, 0)); } catch (e) {}
  const tools = p.isP
    ? [["Fastball", "fb"], ["Breaking", "brk"], ["Change", "ch"], ["Command", "cmd"], ["Durability", "dur"], ["Delivery", "delivery"]]
    : [["Hit", "hit"], ["Power", "power"], ["Run", "run"], ["Field", "field"], ["Arm", "arm"], ["Approach", "disc"]];
  const honors = summariseHonors(st.honors);
  return `<div class="wrap">
    <button class="back" data-a="back" data-k="farm">← Back to ${UI.fromFarm === "season" ? "the season" : UI.fromFarm === "office" ? "the office" : "the farm"}</button>
    <div class="phead">
      <div class="eyebrow">${x && x.rank ? `#${x.rank} prospect in baseball · ` : ""}${LEVELS[st.li]}</div>
      <h2>${p.name}</h2>
      <div class="dim sm">${rec.pos || p.pos} · age ${Math.floor(st.age)} · ${rec.inherited
        ? `signed in ${rec.signedYear} by the department before you`
        : `signed ${rec.signedYear} for ${moneyK(rec.bonus)}${rec.pick ? ` (pick #${rec.pick}, slot ${moneyK(rec.slot)})` : " as an international FA"}`}</div>
    </div>
    ${honors.length ? `<div class="honors mb">${honors.map((h) => `<span>${h}</span>`).join("")}</div>` : ""}
    <div class="card">
      <div class="eyebrow">What you tell the front office</div>
      <div class="grid3">
        ${[["keep", "Untouchable"], ["none", "No stance"], ["shop", "Available"]].map(([k, l]) =>
          `<button class="stance ${(rec.status || "none") === k ? "on" : ""}" data-a="stance" data-id="${p.id}" data-k="${k}">${l}</button>`).join("")}
      </div>
      <div class="dim xs mt8">${(rec.status || "none") === "shop"
        ? "The GM is shopping him. He'll move far more often, for slightly less — a motivated seller never gets full price."
        : (rec.status || "none") === "keep"
        ? "You've told them not to move him. It would take an overpay, and it will happen anyway once in a while."
        : "No instruction. He'll come up in conversations like anybody else."}</div>
    </div>


    <div class="card statrow">
      <div class="stat"><span>Surplus so far</span><b class="${st.surplus >= 0 ? "good" : "bad"}">${st.surplus >= 0 ? "+" : ""}${money(st.surplus)}</b></div>
      <div class="stat"><span>WAR</span><b>${st.warTotal}</b></div>
      <div class="stat"><span>Control used</span><b>${st.mlbYears}/6</b></div>
    </div>
    <div class="card">
      <div class="eyebrow">What you said, and where he is</div>
      <div class="kv"><span>${rec.inherited ? "Your predecessor's FV" : "Your FV at signing"}</span><b class="amb">${rec.inherited ? "—" : (said != null ? said : "—")}</b></div>
      <div class="kv"><span>Playing like today</span><b>${r5(ovrNow)}</b></div>
      ${said != null ? `<div class="dim sm mt8">${Math.abs(said - r5(ovrNow)) <= 5
        ? "Close to what your department had on him."
        : r5(ovrNow) > said ? "He has passed what you had on him." : "He has not become what you had on him — yet, or at all."}</div>` : ""}
      <div class="hr"></div>
      ${tools.map(([l, t]) => `<div class="tool"><span class="tl">${l}</span>
        <span class="bg2">${r5(st.g[t])}</span>
        <div class="conf"><i style="width:${clamp(((st.g[t] - 20) / 60) * 100, 0, 100)}%"></i></div>
        <span class="arrow ${st.ceil[t] > st.g[t] + 4 ? "up1" : "flat"}">${st.ceil[t] > st.g[t] + 4 ? "\u25b2" : "\u2014"}</span></div>`).join("")}
      <div class="dim xs mt8">These are the grades your development staff has on him now — they see him every day, so this is the truth, not a scouting read.</div>
    </div>
    <div class="card">
      <div class="eyebrow">The market against your own eyes</div>
      <div class="kv"><span>Industry has him</span><b class="amb">${x && x.rank ? `#${x.rank} in baseball` : "unranked"}</b></div>
      <div class="kv"><span>Your staff sees</span><b>${r5(ovrNow)} now, ${r5(p.isP ? pitOVR(st.ceil) : hitOVR(st.ceil))} ceiling</b></div>
      ${S.upgrades.proscout >= 1 && lastSeason ? `<div class="kv"><span>Worth in trade</span><b class="amb">${money(lastSeason.mktValue || 0)}</b></div>` : ""}
      ${S.upgrades.proscout >= 2 ? `<div class="kv"><span>Industry vs your staff</span><b class="${st.pubOvr - ovrNow >= 3 ? "amb" : st.pubOvr - ovrNow <= -3 ? "good" : ""}">${
        (st.pubOvr - ovrNow) >= 0 ? "+" : ""}${(st.pubOvr - ovrNow).toFixed(1)} in his favour</b></div>` : ""}
      ${(() => {
        const gap = st.pubOvr - ovrNow;
        return `<div class="sm mt8 ${gap >= 4 ? "amb" : gap <= -4 ? "good" : "dim"}">${gap >= 4
          ? "The industry is higher on him than your own people are. If he is going to be moved, he should be moved now."
          : gap <= -4 ? "Your staff likes him more than the industry does. Selling now would be selling cheap."
          : "The market and your staff see roughly the same player."}</div>`;
      })()}
    </div>

    <div class="eyebrow">Season by season</div>
    <div class="card">${st.seasons.map((y) => `<div class="yr2">
      <span class="ag">${y.age}</span><span class="lv ${y.level === "MLB" ? "amb" : "dim"}">${y.level}</span>
      <span class="flex sm">${y.line}${y.injNote ? `<div class="bad xs">${y.injNote} — ${y.missed} days</div>` : ""}</span>
      ${y.war != null ? `<span class="wr ${y.war >= 2 ? "good" : ""}">${y.war.toFixed(1)}</span>` : ""}
      ${y.awards && y.awards.length ? `<div class="yraw">${y.awards.join(" &middot; ")}</div>` : ""}
      ${y.posMove ? `<div class="yraw">${y.posMove.up ? "Moved up to " + y.posMove.to : "Moved off " + y.posMove.from + " to " + y.posMove.to}</div>` : ""}
      ${y.jumped === 2 ? `<div class="yraw">Skipped a level</div>` : y.repeated >= 3 ? `<div class="yraw dim">${ordinal(y.repeated)} year at the level</div>` : y.repeated === 2 ? `<div class="yraw dim">Repeated the level</div>` : ""}</div>`).join("")}</div>
  </div>`;
}

/* ---------- the farm ---------- */
function viewFarm() {
  const ranked = rankedFarm();
  const top = ranked.filter((x) => x.rank && x.rank <= 100);
  const order = ["MLB", "Triple-A", "Double-A", "High-A", "Low-A", "Complex"];
  const byLevel = {};
  for (const x of ranked) {
    const lv = LEVELS[x.r.st.li];
    (byLevel[lv] = byLevel[lv] || []).push(x);
  }
  return `<div class="wrap">
    <div class="eyebrow">Player development</div><h2>Your farm system</h2>
    ${(() => {
      const shop = S.farm.filter((r) => r.status === "shop"), keep = S.farm.filter((r) => r.status === "keep");
      return `<div class="card note"><b>Telling the front office what you think. </b>
        Tap any player's stance to cycle it. The GM makes the trades, but he listens — a player you mark
        available moves far more often, one you call untouchable almost never does, and a genuine star is
        hard to prise loose whatever you say.
        ${shop.length || keep.length ? `<div class="sm mt8">On the block: <b class="amb">${shop.length ? shop.map((r) => r.p.name).join(", ") : "nobody"}</b>${keep.length ? ` &middot; untouchable: <b class="good">${keep.map((r) => r.p.name).join(", ")}</b>` : ""}</div>` : ""}
      </div>`;
    })()}
    <div class="card statrow">
      <div class="stat"><span>In system</span><b>${S.farm.length}</b></div>
      <div class="stat"><span>Top 100</span><b class="amb">${top.length}</b></div>
      <div class="stat"><span>Graduated</span><b>${S.closed.filter((c) => c.res.reachedMLB).length}</b></div>
    </div>
    <div class="card">
      <div class="eyebrow">Top 100 prospects in baseball ${UI.fullTop ? "" : "&mdash; leaders"}</div>
      ${(() => {
        const board = mergedBoard().slice(0, 100);
        const shown = UI.fullTop ? board : board.filter((x, i) => i < 12 || x.mine);
        return shown.map((x) => x.mine
          ? `<button class="hrow mineRow" data-a="fplayer" data-id="${x.r.p.id}"><b class="amb">#${x.rank}</b>
              <span class="sm flex"><b>${x.r.p.name}</b>, ${x.r.pos || x.r.p.pos} — ${LEVELS[x.r.st.li]}, age ${Math.floor(x.r.st.age)} <em class="yours">YOURS</em></span></button>`
          : `<div class="hrow"><b class="dim">#${x.rank}</b>
              <span class="dim sm flex">${x.riv.name}, ${x.riv.pos} — ${x.riv.org}, age ${x.riv.age}</span></div>`).join("");
      })()}
      <div class="sp"></div>
      <button class="btn ghost" data-a="fulltop">${UI.fullTop ? "Show leaders only" : "Show the whole list"}</button>
      <div class="dim xs mt8">${top.length
        ? `You hold ${top.length} of the top 100. This is the industry's ranking, not yours — it moves as they perform.`
        : `Nobody in your system is currently regarded as a top-100 prospect.`}</div>
    </div>
    ${order.filter((l) => byLevel[l]).map((l) => `<div class="eyebrow mt">${l}</div>
      ${byLevel[l].map((x) => { const r = x.r, last = r.st.seasons[r.st.seasons.length - 1];
        return `<button class="card row" data-a="fplayer" data-id="${r.p.id}"><div class="rowtop">
          <div class="proj"><b>${x.rank && x.rank <= 400 ? "#" + x.rank : "—"}</b><span>rank</span></div>
          <div class="flex mn"><div class="nm">${r.p.name}</div>
            <div class="dim sm mn">${r.pos || r.p.pos} · age ${Math.floor(r.st.age)} · ${r.inherited ? `signed ${r.signedYear}, before your time` : `${r.signedYear} class · ${moneyK(r.bonus)}`}${r.st.mlbYears ? ` · ${r.st.mlbYears}/6 control` : ""}</div>
            </div>
            <button class="cyc ${r.status || "none"}" data-a="cycle" data-id="${r.p.id}">${
              r.status === "shop" ? "Available" : r.status === "keep" ? "Untouchable" : "No stance"}</button>
          </div>
          ${last ? `<div class="dim sm mt4">${last.year}: ${last.line}${last.war != null ? ` · ${last.war.toFixed(1)} WAR` : ""}</div>` : ""}
        </button>`; }).join("")}`).join("")}
    ${S.farm.length === 0 ? `<div class="card note">Nothing in the system yet. Sign a draft class.</div>` : ""}
    ${(S.acquired || []).length ? `<div class="eyebrow mt">On the big club, acquired in trades</div>
      <div class="card">${S.acquired.map((v) => `<div class="hrow">
        <b class="${v.surplus >= 0 ? "good" : "bad"}">${v.surplus >= 0 ? "+" : ""}${money(v.surplus)}</b>
        <span class="dim sm flex">${v.name}, ${v.pos} &mdash; age ${v.age}, ${v.yearsLeft} year${v.yearsLeft === 1 ? "" : "s"} left at ${money(v.salary)} &middot; ${v.warTotal} WAR so far &middot; for ${v.from}</span></div>`).join("")}</div>` : ""}
    ${S.closed.length ? `<div class="eyebrow mt">Alumni — best you've developed</div>
      <div class="card">${[...S.closed].sort((a, b) => b.res.surplus - a.res.surplus).slice(0, 12).map((c) =>
        `<div class="hrow"><b class="${c.res.surplus >= 0 ? "good" : "bad"}">${c.res.surplus >= 0 ? "+" : ""}${money(c.res.surplus)}</b>
          <span class="dim sm flex">${c.p.name}, ${c.p.pos} — ${c.signedYear} class, ${c.res.totalWAR} WAR${c.res.honorList && c.res.honorList.length ? ` · ${c.res.honorList[0]}` : ""}</span></div>`).join("")}</div>` : ""}
  </div>`;
}

function careerDetail(p, bonus, res, truth) {
  return `<div class="detail">
    <div class="kv"><span>Role</span><b class="amb">${res.role}</b></div>
    ${res.notes && res.notes.length ? `<div class="whybox">${res.notes.map((n) => `<div>${n}</div>`).join("")}</div>` : ""}
    <div class="eyebrow">Where he ended up vs. your grade</div>
    <div class="chipsrow">${truth.map(([l, k]) => {
      const est = r5(getEst(p, `${k}_fut`).m), act = r5(res.finalGrades[k]), off = Math.abs(est - act);
      return `<span class="gchip"><i>${l}</i><b class="${off <= 5 ? "good" : off <= 10 ? "amb" : "bad"}">${act}</b><small>you said ${est}</small></span>`;
    }).join("")}</div>
    <div class="dim sm mb">${res.debutGrades
      ? `Debuted playing like a ${r5(truth.reduce((s, [, k]) => s + res.debutGrades[k], 0) / truth.length)}, finished like a ${r5(truth.reduce((s, [, k]) => s + res.finalGrades[k], 0) / truth.length)}. `
      : ""}Ceiling was around ${r5(truth.reduce((s, [, k]) => s + p.fut[k], 0) / truth.length)}.
      True makeup ${r5(p.makeup)} · health ${r5(p.health)} · profile: ${p.archName}</div>
    ${res.years.map((y) => `<div class="yr2 ${y.afterTrade ? "gone" : ""}"><span class="ag">${y.age}</span><span class="lv ${y.level === "MLB" ? "amb" : "dim"}">${y.level}</span>
      <span class="flex sm">${y.line}${y.injNote ? `<div class="bad xs">${y.injNote} — ${y.missed} days</div>` : ""}</span>
      ${y.war != null ? `<span class="wr ${y.war >= 2 ? "good" : ""}">${y.war.toFixed(1)}</span>` : ""}
      ${y.awards && y.awards.length ? `<div class="yraw">${y.awards.join(" &middot; ")}</div>` : ""}</div>`).join("")}
    <div class="dim sm mt8">${res.trade
      ? `${res.totalWAR} WAR for you × ${money(DOLLARS_PER_WAR)} = ${money(res.value)}, plus ${money(res.trade.ret)} back in the trade` +
        `${res.trade.pkgSize > 1 ? ` (his ${res.trade.share}% share of a ${money(res.trade.dealTotal)} deal)` : ""}.`
      : `${res.totalWAR} WAR × ${money(DOLLARS_PER_WAR)} = ${money(res.value)} produced.`}<br>
      Less ${money(res.totalSalary)} salary, ${money(bonus)} bonus, ${money(res.devCost)} development.<br>
      <b class="${res.surplus >= 0 ? "good" : "bad"}">Net surplus ${money(res.surplus)}.</b></div></div>`;
}

/* ============================================================
   EVENTS
   ============================================================ */
document.addEventListener("click", (ev) => {
  const t = ev.target.closest("[data-a]");
  if (!t) return;
  const a = t.dataset.a, k = t.dataset.k, id = +t.dataset.id;
  if (a === "useslot") {
    META.activeSlot = +k; saveMeta();
    loadSlot(+k).then((d) => {
      if (!d) return toast("That slot is empty.");
      S = d; HAS_SAVE = true;
      if (!S.clubs || !S.clubs.length) S.clubs = seedClubs();
      if (!S.pool) S.pool = [];
      if (!S.market) S.market = rollMarket();
      MARKET = S.market;
      if (!S.rivals || !S.rivals.length) S.rivals = seedRivals(S.year);
      if (!S.hofList) { S.hofList = []; S.pendingHOF = []; }
      UI.screen = S.phase === "career-over" ? "career"
        : S.phase === "offseason" ? "season"
        : (S.draft && S.draft.idx < S.draft.picks.length) ? "draft" : "class";
      render();
    });
  }
  else if (a === "newslot") {
    META.activeSlot = +k; saveMeta();
    S = newGame(); UI.screen = "class"; UI.armed = null; save(); render();
  }
  else if (a === "expslot") {
    loadSlot(+k).then((d) => { if (d) exportSave(d, `slot${k}-${d.year}`); toast(d ? "Save file downloaded." : "Nothing in that slot."); });
  }
  else if (a === "delslot") { UI.armed = "del" + k; render(); }
  else if (a === "delslotgo") {
    UI.armed = null;
    clearSlot(+k).then(() => { if (META.activeSlot === +k) { S = null; HAS_SAVE = false; } render(); });
  }
  else if (a === "dbsort") { UI.dbsort = k; UI.keepScroll = window.scrollY; render(); }
  else if (a === "rollback") {
    listRollback(META.activeSlot).then((l) => {
      const e = l[l.length - 1 - (+k)];
      if (!e) return toast("Nothing to go back to.");
      S = JSON.parse(e.data); UI.armed = null;
      UI.screen = S.phase === "career-over" ? "career" : S.phase === "offseason" ? "season" : "class";
      save(); render(); toast(`Rolled back to ${e.year}.`);
    });
  }
  else if (a === "newgame") {
    if (HAS_SAVE && BOOT_SAVE && UI.armed !== "newgame") { UI.armed = "newgame"; return render(); }
    UI.armed = null; wipe(); S = newGame(); UI.screen = "class"; save(); render();
  }
  else if (a === "arm") { UI.armed = t.dataset.k; render(); }
  else if (a === "goreset") { UI.screen = "office"; UI.armed = "restart"; UI.sel = null; UI.pickSel = null; render(); }
  else if (a === "disarm") { UI.armed = null; render(); }
  else if (a === "resume") { if (BOOT_SAVE) { S = BOOT_SAVE; UI.screen = S.lastResults ? "results" : (S.draft ? "draft" : "class"); render(); } }
  else if (a === "tab") { UI.screen = k; UI.sel = null; UI.armed = null; UI.from = null; UI.fromFarm = null; render(); }
  else if (a === "filter") { UI.filter = k; render(); }
  else if (a === "sort") { UI.sort = k; render(); }
  else if (a === "dsort") { UI.dsort = k; render(); }
  else if (a === "fulltop") { UI.fullTop = !UI.fullTop; UI.keepScroll = window.scrollY; render(); }
  else if (a === "cycle") {
    const rr = S.farm.find((r) => r.p.id === id);
    if (rr) rr.status = rr.status === "keep" ? null : rr.status === null || rr.status === undefined ? "shop" : "keep";
    UI.keepScroll = window.scrollY; save(); render();
  }
  else if (a === "stance") {
    const rr = S.farm.find((r) => r.p.id === id);
    if (rr) rr.status = t.dataset.k === "none" ? null : t.dataset.k;
    UI.keepScroll = window.scrollY; save(); render();
  }
  else if (a === "open") {
    // a detail view should always hand you back to the list you came from
    if (["class", "intl", "draft"].includes(UI.screen)) UI.from = UI.screen;
    UI.sel = id; UI.screen = "prospect"; render();
  }
  else if (a === "fplayer") {
    if (["farm", "season", "office"].includes(UI.screen)) UI.fromFarm = UI.screen;
    UI.farmSel = id; UI.screen = "player"; render();
  }
  else if (a === "back") {
    UI.screen = t.dataset.k === "farm" ? (UI.fromFarm || "farm") : (UI.from || "class");
    UI.sel = null; UI.farmSel = null; render();
  }
  else if (a === "star") {
    const q = S.prospects.concat(S.intlProspects).find((x) => x.id === id);
    if (q) q.star = !q.star;
    UI.keepScroll = window.scrollY; save(); render();
  }
  else if (a === "look") {
    const p = (S.prospects.concat(S.intlProspects)).find((x) => x.id === id);
    const d = LOOK_DEFS[k];
    if (S.looksLeft < d.cost) return toast("No looks left this spring.");
    // a new report is the point of the trip — put it in front of him
    runLook(S, p, k); S.looksLeft -= d.cost; save(); render();
  }
  else if (a === "buy") {
    const u = UPGRADES2.find((x) => x.k === k), tier = S.upgrades[u.k];
    if (tier >= u.max) return;
    if (S.budget < u.cost[tier]) return toast("Not enough in the budget.");
    S.budget = Math.round((S.budget - u.cost[tier]) * 10) / 10;
    S.upgrades[u.k] = tier + 1;
    if (u.k === "scouts") { S.looksLeft += 4; S.staff.push(makeScout(tier + 1)); S.prospects.forEach((p, i) => (p.sc = i % S.staff.length)); }
    if (u.k === "video") {
      for (let i = 0; i < 5; i++) { const np = genProspect(S.year); applyEconomy(np); freezeBoard(np); runLook(S, np, "area"); S.prospects.push(np); }
      // the board has to be re-laid, not appended to
      assignConsensus(S.prospects);
      S.prospects.forEach((p) => applyEconomy(p, p.consensus));
      assignBoardOrder(S.prospects);
      S.prospects.sort((a2, b2) => a2.consensus - b2.consensus);
      S.prospects.forEach((p, i) => (p.rank = i + 1));
      dedupeNames(S);
    }
    if (u.k === "intl") {
      const add = 4 + 3 * (tier + 1) - (tier > 0 ? 4 + 3 * tier : 0);
      const ip = intlPoolTotal(S);
      for (let i = 0; i < add; i++) { const np = genProspect(S.year, { intl: true }); intlEconomy(np, ip); freezeBoard(np); runLook(S, np, "area"); S.intlProspects.push(np); }
      // a bigger pool moves the whole market, not just the new names
      for (const q of S.intlProspects) { const keep = q.ask / Math.max(0.01, q.slotAsk); intlEconomy(q, ip); q.ask = Math.round(clamp(q.slotAsk * keep, 0.03, ip * 0.95) * 100) / 100; }
      S.intlOffers = {};
    }
    save(); toast(`${u.name} upgraded.`); 
  }
  else if (a === "todraft") {
    if (S.phase === "offseason") { UI.screen = "office"; return render(); }
    if (S.draft && S.draft.idx >= S.draft.picks.length && S.upgrades.intl > 0 && S.intlProspects.length) { UI.screen = "intl"; return render(); }
    if (!S.draft) startDraft(); else { UI.screen = "draft"; render(); }
  }
  else if (a === "pick") { UI.pickSel = id; UI.bonus = null; UI.showFile = false; render(); }
  else if (a === "unpick") { UI.pickSel = null; UI.bonus = null; UI.showFile = false; render(); }
  else if (a === "file") { UI.showFile = !UI.showFile; UI.keepScroll = window.scrollY; render(); }
  else if (a === "bonus") {
    const pk = currentPick(), p = S.prospects.find((x) => x.id === UI.pickSel), pr = priceRead(p);
    const base = UI.bonus == null ? Math.min(poolLeft(), Math.max(pk.slot, Math.round(pr.hi * 100) / 100)) : UI.bonus;
    UI.bonus = Math.round(clamp(base + parseFloat(t.dataset.d), 0.03, poolLeft()) * 100) / 100; render();
  }
  else if (a === "setbonus") { UI.bonus = Math.round(clamp(parseFloat(t.dataset.v), 0.03, poolLeft()) * 100) / 100; render(); }
  else if (a === "confirm") {
    const pk = currentPick(), p = S.prospects.find((x) => x.id === id), pr = priceRead(p);
    const bonus = UI.bonus == null ? Math.min(poolLeft(), Math.max(pk.slot, Math.round(pr.hi * 100) / 100)) : UI.bonus;
    pk.pid = p.id; pk.bonus = bonus;
    S.draft.taken[p.id] = "you";
    S.draft.gone[p.id] = "you";                 // he is off the board for everyone
    S.draft.log.push({ n: pk.overall, name: p.name, pos: p.pos, club: "you" });
    S.draft.idx += 1;
    advanceBoard();                              // the other clubs pick after you
    UI.pickSel = null; UI.bonus = null; rollEvent(); save(); render();
  }
  else if (a === "pass") {
    currentPick().passed = true; S.draft.idx += 1; advanceBoard(); rollEvent(); save(); render();
  }
  else if (a === "tointl") { UI.screen = "intl"; render(); }
  else if (a === "ioff") {
    const p = S.intlProspects.find((x) => x.id === id);
    const cur = S.intlOffers[p.id] || 0;
    const used = intlCommitted(S) - cur;
    const v = Math.round(clamp(cur + parseFloat(t.dataset.d), 0, intlPoolTotal(S) - used) * 100) / 100;
    if (v <= 0) delete S.intlOffers[p.id]; else S.intlOffers[p.id] = v;
    UI.keepScroll = window.scrollY; save(); render();
  }
  else if (a === "resolve") { resolve(); }
  else if (a === "exp") { UI.expand[id] = !UI.expand[id]; UI.keepScroll = window.scrollY; render(); }
  else if (a === "next") { nextYear(); }
  else if (a === "forceupdate") {
    // clear every cache and re-register, then reload from the network
    toast("Fetching the latest version\u2026");
    const done = () => setTimeout(() => location.reload(true), 400);
    try {
      const jobs = [];
      if (window.caches) jobs.push(caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))));
      if (navigator.serviceWorker) jobs.push(navigator.serviceWorker.getRegistrations()
        .then((rs) => Promise.all(rs.map((r) => r.unregister()))));
      Promise.all(jobs).then(done, done);
    } catch (e) { done(); }
  }
  else if (a === "dlsave") { exportSave(S, `${S.year}`); toast("Save file downloaded."); }
  else if (a === "restart") { UI.armed = null; wipe(); S = null; UI.screen = "title"; render(); }
});
document.addEventListener("change", (ev) => {
  const t = ev.target.closest("[data-a='impslot']");
  if (t && t.files && t.files[0]) {
    const n = +t.dataset.k;
    readSaveFile(t.files[0], (d, err) => {
      if (err) return toast(err);
      META.activeSlot = n; saveMeta();
      S = d; HAS_SAVE = true;
      if (!S.clubs || !S.clubs.length) S.clubs = seedClubs();
    if (!S.market) S.market = rollMarket();
    MARKET = S.market;
      if (!S.rivals || !S.rivals.length) S.rivals = seedRivals(S.year);
      if (!S.pool) S.pool = [];
      writeSlot(n, S);
      UI.screen = S.phase === "career-over" ? "career" : S.phase === "offseason" ? "season" : "class";
      render(); toast("Career restored.");
    });
  }
  const o = ev.target.closest("[data-a='importfile']");
  if (o && o.files && o.files[0]) readSaveFile(o.files[0], (d, err) => {
    if (err) return toast(err);
    S = d; HAS_SAVE = true; save();
    UI.screen = "season"; render(); toast("Career restored.");
  });
});
window.addEventListener("pagehide", () => { if (S) save(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && S) save(); });

/* ---------- boot ---------- */
(async function boot() {
  try {
    if (typeof location !== "undefined" && /reset/i.test((location.hash || "") + (location.search || ""))) {
      for (const n of SLOTS) await clearSlot(n);
      if (location.hash) location.hash = "";
      UI.screen = "title"; render();
      return;
    }
  } catch (e) {}
  await loadMeta();
  if (S) return;
  // Always open on the career picker. Auto-resuming into whatever screen you
  // happened to close on was disorienting — it looked like a stale page rather
  // than a saved game, and there was no way to reach the other slots.
  UI.screen = "title";
  HAS_SAVE = SLOTS.some((n) => META.slots[n]);
  render();
})();
