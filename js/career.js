/* ============================================================
   THE FARM SYSTEM
   Players no longer resolve in one lump. Each signing becomes a record that
   lives in your organisation and plays exactly one season a year, crediting
   surplus as he earns it. By your sixth draft you have six overlapping cohorts
   in flight, which is what a farm system actually is.
   ============================================================ */

const DEV_COST_YEAR = 0.35;

function initRecord(p0, bonus, pick, slot, year, upgrades, shadow) {
  // Once he's signed, the spring's paperwork is dead weight. Keep the grades and
  // your beliefs about him; drop the report text and the phrasing memory.
  const p = { ...p0, reports: [], usedLines: [], pub: undefined };
  const g = { ...p.cur };
  const ceil = { ...p.fut };

  const mkTilt = (p.makeup - 50) / 22;
  const youthVar = p.age <= 18.5 ? 1.30 : p.age <= 20.5 ? 1.10 : p.age <= 22 ? 0.92 : 0.78;
  // Makeup tilts which ordinary path he takes. It must not be allowed to pile
  // probability against the top of the range — clamping at 1 was handing the
  // rarest outcome to every high-makeup player.
  // Makeup moves the thresholds, not the roll. Shifting a clamped roll piled
  // probability against whichever bound it hit and handed the rarest outcomes
  // to every high-makeup player.
  const pathRoll = rnd();
  const t = mkTilt * 0.085;
  const generational = rnd() < 0.0038 * clamp(0.5 + (p.makeup - 40) / 55, 0.35, 1.7);
  let devPath, ceilBoost, realBase, earlyRate = 1, lateRate = 1;
  // Once in a very long while a player simply becomes someone else. Piazza went
  // in the 62nd round; Pujols in the 13th. Without this the model has a hard
  // ceiling that says a late pick can never be an inner-circle great, and that
  // is not what the sport looks like.
  if (generational) { devPath = "generational"; ceilBoost = ri(24, 40) * youthVar; realBase = 1.06; }
  else if (pathRoll > 0.952 - t) { devPath = "breakout"; ceilBoost = ri(9, 21) * youthVar; realBase = 1.02; }
  else if (pathRoll > 0.892 - t) { devPath = "late"; ceilBoost = ri(5, 15) * youthVar; realBase = 0.95; earlyRate = 0.45; lateRate = 2.1; }
  else if (pathRoll > 0.445 - t) { devPath = "steady"; ceilBoost = ri(-2, 3); realBase = 0.80; }
  else if (pathRoll > 0.195 - t) { devPath = "stalled"; ceilBoost = -ri(3, 10); realBase = 0.60; }
  else { devPath = "flat"; ceilBoost = -ri(3, 8); realBase = 0.40; earlyRate = 0.5; lateRate = 0.5; }

  for (const k in ceil) ceil[k] = clamp(ceil[k] + ceilBoost * (GROWTH_SHARE[k] ?? 0.7), 20, 80);
  const real = clamp(gauss(realBase + (p.makeup - 50) * 0.0035, 0.22), 0.05, 1.45);
  for (const k in ceil) ceil[k] = clamp(Math.round(g[k] + (ceil[k] - g[k]) * real), 20, 80);

  return {
    id: p.id, p, bonus, pick, slot, signedYear: year, shadow: !!shadow,
    st: {
      g, ceil, age: p.age, li: p.origin === "COL" || p.origin === "JUCO" ? 1 : 0,
      mlbYears: 0, devPath, earlyRate, lateRate,
      injuryDamage: 0, badYears: 0, injuryDays: 0, debutGrades: null,
      honors: [], seasons: [], warTotal: 0, salTotal: 0, devCost: 0.4,
      valueEarned: 0, surplus: -(bonus || 0) - 0.4, prevWAR: 0,
      reliefYears: 0, startYears: 0, paSum: 0, seasonsPlayed: 0,
      pubNoise: gauss(0, 3.2), done: false, outcome: null, trade: null,
      // The industry's view of him, which lags what your staff already knows.
      pubOvr: p.isP ? pitOVR(g) : hitOVR(g),
      pubCeil: p.isP ? pitOVR(ceil) : hitOVR(ceil),
    },
  };
}

