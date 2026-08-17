/* ============================================================
   THE REST OF BASEBALL
   You are not the first scouting director and yours is not the only farm
   system. A top-100 list is only meaningful against the other 29 clubs'
   players, and a job doesn't begin with an empty complex.
   ============================================================ */

const ORGS = ["Aces", "Anchors", "Bells", "Bison", "Cardinals", "Comets", "Cranes", "Crows", "Drovers",
  "Ferns", "Foxes", "Gales", "Harriers", "Ironmen", "Jays", "Kings", "Lancers", "Miners", "Otters",
  "Pilots", "Rails", "Ravens", "Rustlers", "Sentinels", "Spartans", "Stallions", "Tides", "Wolves", "Wrens"];

const RIVAL_POOL = 240;

function makeRival(year) {
  const isP = rnd() < 0.45;
  const asian = rnd() < 0.05, latin = rnd() < 0.30;
  const name = asian ? `${pick(ASIA_FIRST)} ${pick(ASIA_LAST)}`
    : latin ? `${pick(LATIN_FIRST)} ${pick(LATIN_LAST)}`
    : `${pick(US_FIRST)} ${pick(US_LAST)}`;
  const age = 17 + Math.floor(rnd() * 6);
  return {
    name, org: pick(ORGS), pos: isP ? (rnd() < 0.28 ? "LHP" : "RHP") : pick(HIT_POS),
    age, grade: Math.round(clamp(gauss(51.5, 8.2), 26, 79) * 10) / 10,
    li: age <= 18 ? 0 : age <= 19 ? 1 : age <= 20 ? 2 : age <= 21 ? 3 : 4,
    entered: year,
  };
}
function seedRivals(year) {
  const a = [];
  for (let i = 0; i < RIVAL_POOL; i++) a.push(makeRival(year - Math.floor(rnd() * 4)));
  return a;
}
// Other clubs' players develop, graduate and bust too. Keeps the list churning
// so your ranking moves even in a year you do nothing.
function ageRivals(s) {
  const out = [];
  for (const v of s.rivals || []) {
    v.age += 1;
    v.grade = Math.round(clamp(v.grade + gauss(v.age <= 21 ? 1.1 : -0.6, 3.4), 22, 80) * 10) / 10;
    if (v.li < 5 && rnd() < 0.42) v.li += 1;
    const graduated = v.age >= 24 || (v.li >= 5 && rnd() < 0.5);
    if (!graduated && rnd() > 0.06) out.push(v);
  }
  while (out.length < RIVAL_POOL) out.push(makeRival(s.year));
  s.rivals = out;
}

/* ---------- the department you inherited ---------- */
function seedFarm(s) {
  const n = 13 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    const back = 1 + Math.floor(rnd() * 4);            // signed one to four years ago
    const p = genProspect(s.year - back);
    applyEconomy(p);
    p.name = p.name;
    const rec = initRecord(p, p.ask, rnd() < 0.55 ? 20 + Math.floor(rnd() * 200) : null, 0, s.year - back, s.upgrades, false);
    rec.inherited = true;
    for (let y = 0; y < back; y++) stepSeason(rec, s.upgrades, s.year - back + y);
    if (rec.st.done) continue;                          // washed out before you arrived
    // his bonus and his first few seasons were somebody else's problem
    rec.st.surplus = 0;
    rec.bonus = 0;
    s.farm.push(rec);
  }
}


/* ---------- nobody shares a name ---------- */
const MIDDLE = "ABCDEFGHIJKLMNOPRSTVW";
function dedupeNames(s) {
  const seen = {}, surnames = {};
  // Two men with the same surname in one system reads as a mistake even when it
  // isn't, so surnames are unique across everyone you can currently see. With
  // seventy-odd names drawn per class this matters more than pool size does.
  const surnameOf = (n) => n.split(" ").pop();
  const freshSurname = (n) => {
    const parts = n.split(" ");
    for (let i = 0; i < 40; i++) {
      const cand = pick(NAMES_US_LAST);
      if (!surnames[cand]) return parts.slice(0, -1).join(" ") + " " + cand;
    }
    return n;
  };
  const claim = (obj) => {
    let n = obj.name;
    const sn = surnameOf(n);
    if (surnames[sn]) { n = freshSurname(n); obj.name = n; }
    surnames[surnameOf(n)] = 1;
    if (!seen[n]) { seen[n] = 1; return; }
    for (let i = 0; i < 24; i++) {
      const parts = n.split(" ");
      const cand = `${parts[0]} ${MIDDLE[Math.floor(rnd() * MIDDLE.length)]}. ${parts.slice(1).join(" ")}`;
      if (!seen[cand]) { obj.name = cand; seen[cand] = 1; return; }
    }
    seen[n] = (seen[n] || 0) + 1;
  };
  (s.farm || []).forEach((r) => claim(r.p));
  (s.rivals || []).forEach(claim);
  (s.prospects || []).forEach(claim);
  (s.intlProspects || []).forEach(claim);
  (s.closed || []).forEach((c) => claim(c.p));
}
