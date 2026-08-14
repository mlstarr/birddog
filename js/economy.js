/* ============================================================
   THE DRAFT ECONOMY
   Money in this draft is not a negotiation from zero. Every pick
   carries an assigned slot value, your pool is the sum of the slots
   you own, and a player's price is anchored to where the industry
   thinks he goes — not to how good he is.
   ============================================================ */

// Assigned slot values, overall pick -> $M. Log-interpolated between anchors.
const SLOT_ANCHORS = [[1, 11.1], [3, 9.0], [5, 7.9], [10, 5.7], [15, 4.6], [20, 4.0],
  [30, 3.1], [45, 2.2], [60, 1.55], [80, 1.05], [100, 0.79], [130, 0.55],
  [160, 0.42], [200, 0.31], [260, 0.24], [330, 0.20]];

function slotValue(n) {
  n = clamp(Math.round(n), 1, 330);
  for (let i = 0; i < SLOT_ANCHORS.length - 1; i++) {
    const [n1, v1] = SLOT_ANCHORS[i], [n2, v2] = SLOT_ANCHORS[i + 1];
    if (n <= n2) {
      const t = (Math.log(n) - Math.log(n1)) / (Math.log(n2) - Math.log(n1));
      return Math.round(Math.exp(Math.log(v1) + t * (Math.log(v2) - Math.log(v1))) * 100) / 100;
    }
  }
  return 0.20;
}

// Where the industry expects him to come off the board.
function consensusPick(buzz) { return clamp(Math.round(Math.exp((79 - buzz) / 9.2)), 1, 330); }

// A player's price is slot money for where he's ranked, moved by leverage:
// a high schooler with a commitment costs above slot, a college senior with
// nowhere else to go costs a fraction of it.
function applyEconomy(p, forced) {
  p.consensus = forced != null ? forced : consensusPick(p.buzz);
  p.slotAsk = slotValue(p.consensus);
  let lev = 1;
  if (p.origin === "HS" && p.buzz > 46) lev *= 1.32;
  if (p.origin === "JUCO") lev *= 0.90;
  if (p.level === "College Sr.") lev *= 0.32;
  if (p.arch === "tj" || p.arch === "bounce") lev *= 0.76;
  // Leverage is a function of where you're picked. Nobody turns down top-five money
  // to go back to school, so the top of the board signs at slot. Leverage is real
  // in rounds two through ten, where college is a live alternative.
  const strength = clamp((p.consensus - 3) / 38, 0, 1);
  lev = 1 + (lev - 1) * strength;
  p.leverage = Math.round(lev * 100) / 100;
  p.ask = Math.round(clamp(p.slotAsk * lev * Math.exp(gauss(0, 0.15)), 0.04,
    Math.min(13, p.slotAsk * 1.55)) * 100) / 100;
  // A provisional slot. assignBoardOrder() turns these into distinct picks —
  // a draft is a permutation, and two players cannot go at the same number.
  p.boardOrder = p.consensus * Math.exp(gauss(0, 0.52));
  p.takenAt = clamp(Math.round(p.boardOrder), 1, 400);
}

function marketRange(p) {
  return { lo: Math.round(p.slotAsk * 0.70 * 100) / 100, hi: Math.round(p.slotAsk * 1.45 * 100) / 100 };
}

// The international market clears against the pool that exists to buy it. The
// best 16-year-old in your territory costs most of your budget, never more than
// all of it — pricing him out entirely just deletes the decision.
function intlEconomy(p, pool) {
  const P = pool || 3.5;
  p.consensus = null;
  const norm = clamp((p.buzz - 28) / 45, 0, 1.15);
  const base = P * (0.05 + 0.50 * Math.pow(norm, 2.4));
  const lev = 0.85 + rnd() * 0.42;   // the trainer's leverage
  p.slotAsk = Math.round(base * 100) / 100;
  p.leverage = Math.round(lev * 100) / 100;
  p.ask = Math.round(clamp(base * lev, 0.03, P * 0.95) * 100) / 100;
  p.takenAt = 999;
  p.isIntl = true;
}