// One season. Returns what happened, and credits what he earned this year.
function stepSeason(rec, upgrades, year) {
  const p = rec.p, st = rec.st;
  if (st.done) return null;
  const devBoost = 1 + 0.12 * (upgrades.playerdev || 0);
  const medBoost = 1 + 0.08 * (upgrades.medical || 0);
  const g = st.g, ceil = st.ceil;

  st.age += 1;
  const age = st.age;
  const ageF = age <= 20 ? 1.25 : age <= 22 ? 1.0 : age <= 25 ? 0.72 : age <= 28 ? 0.3 : -0.12;
  for (const k in g) {
    const gap = ceil[k] - g[k];
    const phase = age <= 22.5 ? st.earlyRate : st.lateRate;
    const rate = (0.20 + (p.makeup - 50) * 0.0022) * devBoost * ageF * phase * (0.45 + rnd() * 1.2);
    let d = gap * Math.max(0, rate);
    if (age >= 30) d -= (k === "run" || k === "fb" ? ri(1, 4) : ri(0, 2));
    if (rnd() < 0.05) d += gauss(0, 3.5);
    g[k] = clamp(g[k] + d, 20, 80);
  }

  let missed = 0, injNote = "";
  const injRisk = clamp(0.30 - (p.health - 50) * 0.0042 - (medBoost - 1) * 0.08, 0.05, 0.55);
  if (rnd() < injRisk) {
    const sev = rnd();
    if (sev < 0.55) { missed = ri(15, 45); injNote = pick(["strained oblique", "hamstring strain", "sprained thumb", "forearm tightness", "back spasms"]); }
    else if (sev < 0.86) { missed = ri(60, 110); injNote = pick(["hamate surgery", "shoulder inflammation", "high ankle sprain", "elbow inflammation", "sports hernia"]); st.injuryDamage += 1; }
    else {
      missed = ri(140, 240); injNote = p.isP ? "UCL reconstruction" : pick(["labrum surgery", "second knee operation", "fractured wrist"]);
      st.injuryDamage += 3;
      for (const k in g) { g[k] = clamp(g[k] - ri(1, 5), 20, 80); ceil[k] = clamp(ceil[k] - ri(1, 4), 20, 80); }
    }
  }
  st.injuryDays += missed;

  // ---- moving down (or up) the defensive spectrum ----
  // Everyone is signed at a position; a lot of them can't hold it. This is the
  // single most common thing a development staff discovers.
  let posMove = null;
  if (!p.isP && st.age >= 19 && st.age <= 26 && rnd() < 0.11) {
    const DOWN = { C: ["1B", "3B", "LF", "RF"], SS: ["2B", "3B", "CF"], "2B": ["LF", "3B"],
      "3B": ["1B", "LF", "RF"], CF: ["LF", "RF"], LF: ["1B", "DH"], RF: ["1B", "LF", "DH"], "1B": ["DH"], DH: [] };
    const UP = { "1B": ["LF", "RF"], LF: ["CF", "3B"], RF: ["CF"], "3B": ["SS"], "2B": ["SS", "CF"], DH: ["1B", "LF"] };
    const holds = (g.field - 44) + (g.run - 44) * 0.35 + (g.arm - 44) * 0.3 + gauss(0, 7);
    if (holds < -8 && (DOWN[p.pos] || []).length) {
      const to = pick(DOWN[p.pos]);
      posMove = { from: p.pos, to, up: false };
      p.pos = to;
    } else if (holds > 13 && (UP[p.pos] || []).length && st.age <= 23) {
      const to = pick(UP[p.pos]);
      posMove = { from: p.pos, to, up: true };
      p.pos = to;
      g.field = clamp(g.field - ri(1, 4), 20, 80);   // learning a harder spot costs him at first
    }
    if (posMove) {
      st.posMoves = (st.posMoves || []).concat([{ ...posMove, year, age: Math.floor(st.age) }]);
      rec.pos = p.pos;        // where he plays now, without mutating the draft record
    }
  }

  const ovr = p.isP ? pitOVR(g) : hitOVR(g);
  const ceilOvr = p.isP ? pitOVR(ceil) : hitOVR(ceil);
  // Prospect lists move slowly. A player who has quietly backed up still reads
  // well outside the organisation for a year or two, and a breakout takes a
  // while to be believed. That lag is the only edge you have when you sell.
  st.pubOvr += (ovr - st.pubOvr) * 0.45 + gauss(0, 1.3);
  st.pubCeil += (ceilOvr - st.pubCeil) * 0.33 + gauss(0, 1.3);
  const needed = [28, 34, 38, 42, 45, 48];
  if (st.li < 5) {
    const thr = needed[st.li + 1];
    if (ovr >= thr + gauss(0, 1.5) && missed < 100) st.li += 1;
    else if (ovr >= thr - 3 && rnd() < 0.35 && missed < 100) st.li += 1;
  }
  const level = LEVELS[st.li];
  const inMLB = st.li === 5;
  if (inMLB && !st.debutGrades) st.debutGrades = { ...g };

  let line = "", war = 0, salary = 0, stat = {};
  const lvlBoost = inMLB ? 0 : (5 - st.li) * 2.2;

  if (!p.isP) {
    const eg = { hit: g.hit + lvlBoost, power: g.power, run: g.run, field: g.field, disc: g.disc + lvlBoost };
    const avg = clamp(0.136 + eg.hit * 0.00222 + gauss(0, 0.016), 0.145, 0.375);
    const bbp = clamp(0.020 + eg.disc * 0.00138 + gauss(0, 0.011), 0.018, 0.215);
    const HBP = 0.0114;
    const obp = clamp(avg * (1 - bbp - HBP) + bbp + HBP, avg + 0.02, 0.495);
    const iso = clamp(0.045 + (eg.power - 30) * 0.0056 + gauss(0, 0.023), 0.018, 0.375);
    const slg = clamp(avg + iso, avg, 0.760);
    const fullPA = inMLB ? clamp(Math.round(585 - missed * 3.6 - Math.max(0, (54 - ovr)) * 32 + gauss(0, 40)), 0, 690)
      : clamp(Math.round(500 - missed * 3.2), 0, 560);
    const hits = Math.round(avg * fullPA * 0.91);
    const hr = clamp(Math.round(Math.pow(iso, 1.25) * fullPA * 0.312), 0, Math.round(hits * 0.72));
    const sb = Math.max(0, Math.round(Math.max(0, g.run - 38) * 0.92 * (fullPA / 600)));
    stat = { avg, obp, slg, ops: obp + slg, hr, pa: fullPA };
    line = fullPA < 40 ? "Missed the season"
      : `${avg.toFixed(3).slice(1)}/${obp.toFixed(3).slice(1)}/${slg.toFixed(3).slice(1)}, ${hr} HR, ${sb} SB in ${fullPA} PA`;
    if (inMLB) {
      st.paSum += fullPA; if (fullPA >= 40) st.seasonsPlayed++;
      const offR = fullPA < 40 ? 0 : (obp + slg - 0.719) * 200 * (fullPA / 600);
      const defR = ((g.field - 50) * 0.34 + (POS_ADJ[p.pos] ?? 0)) * (fullPA / 600);
      war = (offR + defR + 20 * (fullPA / 600)) / 9.7;
    }
  } else {
    const eg = { fb: g.fb, brk: g.brk, ch: g.ch, cmd: g.cmd + lvlBoost };
    const stuff = 0.32 * eg.fb + 0.24 * eg.brk + 0.14 * eg.ch + 0.30 * eg.cmd;
    const era = clamp(7.51 - stuff * 0.0666 + gauss(0, 0.46) - lvlBoost * 0.05, 2.05, 8.40);
    const isRP = g.dur < 42 || (p.arch === "relief" && g.dur < 52);
    const ip = isRP ? clamp(Math.round(66 - missed * 0.36 + gauss(0, 8)), 0, 82)
      : clamp(Math.round((inMLB ? 172 : 128) - missed * 0.95 + gauss(0, 18) - Math.max(0, 52 - g.dur) * 2.0), 0, 215);
    const k9 = clamp(2.2 + eg.fb * 0.062 + eg.brk * 0.062 + (isRP ? 1.1 : 0) + gauss(0, 0.55), 3, 16);
    const bb9 = clamp(6.70 - eg.cmd * 0.0668 + gauss(0, 0.48), 0.8, 8);
    stat = { era, ip, k: Math.round((k9 * ip) / 9), isRP };
    line = ip < 8 ? "Missed the season"
      : `${ipString(ip * 3 + ri(0, 2))} IP, ${era.toFixed(2)} ERA, ${k9.toFixed(1)} K/9, ${bb9.toFixed(1)} BB/9${isRP ? " · relief" : ""}`;
    if (inMLB) {
      if (ip >= 8) { st.seasonsPlayed++; if (isRP) st.reliefYears++; else st.startYears++; }
      war = ip < 8 ? 0 : ((5.25 - era) * ip / 9) / 9.7 + (isRP ? 0.15 : 0);
    }
  }
  war = Math.round(war * 10) / 10;

  const aw = [];
  if (inMLB && (p.isP ? stat.ip >= 40 : stat.pa >= 150)) {
    if (st.mlbYears === 0 && war >= 3.2 && rnd() < 0.16) aw.push("Rookie of the Year");
    if (war >= 4.6 ? rnd() < 0.44 : war >= 3.5 ? rnd() < 0.18 : false) aw.push("All-Star");
    if (!p.isP && war >= 7.4 && rnd() < 0.22) aw.push("MVP");
    if (p.isP && war >= 5.4 && !stat.isRP && rnd() < 0.28) aw.push("Cy Young");
    if (!p.isP && p.pos !== "DH" && p.pos !== "1B" && g.field >= 60 && war >= 2.6 && rnd() < 0.22) aw.push("Gold Glove");
    if (!p.isP && stat.ops >= 0.870 && war >= 3.2 && rnd() < 0.20) aw.push("Silver Slugger");
    if (!p.isP && stat.avg >= 0.322 && rnd() < 0.26) aw.push("Batting title");
    if (!p.isP && stat.hr >= 42) aw.push(`${stat.hr}-homer season`);
    if (p.isP && !stat.isRP && stat.era <= 2.70 && stat.ip >= 160 && rnd() < 0.20) aw.push("ERA title");
    if (p.isP && stat.k >= 235) aw.push(`${stat.k}-strikeout season`);
    if (p.isP && stat.isRP && war >= 1.8 && rnd() < 0.26) aw.push("Reliever of the Year");
  }
  aw.forEach((a) => st.honors.push(a));

  // ---- money for THIS season only ----
  let seasonValue = 0, seasonSurplus = 0;
  if (inMLB) {
    st.mlbYears += 1;
    if (st.mlbYears <= 3) salary = MIN_SALARY;
    else if (st.mlbYears === 4) salary = Math.max(0.9, st.prevWAR * DOLLARS_PER_WAR * 0.19);
    else if (st.mlbYears === 5) salary = Math.max(1.2, st.prevWAR * DOLLARS_PER_WAR * 0.34);
    else salary = Math.max(1.6, st.prevWAR * DOLLARS_PER_WAR * 0.52);
    salary = Math.round(salary * 10) / 10;
    st.prevWAR = Math.max(st.prevWAR * 0.5, war);
    st.warTotal = Math.round((st.warTotal + war) * 10) / 10;
    st.salTotal = Math.round((st.salTotal + salary) * 10) / 10;
    seasonValue = war * DOLLARS_PER_WAR;
    seasonSurplus = seasonValue - salary;
  } else {
    st.devCost = Math.round((st.devCost + DEV_COST_YEAR) * 10) / 10;
    seasonSurplus = -DEV_COST_YEAR;
  }
  st.valueEarned = Math.round((st.valueEarned + seasonValue) * 10) / 10;
  st.surplus = Math.round((st.surplus + seasonSurplus) * 10) / 10;

  // What another club would give up — priced off the PUBLIC view of him, not
  // the truth. This is what makes selling high a skill rather than luck.
  let mktValue;
  if (inMLB) {
    mktValue = clamp((st.prevWAR * DOLLARS_PER_WAR - 2) * Math.max(0, 6 - st.mlbYears) * 0.55, 0, 165);
  } else {
    const pubG = prospectGrade(rec);
    mktValue = Math.min(190, Math.pow(Math.max(0, pubG - 44), 1.75) * 0.38);
  }
  mktValue = Math.round(mktValue * 10) / 10;

  const season = { year, age: Math.floor(age), level, line, war: inMLB ? war : null, posMove,
    salary: inMLB ? salary : null, injNote, missed, awards: aw, ovr: Math.round(ovr),
    mktValue, surplus: Math.round(seasonSurplus * 10) / 10 };
  st.seasons.push(season);

  // ---- does he stay? ----
  let tradeThisYear = null;
  // Your stance is advice, not an order. The GM listens, mostly.
  const stance = rec.status || "none";
  // The better he is, the less likely anybody prises him loose. A cost-controlled
  // star is close to untradeable in practice; org filler moves constantly.
  const scarcity = clamp(Math.pow(1 - clamp((mktValue - 10) / 140, 0, 1), 1.6), 0.05, 1);
  const tradeOdds = stance === "shop" ? 0.30 * clamp(scarcity * 2.2, 0.22, 1)
    : stance === "keep" ? 0.012 * scarcity
    : 0.075 * scarcity;
  const stanceMult = (stance === "shop" ? 0.93 : stance === "keep" ? 1.24 : 1) * (1 + 0.05 * (upgrades.picks || 0));
  if (!st.done && mktValue > 0.04 && rnd() < tradeOdds) {
    const ret = Math.round(mktValue * stanceMult * Math.exp(gauss(0, 0.30) - 0.045) * 10) / 10;
    const pr = rnd();
    const pkgSize = pr < 0.55 ? 1 : pr < 0.83 ? 2 : pr < 0.96 ? 3 : 4;
    let others = 0;
    for (let q = 1; q < pkgSize; q++) others += ret * (0.35 + rnd() * 1.05);
    const dealTotal = Math.round((ret + others) * 10) / 10;
    const desc = dealTotal < 6 ? "a fringe bullpen arm" : dealTotal < 14 ? "a useful reliever"
      : dealTotal < 30 ? "a solid everyday regular" : dealTotal < 58 ? "a very good everyday player"
      : dealTotal < 100 ? "a bona fide All-Star" : "a franchise cornerstone";
    tradeThisYear = { age: Math.floor(age), level, ret, pkgSize, dealTotal, desc, stance,
      share: Math.round((ret / Math.max(0.1, dealTotal)) * 100) };
    st.trade = tradeThisYear;
    st.surplus = Math.round((st.surplus + ret) * 10) / 10;
    season.surplus = Math.round((season.surplus + ret) * 10) / 10;
    st.done = true; st.outcome = "traded";
  }
  if (!st.done) {
    if (inMLB && war < 0.2) st.badYears += 1;
    if (st.mlbYears >= 6) { st.done = true; st.outcome = "control-complete"; }
    else if (inMLB && st.badYears >= 2 && st.mlbYears >= 2) { st.done = true; st.outcome = "released"; }
    else if (!inMLB && age >= 25 && ovr < 41 && rnd() < 0.55) { st.done = true; st.outcome = "released"; }
    else if (!inMLB && age >= 27) { st.done = true; st.outcome = "released"; }
    else if (st.injuryDamage >= 5) { st.done = true; st.outcome = "injury-ended"; }
  }

  return { season, closed: st.done, trade: tradeThisYear };
}

