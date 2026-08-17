/* ============================================================
   MORE WAYS TO SAY IT
   The report language was composed as SUBJECT + PREDICATE, with predicates
   written per tool. That caps variety at roughly subjects x predicates, which
   was about thirty lines a band — thin once you have read a few hundred files.

   Three additions here, each of which multiplies rather than adds:
     GENERIC_PRED   predicates that fit any tool, so twelve tools share them
     TAILS          short qualifying clauses that attach to any line
     LEADS          alternative sentence openings that restructure the whole line
   ============================================================ */

const GENERIC_PRED = {
  low: [
    "is well short of a professional tool",
    "is not close to playable",
    "grades out beneath the line and it is not close",
    "would have to change entirely to matter",
    "is the reason he is not a prospect for me",
    "is a real problem and I do not see the fix",
    "will be exposed the moment he leaves this level",
    "is the part of the profile that ends him",
    "is below anything I would sign",
    "does not project to be usable",
    "is the weakest part of a weak profile",
    "is going to have to be rebuilt from nothing",
  ],
  bd: [
    "is fringe and likely to stay there",
    "is a touch under where it needs to be",
    "plays a shade below average and probably always will",
    "is short, though not hopeless",
    "is the tool that keeps him from being a real prospect",
    "is workable but nothing more",
    "is behind, and the clock is running",
    "needs to come a long way to profile",
    "is playable in a pinch and no more",
    "is the part of this that worries me",
    "will hold him back a level or two short",
  ],
  avg: [
    "is average and I do not see much more",
    "is exactly what it is — a big-league-average tool",
    "will play, without ever being the reason he plays",
    "is fine and unremarkable",
    "is solid, ordinary, professional",
    "does the job and nothing beyond it",
    "sits right on the line",
    "is neither the strength nor the problem",
    "is the middle of the scale in every sense",
    "is good enough that nobody will talk about it",
    "grades out squarely average and stable",
    "is a fifty and I would not argue either way",
  ],
  plus: [
    "is a genuine strength",
    "is above average and shows up in games",
    "is comfortably better than the level he is playing at",
    "is a tool I would bet on",
    "is the best part of a good profile",
    "plays up further than the raw grade suggests",
    "is a real weapon at this level",
    "will carry him further than anything else he does",
    "is plus, and it is repeatable",
    "stands out on a field full of prospects",
    "is the reason he is worth a pick",
    "is the sort of tool that survives promotion",
  ],
  elite: [
    "is a legitimate plus-plus tool",
    "is the loudest thing on the field on any given night",
    "is close to the top of the scale",
    "is well beyond what anybody here can handle",
    "is the tool the entire profile is built on",
    "is major-league quality today",
    "separates him from everyone in this class",
    "is the kind of grade I put on a file twice a year",
    "would be a strength in a big-league game tonight",
    "is exceptional and I do not use that word",
  ],
  special: [
    "is the best I have graded in years",
    "is a genuine eighty and I have written very few",
    "belongs in a big-league game right now",
    "is the sort of thing you drive across a state to see again",
    "is historic, and I understand how that reads",
    "is beyond anything else in this class or the last one",
    "is the reason this report exists",
    "would be elite in a professional league today",
  ],
};

// Short clauses that can attach to any observation. Roughly a third of lines
// take one, which multiplies the pool without any per-tool writing.
const TAILS = [
  "at present", "for me", "in this look", "against this level",
  "on the day", "from where I sat", "in two at-bats", "on a cold night",
  "with a pro staff behind him", "given his age", "for a player this young",
  "for what one look is worth", "and I would say the same in June",
  "though the sample was small", "and the room agreed",
];

// Alternative openings. Instead of "The fastball is plus", you get "Plus
// fastball." or "I have the fastball as plus." — same content, different shape.
const LEADS = [
  { w: 0.55, f: (subj, pred) => `${subj} ${pred}.` },
  { w: 0.10, f: (subj, pred) => `I have ${subj.replace(/^The /, "the ")} as something that ${pred}.` },
  { w: 0.09, f: (subj, pred) => `On ${subj.replace(/^The /, "the ")}: it ${pred}.` },
  { w: 0.08, f: (subj, pred) => `${subj} — ${pred}.` },
  { w: 0.07, f: (subj, pred) => `What I saw of ${subj.replace(/^The /, "the ")} is that it ${pred}.` },
  { w: 0.06, f: (subj, pred) => `For my money ${subj.replace(/^The /, "the ")} ${pred}.` },
  { w: 0.05, f: (subj, pred) => `Writing ${subj.replace(/^The /, "the ")} down as something that ${pred}.` },
];

function pickLead() {
  let r = rnd(), acc = 0;
  for (const l of LEADS) { acc += l.w; if (r <= acc) return l; }
  return LEADS[0];
}

// Extra subjects, so the multiplication has more to work with.
const SUBJ_EXTRA = {
  hit: ["The barrel", "The swing decisions", "The timing", "The hands"],
  power: ["The impact", "The pull-side damage", "The exit velocity"],
  run: ["The first step", "The stride", "The closing speed"],
  field: ["The hands", "The footwork", "The instincts", "The first move"],
  arm: ["The release", "The carry", "The throwing motion"],
  disc: ["The strike-zone judgement", "The willingness to take one", "The two-strike approach"],
  fb: ["The ride", "The extension", "The plane"],
  brk: ["The finish on it", "The break", "The snap"],
  ch: ["The separation", "The fade", "The arm-speed deception"],
  cmd: ["The repeatability", "The strike quality", "The misses"],
  delivery: ["The tempo", "The balance", "The direction to the plate"],
  dur: ["The build", "The workload history", "The recovery"],
  frame: ["The build", "The room to fill out", "The athleticism"],
  makeup: ["The work ethic", "The reports from the staff", "The way he carries himself"],
  health: ["The medical", "The history", "The file"],
};