/* ---------- your club, and therefore your picks ---------- */
function computeRecord(S) {
  const w = clamp(63 + S.teamWAR * 0.52 + gauss(0, 3.2), 52, 106);
  S.wins = Math.round(w);
  S.losses = 162 - S.wins;
}

// Draft order the way baseball actually does it. Clubs that reach the postseason
// are slotted 19 through 30 by how far they went, so winning the World Series
// costs you the last pick of the first round. Everyone else is ordered by
// reverse record, with the top six decided by lottery.
function computeDraftPos(S, postseason) {
  if (postseason === "title") { S.draftPos = 30; S.draftNote = "World Series champions pick last."; return; }
  if (postseason === "berth") {
    S.draftPos = clamp(Math.round(19 + ((S.wins - 84) / 18) * 10 + gauss(0, 1.2)), 19, 29);
    S.draftNote = "Postseason clubs are slotted 19 through 30.";
    return;
  }
  let p = clamp(Math.round(1 + ((S.wins - 56) / 30) * 17 + gauss(0, 1.5)), 1, 18);
  if (p <= 6) {
    const before = p;
    p = 1 + Math.floor(rnd() * 6);
    S.draftNote = p < before ? `The lottery moved you up from ${before}.`
      : p > before ? `The lottery dropped you from ${before}.`
      : "You held your slot through the lottery.";
  } else S.draftNote = "Reverse order of record.";
  S.draftPos = p;
}

function computeSeason(S, postseason) {
  computeRecord(S);
  computeDraftPos(S, postseason || null);
}

function buildPicks(S) {
  const overalls = [];
  for (let r = 0; r < 6; r++) overalls.push(S.draftPos + 30 * r);
  for (let k = 1; k <= S.upgrades.picks; k++) overalls.push(30 + 3 * k); // acquired comp picks
  overalls.sort((a, b) => a - b);
  return overalls.map((o) => ({
    overall: o, round: Math.min(6, Math.floor((o - 1) / 30) + 1), comp: o > 30 && o % 3 === 0 && o <= 42 && !((o - S.draftPos) % 30 === 0),
    slot: slotValue(o), pid: null, bonus: 0, passed: false, signed: null,
  }));
}
const poolTotal = (S) => Math.round(S.draft.picks.reduce((s, p) => s + p.slot, 0) * 100) / 100;
const committed = (S) => Math.round(S.draft.picks.reduce((s, p) => s + (p.pid ? p.bonus : 0), 0) * 100) / 100;
const intlPoolTotal = (S) => [0, 3.5, 6.0, 9.5][S.upgrades.intl] || 0;
const intlCommitted = (S) => Math.round(Object.values(S.intlOffers || {}).reduce((a, b) => a + b, 0) * 100) / 100;


// Lay the class out on the real board: sorted by where each is going, then given
// distinct, increasing pick numbers. Gaps are the players you don't follow.
function assignBoardOrder(arr) {
  const seq = arr.filter((p) => !p.isIntl)
    .map((p) => ({ p, o: p.boardOrder != null ? p.boardOrder : p.consensus }))
    .sort((a, b) => a.o - b.o);
  let last = 0;
  for (const x of seq) {
    x.p.takenAt = Math.max(1, Math.round(x.o), last + 1);
    last = x.p.takenAt;
    delete x.p.goneBy;
  }
}


// The industry publishes one ordered board, not a set of ties. Sort the class by
// how the market rates each player and hand out distinct projected picks.
function assignConsensus(arr) {
  const seq = arr.filter((p) => !p.isIntl).slice().sort((a, b) => b.buzz - a.buzz);
  let last = 0;
  for (const p of seq) {
    p.consensus = Math.max(consensusPick(p.buzz), last + 1);
    last = p.consensus;
  }
}


// Your area men file on everyone in their territory, so the board is never
// narrow — but a department concentrates its follow list where it actually
// picks. A club holding the 28th pick does not spend its spring on the
// consensus number one. It still files on him, in case he falls.
function followWeight(consensus, firstPick) {
  let w = consensus >= firstPick ? 1 : 0.08 + 0.65 * Math.pow(consensus / firstPick, 1.3);
  if (consensus > firstPick + 210) w *= 0.5;   // beyond your last pick entirely
  return Math.max(0.06, w);
}