/* ---------- Cooperstown ----------
   Six years of control is a third of a career, so the Hall is decided long after
   he stops being yours. What you get is the odds, set by what he did for you. */
function hofChance(res) {
  if (!res.reachedMLB || res.totalWAR < 15) return 0;
  const hon = res.honors || [];
  const big = hon.filter((h) => h === "MVP" || h === "Cy Young").length;
  const stars = hon.filter((h) => h === "All-Star").length;
  const base = clamp((res.totalWAR - 17) / 22, 0, 1);
  return clamp(base * 0.55 + big * 0.13 + stars * 0.045, 0, 0.92);
}

/* ---------- what the industry thinks of him while he's in your system ---------- */
function prospectGrade(rec) {
  if (rec.st.pubOvr == null) { rec.st.pubOvr = rec.p.isP ? pitOVR(rec.st.g) : hitOVR(rec.st.g); rec.st.pubCeil = rec.p.isP ? pitOVR(rec.st.ceil) : hitOVR(rec.st.ceil); }
  // Prospect lists are about what a player might become, not what he is today.
  // Weighting present ability at half buried every teenager you sign — a first
  // rounder ranked #113 the day he signed, which is nonsense.
  const st = rec.st;
  const ovr = st.pubOvr, cl = st.pubCeil;
  const ageAdj = clamp((23.5 - st.age) * 2.0, -10, 11);
  // being in the low minors is not a demerit when you're eighteen
  const lvlAdj = st.li >= 4 ? 2 : st.li >= 3 ? 1.5 : st.li >= 2 ? 0.5 : 0;
  return 0.32 * ovr + 0.68 * cl + ageAdj + lvlAdj + st.pubNoise;
}
// The old curve saturated: every grade above about 64 came out #1. Steeper, so
// the top of the list is genuinely scarce.
function globalProspectRank(grade) { return clamp(Math.round(Math.exp((72 - grade) / 3.6)), 1, 999); }

