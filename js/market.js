/* ============================================================
   THE MARKET
   Every career gets its own set of prejudices. The directions are plausible —
   nobody has ever underpaid for velocity — but the magnitudes are rolled fresh,
   a couple flip outright, and they drift year to year. An edge you have farmed
   for a decade can close as the industry catches on, and something new opens.
   ============================================================ */

// Each factor: how it is measured, the range its coefficient can take, and how
// it reads in a research report. Positive means the market pays too much.
const BIAS_FACTORS = [
  { k: "velo", n: "Velocity", lo: 3.0, hi: 11.0, flip: 0.05,
    up: "Big fastballs are paid for twice — once for the radar gun and again in the bonus.",
    dn: "This market has stopped chasing velocity, and arms with it are going cheap." },
  { k: "power", n: "Raw power", lo: 0.5, hi: 6.5, flip: 0.10,
    up: "Batting-practice power moves boards more than it moves games.",
    dn: "Power is out of fashion here. You can buy thump below its worth." },
  { k: "frame", n: "Projectable bodies", lo: -1.0, hi: 6.0, flip: 0.18,
    up: "The industry buys the frame and hopes.",
    dn: "This market wants finished players and discounts the ones still filling out." },
  { k: "speed", n: "Speed", lo: -2.0, hi: 4.5, flip: 0.22,
    up: "Runners look like prospects, so they get priced like prospects.",
    dn: "Nobody is paying for legs at the moment." },
  { k: "hit", n: "Hit tool", lo: -8.0, hi: 0.5, flip: 0.12,
    up: "Unusually, this market pays a premium for pure bat-to-ball.",
    dn: "Bat-to-ball skill is the cheapest real thing on the board." },
  { k: "cmd", n: "Command", lo: -7.5, hi: 1.0, flip: 0.10,
    up: "Strike-throwers are in vogue and priced accordingly.",
    dn: "Nobody pays for strikes. They should." },
  { k: "disc", n: "Plate discipline", lo: -5.5, hi: 0.5, flip: 0.12,
    up: "On-base skills have been discovered here and the discount is gone.",
    dn: "Walks don't show up in a showcase, so nobody bids on them." },
  { k: "catcher", n: "Catchers", lo: -7.5, hi: 1.0, flip: 0.14,
    up: "Catching is valued properly here — perhaps too well.",
    dn: "Defensive value behind the plate is close to invisible to the market." },
  { k: "juco", n: "Junior college", lo: -8.5, hi: -0.5, flip: 0.08,
    up: "The small schools have been picked over. No bargain left.",
    dn: "Nobody drives to the small schools, so nobody bids." },
  { k: "senior", n: "College seniors", lo: -5.5, hi: -0.5, flip: 0.05,
    up: "Even seniors are getting bid up in this market.",
    dn: "No leverage, no buzz, and often a perfectly good player." },
  { k: "medical", n: "Medical flags", lo: -8.0, hi: 0.0, flip: 0.10,
    up: "Flagged files are being bought aggressively — riskier than it looks.",
    dn: "The discount for a flagged file is larger than the risk warrants." },
  { k: "college", n: "Four-year college", lo: -1.0, hi: 5.0, flip: 0.20,
    up: "Big-programme players carry a premium here.",
    dn: "This market prefers projection to production, and college bats are cheap." },
  { k: "prep", n: "High schoolers", lo: -2.5, hi: 5.0, flip: 0.25,
    up: "Teenage upside is the fashion, and it is priced as such.",
    dn: "Cold feet on teenagers. Upside is on sale." },
];

function rollMarket() {
  const m = { f: {}, era: 0 };
  for (const f of BIAS_FACTORS) {
    let v = f.lo + rnd() * (f.hi - f.lo);
    if (rnd() < f.flip) v = -v;                     // occasionally the whole habit inverts
    m.f[f.k] = Math.round(v * 10) / 10;
  }
  m.a = { ...m.f };          // where this market sits at rest
  return m;
}

