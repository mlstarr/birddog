/* ============================================================
   THE OTHER TWENTY-NINE CLUBS
   Until now the board moved because each player carried a precomputed
   "takenAt". Nobody was actually picking. Now every club has a board of its
   own, its own biases, and takes players off the table in real time — so the
   run on prep arms ahead of you is somebody's actual preference, not a die roll.
   ============================================================ */

const CLUB_NAMES = ["Aces", "Anchors", "Bells", "Bison", "Cardinals", "Comets", "Cranes", "Crows",
  "Drovers", "Ferns", "Foxes", "Gales", "Harriers", "Ironmen", "Jays", "Kings", "Lancers", "Miners",
  "Otters", "Pilots", "Rails", "Ravens", "Rustlers", "Sentinels", "Spartans", "Stallions", "Tides",
  "Wolves", "Wrens"];

const CLUB_TRAITS = [
  { k: "prep", n: "takes high schoolers", d: "loves upside, drafts teenagers" },
  { k: "college", n: "takes college players", d: "wants polish and proximity" },
  { k: "arms", n: "takes pitching", d: "believes you can never have enough arms" },
  { k: "bats", n: "takes position players", d: "won't spend early picks on pitching" },
  { k: "tools", n: "chases tools", d: "drafts athletes and sorts it out later" },
  { k: "perf", n: "drafts performance", d: "trusts the numbers over the body" },
  { k: "premium", n: "values up the middle", d: "catchers, shortstops, centre fielders" },
  { k: "cheap", n: "drafts for signability", d: "will pass on talent to save money" },
  { k: "medical", n: "avoids medical risk", d: "won't touch a flagged file" },
  { k: "consensus", n: "drafts the board", d: "rarely deviates from the industry list" },
];

function makeClub(name) {
  const t = pickN(CLUB_TRAITS, 2);
  return { name, t1: t[0].k, t2: t[1].k, noise: Math.round(clamp(gauss(6, 2.2), 2.5, 11) * 10) / 10 };
}
function seedClubs() { return CLUB_NAMES.map(makeClub); }
function clubBlurb(c) {
  const f = (k) => (CLUB_TRAITS.find((x) => x.k === k) || {}).n || k;
  return `${f(c.t1)}, ${f(c.t2)}`;
}

// How much a given club likes a given player, in grade points on top of its own
// noisy read of him.
function clubLean(club, p) {
  let v = 0;
  for (const k of [club.t1, club.t2]) {
    if (k === "prep") v += (p.origin === "HS" || p.origin === "INTL") ? 5 : -3;
    if (k === "college") v += (p.origin === "COL" || p.origin === "JUCO") ? 5 : -3;
    if (k === "arms") v += p.isP ? 5 : -3;
    if (k === "bats") v += p.isP ? -4 : 4;
    if (k === "tools") v += ((p.cur.run || 40) + (p.cur.arm || 40) + (p.cur.fb || 40)) / 3 > 52 ? 5 : -2;
    if (k === "perf") v += p.origin === "COL" ? 3 : 0, v += p.proj > 55 ? -3 : 2;
    if (k === "premium") v += ["C", "SS", "CF", "2B"].includes(p.pos) ? 5 : -2;
    if (k === "cheap") v += p.ask < p.slotAsk * 0.9 ? 6 : p.ask > p.slotAsk * 1.15 ? -8 : 0;
    if (k === "medical") v += p.health < 42 ? -10 : p.health > 58 ? 2 : 0;
    if (k === "consensus") v += clamp((60 - p.consensus) * 0.12, -4, 4);
  }
  return v;
}

// Each club forms a private opinion of the class once, at the start of the draft.
function buildClubBoards(clubs, pool) {
  for (const c of clubs) {
    c.board = {};
    for (const p of pool) c.board[p.id] = p.tv + clubLean(c, p) + gauss(0, c.noise);
  }
}

/* ---------- running the draft ---------- */
// Returns the players taken by other clubs between your last pick and this one.
function runRivalPicks(S, fromOverall, toOverall) {
  const taken = [];
  const yourPicks = new Set(S.draft.picks.map((pk) => pk.overall));
  for (let n = fromOverall; n < toOverall; n++) {
    if (yourPicks.has(n)) continue;
    const club = S.clubs[(n - 1 + S.draft.clubOffset) % S.clubs.length];
    const avail = S.pool.filter((p) => !S.draft.gone[p.id]);
    if (!avail.length) break;
    // clubs mostly take the best player on their own board, occasionally reach
    let best = null, bestV = -1e9;
    const reach = rnd() < 0.14;
    for (const p of avail) {
      let v = club.board[p.id] != null ? club.board[p.id] : p.tv;
      if (reach) v += gauss(0, 9);
      if (v > bestV) { bestV = v; best = p; }
    }
    if (!best) break;
    S.draft.gone[best.id] = club.name;
    taken.push({ p: best, club: club.name, at: n });
  }
  return taken;
}