/* ---------- the closing accounting, once he's out of your hands ---------- */
function closeRecord(rec) {
  const p = rec.p, st = rec.st, g = st.g;
  let role;
  if (p.isP) {
    role = st.reliefYears === 0 && st.startYears === 0 ? "Never pitched in the majors"
      : st.reliefYears === 0 ? "Starter" : st.startYears === 0 ? "Reliever"
      : st.startYears >= st.reliefYears ? "Starter / swingman" : "Swingman / reliever";
  } else {
    const pa = st.seasonsPlayed ? st.paSum / st.seasonsPlayed : 0;
    role = st.seasonsPlayed === 0 ? "Never played in the majors"
      : pa >= 500 ? `Everyday ${p.pos}` : pa >= 340 ? `Part-time ${p.pos}` : `Bench ${p.pos}`;
  }

  const peakWAR = st.seasons.reduce((a, s) => Math.max(a, s.war || 0), 0);
  let verdict;
  if (st.trade && st.warTotal < 0.2 && st.mlbYears === 0) verdict = "Traded as a prospect. He never played a game for you.";
  else if (st.trade && st.warTotal < 0.2) verdict = "Traded before he contributed anything on the field.";
  else if (st.outcome === "released") verdict = st.mlbYears > 0 ? "Never stuck. Released after a cup of coffee." : "Never made it. Released as a minor league free agent.";
  else if (st.outcome === "injury-ended") verdict = "Career derailed by injuries.";
  else if (peakWAR >= 6) verdict = "Superstar. Perennial MVP candidate.";
  else if (peakWAR >= 4.5) verdict = "All-Star. Cornerstone of the roster.";
  else if (peakWAR >= 3) verdict = "Quality everyday regular.";
  else if (peakWAR >= 1.8) verdict = "Solid regular / second-division starter.";
  else if (peakWAR >= 0.8) verdict = "Useful role player.";
  else if (st.mlbYears >= 2) verdict = "Up-and-down bench piece.";
  else verdict = "Fringe major leaguer.";

  const notes = [];
  const MK = r5(p.makeup);
  const keyTools = p.isP ? ["fb", "brk", "ch", "cmd"] : ["hit", "power", "run", "field", "arm"];
  const finalAvg = keyTools.reduce((a, k) => a + g[k], 0) / keyTools.length;
  const debutAvg = st.debutGrades ? keyTools.reduce((a, k) => a + st.debutGrades[k], 0) / keyTools.length : null;

  notes.push(pick(DEV_STORY[st.devPath]));
  if (st.devPath === "breakout" || st.devPath === "late") {
    if (p.makeup >= 58) notes.push(`Makeup ${MK}. The work ethic was reported as a strength and it showed up — those players convert projection into performance more often.`);
    else if (p.makeup <= 42) notes.push(`Makeup ${MK}, and it happened anyway. Character reports tilt the odds; they don't settle them.`);
  } else if (st.devPath === "stalled" || st.devPath === "flat") {
    if (p.makeup <= 42) notes.push(`Makeup ${MK}. The questions in the background work were the right questions.`);
    else if (p.makeup >= 58) notes.push(`Makeup ${MK} — he did the work. It still didn't come. Effort isn't a guarantee.`);
  }
  if (st.trade) {
    const t = st.trade;
    notes.push((t.pkgSize === 1
      ? `Traded at ${t.age} out of ${t.level}, straight up, for ${t.desc}. The return was valued at ${money(t.dealTotal)} and all of it is credited to you.`
      : `Traded at ${t.age} out of ${t.level} as one of ${t.pkgSize} pieces going out for ${t.desc}. The whole deal was worth about ${money(t.dealTotal)}; he was ${t.share}% of what the other club was buying, so ${money(t.ret)} of it is credited to you.`));
  }
  if (debutAvg != null && finalAvg - debutAvg >= 6)
    notes.push(`He arrived unfinished. He spent the first half of your six years getting there, and you paid for the climb as well as the peak.`);
  if (st.injuryDays >= 240) notes.push(`Lost ${st.injuryDays} days to injury — most of two seasons${st.injuryDamage >= 3 ? ", and the tools never fully came back" : ""}.`);
  else if (st.injuryDays >= 110) notes.push(`Missed ${st.injuryDays} days to injury, which cost him a good chunk of a season.`);
  if (p.isP && st.reliefYears > 0 && st.startYears === 0)
    notes.push(`Relief only. His durability never supported a rotation workload, and sixty innings caps what any arm can be worth.`);
  if (st.posMoves && st.posMoves.length) {
    const m = st.posMoves[st.posMoves.length - 1];
    notes.push(m.up
      ? `Moved up the defensive spectrum from ${m.from} to ${m.to} at ${m.age} — the actions were better than anyone had written down, and the position is worth real runs.`
      : `Moved off ${m.from} to ${m.to}. The bat had to carry more of the profile from that point on.`);
  }
  if (!p.isP && (POS_ADJ[p.pos] ?? 0) <= -7)
    notes.push(`A ${p.pos} has to hit a great deal to be worth anything — the position costs about ${Math.abs(POS_ADJ[p.pos])} runs a year against a shortstop.`);
  if (!p.isP && g.disc <= 42 && g.hit >= 55) notes.push(`He hit for average without walking. A ${r5(g.disc)} approach keeps the on-base number ordinary.`);
  if (st.mlbYears < 6 && st.outcome === "released") notes.push(`The six years of control ran out early — you get no value from years he wasn't on the roster.`);
  if (notes.length <= 1 && peakWAR >= 3) notes.push(`Healthy, played every day, and the tools showed up. This is what it looks like when it works.`);

  return {
    role, verdict, notes, peakWAR: Math.round(peakWAR * 10) / 10,
    honorList: summariseHonors(st.honors), honors: st.honors,
    totalWAR: st.warTotal, totalSalary: st.salTotal, value: Math.round(st.valueEarned * 10) / 10,
    devCost: st.devCost, surplus: st.surplus, mlbYears: st.mlbYears,
    reachedMLB: st.mlbYears > 0, finalGrades: g, debutGrades: st.debutGrades,
    injuryDays: st.injuryDays, trade: st.trade, devPath: st.devPath, outcome: st.outcome,
    years: st.seasons, avgPA: st.seasonsPlayed ? Math.round(st.paSum / st.seasonsPlayed) : 0,
  };
}