// Markets move. Each year every coefficient drifts a little, and once in a while
// an inefficiency you have been living off simply closes.
function driftMarket(m) {
  if (!m || !m.f) return;
  for (const f of BIAS_FACTORS) {
    // Slow drift, pulled gently back toward where this market started, so a
    // habit you have learned stays broadly true for years rather than
    // reversing on you. The rare shocks are what make it worth re-checking.
    const anchor = m.a ? m.a[f.k] : m.f[f.k];
    let v = m.f[f.k] + gauss(0, 0.28) + (anchor - m.f[f.k]) * 0.12;
    if (rnd() < 0.012) v *= 0.45;                   // the industry catches on
    const span = Math.max(Math.abs(f.lo), Math.abs(f.hi)) * 1.15;
    m.f[f.k] = Math.round(clamp(v, -span, span) * 10) / 10;
  }
  m.era = (m.era || 0) + 1;
}

// What the market currently thinks of a player, over and above what he is.
function marketBiasFor(p, m) {
  if (!m || !m.f) return 0;
  const F = m.f;
  let b = 0;
  if (p.isP) {
    b += clamp((p.cur.fb - 50) * 0.055, -1.2, 1.2) * F.velo + (p.cur.fb >= 62 ? F.velo * 0.35 : 0);
    b += clamp((p.cur.cmd - 50) * 0.05, -1.1, 1.1) * -F.cmd * -1;
    if (p.ht >= 75) b += 2;
    if (p.ht <= 71) b -= 3;
  } else {
    b += clamp((p.cur.power - 50) * 0.05, -1.2, 1.2) * F.power + (p.cur.power >= 62 ? F.power * 0.35 : 0);
    b += clamp((p.cur.run - 50) * 0.045, -1, 1) * F.speed;
    b += clamp((p.cur.hit - 50) * 0.05, -1.1, 1.1) * -F.hit * -1;
    b += clamp((p.cur.disc - 50) * 0.05, -1.1, 1.1) * -F.disc * -1;
    if (p.pos === "C") b += F.catcher;
    if (p.pos === "1B" || p.pos === "DH") b += 1.5;
  }
  b += clamp((p.proj - 50) * 0.05, -1.1, 1.1) * F.frame;
  if (p.wt >= 235) b -= 2;
  if (p.origin === "COL") b += F.college;
  if (p.origin === "JUCO") b += F.juco;
  if (p.origin === "HS") b += F.prep;
  if (p.level === "College senior") b += F.senior;
  if (p.health <= 42) b += F.medical;
  if (p.arch === "sleeper" || p.arch === "sleeperarm") b -= 5;
  if (p.arch === "cold") b -= 4;
  if (p.arch === "tj" || p.arch === "bounce") b -= 3;
  if (p.makeup >= 60) b -= 1.5;
  return b;
}

// Keep the board centred so it is tilted rather than simply pessimistic.
function marketCentre(m) {
  if (!m || !m.f) return 0;
  const F = m.f;
  return -(F.velo * 0.20 + F.power * 0.18 + F.frame * 0.10 + F.speed * 0.04
    + F.hit * 0.16 + F.cmd * 0.14 + F.disc * 0.14 + F.catcher * 0.09
    + F.juco * 0.12 + F.senior * 0.10 + F.medical * 0.10
    + F.college * 0.42 + F.prep * 0.44) + 1.2;
}

/* ---------- what your analysts can tell you about it ---------- */
// Tier 1 sees the loudest couple of habits, tier 2 more, tier 3 the lot — and
// only tier 3 puts numbers on them.
function marketReport(m, tier) {
  if (!m || !m.f || tier < 1) return [];
  const rows = BIAS_FACTORS.map((f) => ({ f, v: m.f[f.k] }))
    .sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
  const n = tier >= 3 ? rows.length : tier === 2 ? 6 : 3;
  return rows.slice(0, n).map(({ f, v }) => ({
    name: f.n, v, exact: tier >= 3,
    strength: Math.abs(v) >= 5 ? "strongly" : Math.abs(v) >= 2.5 ? "clearly" : "slightly",
    note: v > 0 ? f.up : f.dn,
  }));
}