const DEV_STORY = {
  generational: [
    `Nothing in the file explains this. He arrived as an ordinary signing and became one of the best players in the sport, and no scout alive saw it coming.`,
    `Once in a career you sign a player who simply becomes someone else. Whatever happened to him in the minor leagues, nobody predicted it and nobody could have.`,
    `The reports on him were fine and entirely beside the point. He rebuilt himself into a player nobody in the industry had graded within twenty points of.`,
  ],
  breakout: [
    `Nobody saw this coming, including you. He added strength and rebuilt his swing in the low minors and turned into a completely different player than the one you signed.`,
    `He outgrew the report. A mechanical change unlocked tools that weren't there on draft day.`,
    `A genuine breakout. Whatever the organisation did with him worked, and he finished well past any grade anyone put on him.`,
  ],
  late: [
    `Nothing for three years, then it clicked. Some players need to be 24 before the ability shows up in games.`,
    `Slow starter. He was overmatched at every level until suddenly he wasn't.`,
  ],
  steady: [`He developed about the way you'd expect from where he started.`],
  stalled: [
    `The development stalled out. He got to a level, stopped improving, and the tools never turned into performance.`,
    `Plateaued in the upper minors. The ability was real; the adjustments never came.`,
  ],
  flat: [
    `He was the same player at 26 that he was at 20. No progress at all.`,
    `Never developed. The tools on draft day were the tools he retired with.`,
  ],
};
