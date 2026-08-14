/* ============================================================
   SCOUT LANGUAGE, COMPOSED
   A report line is built from three independent sentences: a tool-specific
   observation, a follow-on from the family that tool belongs to, and often a
   piece of evidence. Multiplied out, each tool/band has hundreds of forms, and
   a full report has effectively unlimited ones — so the phrasing can't be
   reverse-engineered into a lookup table.
   ============================================================ */

const FAMILY = { hit: "BAT", power: "BAT", disc: "BAT", run: "ATH", field: "ATH", arm: "ATH",
  fb: "PITCH", brk: "PITCH", ch: "PITCH", cmd: "CTRL", delivery: "CTRL", dur: "CTRL",
  makeup: "CHAR", health: "CHAR", frame: "CHAR" };

const FOLLOW = {
  BAT: {
    elite: ["The barrel is the carrying tool and it isn't close.","I'd take this bat in any organization.","Nothing about the swing needs fixing.","He controls at-bats the way advanced hitters do.","This plays at the top of a good lineup.","You don't need to project — it's already there."],
    plus: ["The bat should carry him wherever the glove ends up.","There's more in here once he's on a real program.","I'd bet on this swing playing at the upper levels.","It's a first-division bat if the rest holds.","Not loud, but it works and it repeats.","The offensive profile is the reason to take him."],
    avg: ["It'll play if everything else does.","I need another look before I'd commit money to the bat.","Average is the honest grade and I don't love guessing higher.","There's a big-league version of this, but it's a bench version.","The bat isn't the reason you take him.","Could tick up with strength; could just as easily stay here."],
    bd: ["The bat is going to be the thing that stops him.","I don't see how this plays above Double-A.","He'll have to be special defensively to carry it.","Better arms are going to expose this quickly.","That's a real hole and I don't have a fix for it.","This is the part of the profile I can't talk myself into."],
    low: ["I can't write this bat up as playable.","There's no version of this that hits professional pitching.","The offensive profile is a non-starter for me.","This alone takes him off my board.","I'd need a total rebuild and I don't see the aptitude for it.","He was overmatched and it wasn't close."],
  },
  ATH: {
    elite: ["The athleticism is genuinely rare.","This is a premium defender at a premium spot.","He'd be a weapon in the field on a championship club.","Nothing about the position bothers him.","It's a plus-plus tool and it's easy.","Defense alone would get him to the big leagues."],
    plus: ["He stays at the position without question.","The tools play up because the instincts are good.","Comfortable, athletic, under control.","I'd leave him where he is and let the bat catch up.","Better than average and it should hold as he fills out.","This part of the profile is a strength."],
    avg: ["He'll be fine there, nothing more.","Playable, but it's not a reason to take him.","Average tools with average instincts.","He might have to move eventually, but not yet.","Adequate is the word I'd use.","No strong feelings either way on this one."],
    bd: ["A move down the defensive spectrum is coming.","The body is going to decide this for him.","He'll be hidden somewhere rather than featured.","This is a corner profile before long.","The tools here are going backwards, not forwards.","It's fringe now and it won't get better."],
    low: ["He can't play the position and probably can't play the next one either.","This is a bat-only profile and the bat had better be enormous.","Well below the line, and it limits every option.","There's no defensive home I feel good about.","The tools are simply not professional grade here.","It's a real liability, not a small one."],
  },
  PITCH: {
    elite: ["It's a big-league out pitch today.","Good hitters will not touch this.","This is the pitch you build the arsenal around.","Front-of-the-rotation quality.","No projection required — it plays now.","Advanced hitters had no answer for it."],
    plus: ["It should miss bats at the upper levels.","Above-average and he trusts it in any count.","There's another half-grade in here with pro coaching.","It gives him a second real weapon.","Consistent shape, and he knows what it does.","I'd start him and let this pitch carry the profile."],
    avg: ["Usable, not a weapon.","It'll get outs at the lower levels and get hit later.","Fine as a third pitch, not as a second.","He'll need something else to headline.","Average is where I have it and I'd want another look.","It flashes better than it plays."],
    bd: ["It's a show-me pitch and hitters treated it that way.","Below average and inconsistent on top of it.","This is why I have him in the bullpen long-term.","He doesn't trust it and neither would I.","It backs up too often to count on.","Real development need here."],
    low: ["He does not have this pitch.","It's not a professional offering in any sense.","Hitters weren't fooled once.","This has to be built from scratch.","Bottom of the scale and no feel for it.","Nothing here to work with yet."],
  },
  CTRL: {
    elite: ["He pitches. He doesn't just throw.","This is what separates him from every other arm in the state.","Everything else plays up because of it.","Advanced beyond his age by a wide margin.","I'd be comfortable putting him in full-season ball tomorrow.","There is no reliever risk in this profile."],
    plus: ["The delivery supports it holding.","He should stay in the rotation.","Repeats well enough that I'm not worried.","This is a starter's operation.","It's a strength and it should keep improving.","Clean enough that a pro staff won't need to touch much."],
    avg: ["It's fine. It's also the thing most likely to decide his role.","Around the zone, not in it — that's the difference.","He'll walk more than you want but survive it.","Average here caps the ceiling somewhat.","Some cleanup work and this could tick up.","I'd want to see it against better lineups."],
    bd: ["This is the reason he ends up in a bullpen.","Below average and the delivery isn't helping.","He loses it under stress, which is when it matters.","Big development need and no guarantee it comes.","The stuff is ahead of the ability to use it.","I'd discount the whole profile because of this."],
    low: ["He has no idea where it's going.","This is not a professional strike-thrower.","It's the reason he's available and it's a good reason.","Nothing repeats. Nothing is on line.","Well below the line and I don't see a path.","I couldn't project a role for him as is."],
  },
  CHAR: {
    elite: ["Everything on the makeup side checks out.","This is the kind of background report you rarely get.","Nothing here gives me pause.","I'd feel good handing him to a development staff.","No concerns whatsoever.","People go out of their way to say good things."],
    plus: ["No red flags from anybody I spoke to.","The reports are clean and consistent.","Nothing that would change my number.","Solid on this front.","No reason for concern.","Everyone I asked said the same thing."],
    avg: ["Nothing notable in either direction.","Standard for the level.","No one volunteered anything, good or bad.","I'd call it neutral.","Nothing that moves my grade.","About what you'd expect."],
    bd: ["Enough smoke that I'd want a second conversation.","It's a discount, not a disqualification.","Somebody should dig further before we commit money.","I'd want the front office aware of this.","It gives me some pause.","Not fatal, but it's on the file."],
    low: ["I would not spend real money here.","This is a genuine problem, not a small one.","Multiple sources, same story. That's usually enough.","I'd take him off the board over this.","It's the sort of thing that ends careers before they start.","This changes my recommendation entirely."],
  },
};

const EVIDENCE = {
  hitter: {
    elite: ["Two of the hardest-hit balls I've seen from an amateur this spring.","He beat a plus breaking ball for a double the other way.","Every at-bat was competitive, including the outs.","The best player on the field by a distance, and there were pro arms out there.","I've seen him four times now and there's no bad look in the group.","He got better as the game went on."],
    plus: ["Three good at-bats out of four.","He fought off two tough pitches before doing damage.","Handled velocity fine and only got beat once.","Nothing cheap about the way he got his hits.","Made an adjustment between at-bats, which I liked.","Squared up the best arm they had."],
    avg: ["Mixed bag — one good at-bat, two forgettable ones.","Small sample and I wouldn't read much into it.","The competition wasn't much, so discount accordingly.","He didn't do anything to change my mind either way.","Cold night, ball wasn't carrying, hard to evaluate damage.","I'd want to see him against better arms."],
    bd: ["Two punchouts on the same pitch in the same spot.","He never looked comfortable in the box.","The good at-bat came against a position player pitching.","Nothing loud, and the outs were weak.","He got exposed once the velocity ticked up.","Second time through, the pitcher had figured him out."],
    low: ["Four at-bats, four uncomfortable ones.","He was late on everything and guessing by the end.","No competitive contact all night.","I left after the fifth. I'd seen enough.","Overmatched by an ordinary high school arm.","The at-bats got worse as the game went on."],
  },
  pitcher: {
    elite: ["He struck out the side twice and it looked routine.","The stuff was the same in the sixth as it was in the first.","Faced a legitimate lineup and made them look silly.","Best arm I've seen in the region in some time.","Third look, third dominant outing.","Only hard contact all night came on a mistake he immediately corrected."],
    plus: ["Worked efficiently and got stronger as it went.","Held it through five and never lost the zone.","Good lineup, and he handled them.","No panic when he got in trouble, which I liked.","Second look confirmed the first.","The one inning he got hit, it was on him, not the stuff."],
    avg: ["Middling competition, so weigh it accordingly.","Fine through four, then it got away from him.","Nothing that changed my grade in either direction.","Small sample — I only saw three innings.","Cold and windy, tough conditions to judge feel.","He was fine. That's the whole report."],
    bd: ["The third inning got ugly and he didn't recover.","He lost the zone entirely once he got in trouble.","Ordinary hitters were squaring him up.","Threw 40 pitches in one inning.","The stuff backed up noticeably after the second.","Body language went south when things went wrong."],
    low: ["He didn't finish the second inning.","Nothing was competitive after the first time through.","Walked four in three innings and it wasn't close.","I've seen him twice now and both were like this.","The lineup he faced was not good and they hit him anyway.","Everything was up and over the middle."],
  },
};


// Appended to roughly half of all lines. Band-agnostic, so it carries no
// information about the grade — it exists purely to break up the phrasing.
const QUALIFIERS = [
  "That's one look, for whatever it's worth.",
  "I'd want to see it again before I put it in writing.",
  "Second look confirmed the first.",
  "Reserve the right to change my mind on this one.",
  "Talk to the area guy before you weight this heavily.",
  "I've had him three times now and it's been consistent.",
  "Take the sample size into account.",
  "This is the part I'd want a cross-checker on.",
  "Conditions were fine, no excuses either way.",
  "He knew he was being watched, which cuts both ways.",
  "I saw him earlier in the spring and he looked different.",
  "The coaching staff sees it the same way I do.",
  "Everyone in the section had the same reaction.",
  "I was the only scout there, which tells you something.",
  "Twenty-odd scouts behind the plate, so the market knows.",
  "Note that he'd been sick the week before.",
  "Long season and it showed a little.",
  "Nothing here I haven't seen from him before.",
];

// A handful of extra openers for the tools that come up most often, so the
// highest-traffic bands don't wear out first.
const EXTRA = {
  hit: {
    elite: ["Hands work like a big leaguer's. He's late on nothing.", "Barrel accuracy is the best in this class, full stop.", "He can beat you inside and still cover the outer half."],
    plus: ["Direct path, minimal wasted movement, good rhythm.", "He takes what's given and doesn't try to do too much.", "Balanced through contact, which is why the contact is good."],
    avg: ["Swing is fine in a vacuum; the timing is what wavers.", "He'll run into good ones and miss ordinary ones.", "The path is okay, the decisions are the issue."],
    bd: ["He commits early and can't get out of it.", "The swing gets long the moment he tries to do damage.", "Too much movement in the load for pro velocity."],
    low: ["He guessed on every pitch and guessed wrong.", "No barrel awareness at all in this look.", "The swing has a hole you could drive through."],
  },
  power: {
    elite: ["Top-of-the-scale raw and it shows up in games, not just BP.", "He backspins it to all fields without selling out.", "The sound off the bat is different from everyone else's."],
    plus: ["Gets to it in games, which is the part that matters.", "Strength is real and there's more coming.", "He drives the ball with intent and it carries."],
    avg: ["Doubles power that might become homer power with weight.", "He hits it hard sometimes and softly often.", "Enough juice to be respected, not enough to be feared."],
    bd: ["Warning-track power at best right now.", "He needs to add real strength for this to play.", "The contact is honest but it isn't hard."],
    low: ["No damage on contact at any point.", "He's not strong enough to be a professional hitter yet.", "Nothing left the infield with authority."],
  },
  fb: {
    elite: ["Explodes out of the hand and hitters were swinging under it all night.", "Premium velocity that he holds without effort.", "The heater alone would get big-league outs today."],
    plus: ["Firm, with life, and he can add when he needs it.", "Comfortable velocity and it plays up with extension.", "Good angle, and hitters were consistently behind it."],
    avg: ["Velocity is present, characteristics are not.", "Fine when located, hit hard when not.", "He'll need the secondaries to carry the profile."],
    bd: ["It's straight, and straight at this speed gets hit.", "Backed up in a hurry once he'd been through the order.", "Hitters were comfortable from the first inning."],
    low: ["There isn't enough here to project a professional role.", "Every fastball was hittable and most were hit.", "Velocity is bottom-of-the-scale with no deception."],
  },
  cmd: {
    elite: ["He located to both edges on demand all night.", "Never missed over the middle, not once.", "He set hitters up two pitches ahead."],
    plus: ["Around the zone with everything, misses in safe spots.", "Repeats his slot and it shows in the strike rate.", "Works ahead and stays ahead."],
    avg: ["In the zone often enough, in the right part of it less often.", "Control ahead of command, which is normal at this age.", "Fine until he had to make a pitch."],
    bd: ["He lost the zone entirely in one inning.", "The misses are big and they're over the plate.", "Nibbles when he's behind, which compounds it."],
    low: ["No idea where it was going and neither did the catcher.", "Walked the ballpark and hit a batter for good measure.", "The delivery has no chance of repeating."],
  },
  brk: {
    elite: ["Genuine put-away pitch with power and depth.", "He lands it for strikes and buries it when he wants a chase.", "Two-plane break that hitters never picked up."],
    plus: ["Real shape and he trusts it behind in the count.", "Sharp, late, and consistent from pitch to pitch.", "It misses bats now and should keep improving."],
    avg: ["Gets it over, doesn't get swings and misses.", "Shape varies from one to the next.", "Serviceable, not a weapon."],
    bd: ["Slurvy and telegraphed by the arm speed.", "Hitters laid off it comfortably.", "It rolls more than it breaks."],
    low: ["He cannot spin a baseball right now.", "Non-competitive as an offering.", "Out of the hand early every time."],
  },
};
for (const t in EXTRA) for (const b in EXTRA[t]) T[t][b] = T[t][b].concat(EXTRA[t][b]);

const TOOL_LABEL = { hit: "the hit tool", power: "raw power", run: "speed", field: "defence", arm: "arm strength",
  disc: "plate discipline", fb: "velocity", brk: "spin", ch: "changeups", cmd: "command", delivery: "clean deliveries", dur: "durability" };

const SCOUT_FIRST = ["R.", "D.", "T.", "J.", "M.", "W.", "C.", "E.", "L.", "P.", "B.", "H.", "K.", "A.", "G.", "S."];
const SCOUT_LAST = ["Deakins", "Mancuso", "Bradbury", "Okafor", "Fiore", "Hollis", "Rasmussen", "Petrelli", "Vaughn", "Ackerman", "Salgado", "Doyle", "Whitcomb", "Baird", "Ferraro", "Nakamura", "Grieve", "Lindqvist", "Boone", "Castellano", "Ruiz", "Tremblay", "Ashby", "Pileggi", "McCandless", "Ojeda", "Sturdivant", "Bellinger", "Halloway", "Guerra"];
function scoutName() { return `${pick(SCOUT_FIRST)} ${pick(SCOUT_LAST)}`; }

// Build one observation. Tool sentence + family follow-on + optional evidence.
function scoutLine(tool, obsGrade, isP, withEvidence, p) {
  const b = band(obsGrade);
  // Never hand the same judgement to the same player twice — that is what makes
  // a file feel copy-pasted even when the pools are large.
  let core = coreLine(tool, b);
  if (p) {
    p.usedLines = p.usedLines || [];
    for (let i = 0; i < 10 && p.usedLines.indexOf(core) !== -1; i++) core = coreLine(tool, b);
    p.usedLines.push(core);
    if (p.usedLines.length > 80) p.usedLines.shift();
  }
  // Only the lead observation earns a summarising follow-on. Letting every tool
  // draw one is how a report ends up arguing with itself.
  const fam = FOLLOW[FAMILY[tool] || "BAT"][b];
  const follow = withEvidence && rnd() < 0.55 ? pick(fam) : null;
  return [core, follow].filter(Boolean).join(" ");
}

/* ============================================================
   COMPOSED CORE OBSERVATIONS
   The opening sentence is the one that carries the judgement, so it can't come
   from a pool of five. Subject x predicate, both tool-specific, so the sentence
   that matters is built rather than retrieved.
   ============================================================ */
const SUBJ = {
  hit: ["The swing", "The barrel", "The bat path", "The hand speed", "The load", "The trigger", "Bat control", "The move to the ball"],
  power: ["The raw power", "The leverage", "The contact quality", "The bat speed", "The carry", "The damage on contact"],
  run: ["The speed", "The first step", "The gait", "The closing speed", "The straight-line run", "The acceleration"],
  field: ["The glove", "The footwork", "The first-step read", "The hands", "The actions", "The internal clock", "The body control"],
  arm: ["The arm", "The arm strength", "The transfer", "The arm action"],
  disc: ["The approach", "The zone judgement", "The pitch recognition", "The plan in the box", "The chase rate", "The two-strike approach"],
  fb: ["The fastball", "The heater", "The four-seam", "The life on the fastball"],
  brk: ["The breaking ball", "The spin", "The shape", "The slider", "The tilt", "The bite"],
  ch: ["The changeup", "The arm speed on the change", "The fade", "The separation", "The feel for the change", "The tumble"],
  cmd: ["The command", "The strike-throwing", "The location", "The ability to repeat", "The feel for the zone"],
  delivery: ["The delivery", "The arm action", "The operation", "The direction to the plate", "The tempo", "The front side"],
  dur: ["The durability", "The workload history", "The stamina", "The body", "The frame's ability to hold up", "The late-game stuff"],
};
const PRED = {
  hit: {
    elite: ["is genuinely special and I don't say that", "gets on plane early and never leaves it", "beats velocity and spin with the same move", "is the best in this class by a distance", "would play in the big leagues right now"],
    plus: ["works, repeats, and holds up against good arms", "is short, direct, and under control", "produces consistent hard contact", "should let him hit at any level", "is well ahead of his peer group"],
    avg: ["is fine in a vacuum and shaky under pressure", "gets there but not efficiently", "plays average and might not play more", "is inconsistent from at-bat to at-bat", "works against fastballs and nothing else"],
    bd: ["breaks down against real velocity", "is long and gets longer with two strikes", "leaves him vulnerable in on the hands", "is a genuine problem at this level already", "won't survive Double-A arms"],
    low: ["is not close to professional quality", "has a hole you can see from the parking lot", "collapses the moment he's challenged", "would need rebuilding from the ground up", "is the reason nobody is on him"],
  },
  power: {
    elite: ["is double-plus and it shows up in games", "produces damage nobody else here can", "is the loudest tool on the field", "could carry the profile on its own", "is elite by any standard I use"],
    plus: ["shows up in competition, not just in the cage", "should be plus once he's filled out", "shows up against good arms, not just BP", "is the tool the whole profile leans on", "is above average today with more coming"],
    avg: ["is gap power more than home run power", "shows in batting practice and hides in games", "is ordinary and likely stays ordinary", "won't scare anybody but plays", "waits on physical development that hasn't come"],
    bd: ["is below the line and going nowhere", "produces soft contact more often than not", "is a real limitation for a corner profile", "doesn't threaten pitchers at all", "is going to cap him as an extra man"],
    low: ["is a non-tool at this point", "produces nothing on contact", "is the worst I've graded this spring", "makes the whole offensive profile untenable", "has no chance of playing professionally"],
  },
  run: {
    elite: ["is top-of-the-scale and changes innings", "is a weapon on the bases and in the gaps", "is elite and he knows how to use it", "is the fastest I've clocked this spring", "affects how the defense has to play him"],
    plus: ["plays above average underway", "is a genuine base-stealing threat", "helps him at the position and on the bases", "is comfortably above the line", "gets him to balls other people don't reach"],
    avg: ["is average and probably declines from here", "is fine, nothing more", "won't hurt him or help him much", "plays a tick under once he fills out", "is unremarkable in both directions"],
    bd: ["is fringe now and heading down", "limits his defensive options already", "is heavy out of the box", "won't be a factor at the next level", "costs him on both sides of the ball"],
    low: ["is bottom of the scale", "is a genuine liability", "already limits him to a corner", "puts him on a designated hitter track", "is the worst part of an already thin profile"],
  },
  field: {
    elite: ["is a plus-plus weapon at a premium spot", "makes plays nobody else on the field makes", "is why he'll get to the big leagues regardless of the bat", "is as good as I've seen at the position", "would play in the majors tomorrow"],
    plus: ["is clean, quiet, and reliable", "keeps him at the position long-term", "shows real instincts on top of the tools", "is comfortably above average", "is ahead of the bat and will carry him early"],
    avg: ["makes the routine play and not much else", "is adequate for now, questionable later", "is average with average instincts", "will get exposed at higher levels", "keeps him there without distinguishing him"],
    bd: ["is going to force a move off the position", "gets sloppy the moment he's rushed", "is a step slow on anything to the side", "won't hold up under a full season's workload", "is the reason I've got him at a corner"],
    low: ["is a real liability wherever he plays", "cost his team runs in the game I saw", "leaves no defensive home I'm comfortable with", "is well below professional standard", "makes this a bat-only proposition"],
  },
  arm: {
    elite: ["is a cannon and it's accurate too", "changes how the other team runs the bases", "is double-plus from any slot", "produced the best throw I've seen this spring", "is a legitimate weapon"],
    plus: ["is strong with real carry", "plays above average on the move", "gets rid of it quickly and accurately", "supports him staying on the left side", "is a genuine strength of the profile"],
    avg: ["is accurate without being strong", "is playable and unremarkable", "does the job and no more", "could tick up with strength work", "is fine for the position, not for a move"],
    bd: ["loses steam on anything long", "will get tested and beaten by runners", "limits which positions are open to him", "is fringe and the action is slow", "requires a crow-hop he doesn't have time for"],
    low: ["is a non-tool and closes off most of the field", "isn't enough to make the throw from the hole", "is well below the line with a long action", "restricts him to first base or left", "was exposed twice in the game I saw"],
  },
  disc: {
    elite: ["is exceptional for the age", "means he controls the at-bat from pitch one", "kept him off everything out of the zone", "is more advanced than most Double-A hitters", "is the quiet reason the bat works"],
    plus: ["is well above average", "lets him hunt a pitch and wait for it", "shows in the walk totals and the counts", "keeps him out of bad swings", "is a real asset alongside the bat"],
    avg: ["is ordinary — he'll chase some spin", "is aggressive early, passive late", "won't add or subtract much", "is average and stable", "leaves him vulnerable to a plan"],
    bd: ["means he expands the zone badly", "will be exploited by anyone with a breaking ball", "produces at-bats that end in three pitches", "is a real hole on top of the swing", "is going to cap the on-base ability"],
    low: ["is nonexistent — he swung at everything", "makes any hit tool grade academic", "is bottom of the scale", "means pitchers never have to throw a strike", "is the single biggest problem here"],
  },
  fb: {
    elite: ["is a weapon on its own", "gets swings and misses at the top of the zone all night", "holds deep into the outing without dropping", "is premium, with real life on top of it", "would miss big-league bats today"],
    plus: ["has real life and finishes", "sits comfortably above average and touches more", "plays up further because of the extension", "gives him a pitch he can beat hitters with", "held through five without a dip"],
    avg: ["is straight and gets hit when it's middle", "is present without being a weapon", "will need the secondaries to carry it", "sits average and plays a tick under", "is fine located and punished when it isn't"],
    bd: ["backed up noticeably in the third", "is hittable and hitters knew it", "doesn't have the velocity or the shape", "leaves too much of the plate", "isn't enough to profile as a starter"],
    low: ["is well below professional velocity", "was squared up by ordinary hitters", "is straight, with nothing to hide it", "would need a physical transformation", "is the reason I can't project a role"],
  },
  brk: {
    elite: ["is a genuine put-away pitch", "is one he can land for a strike or bury at will", "produced swings and misses all night", "has power and depth both", "is the best breaking ball in this class"],
    plus: ["is sharp and repeats pitch to pitch", "misses bats now and should keep improving", "is one he trusts behind in the count", "has real shape and consistent finish", "gives him a legitimate second weapon"],
    avg: ["gets over for a strike without missing bats", "varies in shape from one to the next", "is usable as a third pitch, not a second", "flashes better than it plays", "is average and inconsistent"],
    bd: ["rolls out of the hand and hitters spit on it", "is telegraphed by the change in arm speed", "backs up more often than it finishes", "is a show-me offering at best", "needs to be rebuilt entirely"],
    low: ["barely exists as a pitch", "was non-competitive every time he threw it", "has no depth and no consistency", "is bottom of the scale spin", "gives him no second pitch at all"],
  },
  ch: {
    elite: ["is a legitimate plus-plus offering", "tumbles late off identical arm speed", "is one he'll throw to both handedness in any count", "is his best secondary and it isn't close", "disappears at the plate"],
    plus: ["has real fade and he sells it", "shows advanced feel for his age", "gives him a third pitch that plays", "comes with good separation off the heater", "is above average and improving"],
    avg: ["is firm but usable", "is a first-pitch offering more than a weapon", "flashes average with poor consistency", "is fine as a change of pace", "does enough to turn a lineup over"],
    bd: ["is given away by the arm speed", "comes in too firm and too flat", "is one he clearly doesn't trust", "is behind the other two by a wide margin", "points toward a bullpen role"],
    low: ["is not a professional offering", "went unused apart from two non-competitive attempts", "has no fade and no deception", "would have to be built from nothing", "makes him a two-pitch reliever"],
  },
  cmd: {
    elite: ["is exceptional and it's the carrying tool", "let him work both edges at will", "meant he never missed over the middle", "is why everything else plays up", "is advanced beyond anything at this level"],
    plus: ["is above average and repeatable", "keeps him ahead in counts consistently", "means his misses are in safe places", "supports a starter's profile", "is a genuine strength"],
    avg: ["is really just control at this stage", "puts him around the zone but not in it", "wavers the moment he's under stress", "is average and probably caps the ceiling", "will produce more walks than you want"],
    bd: ["deserted him entirely in one inning", "produces big misses over the plate", "is well behind the stuff", "is the reason I project relief", "cost him the outing I saw"],
    low: ["is not professional grade", "meant four walks in three innings", "has no consistency pitch to pitch", "is the reason he's still available", "makes any role projection impossible"],
  },
  delivery: {
    elite: ["is clean, on-line, and effortlessly repeated", "produces low-effort velocity", "has nothing in it a pro staff would change", "is as athletic as any in this class", "should hold up under a full workload"],
    plus: ["is clean with good extension", "repeats well enough to project command", "supports a rotation role", "works from a stable base", "needs only minor cleanup"],
    avg: ["works but doesn't repeat consistently", "has some head movement and drift", "loses its line under stress", "is functional without being clean", "will need attention from a pro staff"],
    bd: ["carries effort and recoil", "lands closed with the arm dragging behind", "raises real command and health questions", "screams reliever to me", "doesn't repeat pitch to pitch"],
    low: ["is violent and unrepeatable", "would worry any medical staff", "falls off hard with no direction", "is the biggest red flag in the profile", "has to be rebuilt before anything else"],
  },
  dur: {
    elite: ["is that of a genuine innings horse", "held the stuff to pitch 100 without a drop", "supports 180 innings a year", "is ideal for a rotation", "is the best part of a very good profile"],
    plus: ["should handle a starter's workload", "held velocity deep into the outing", "is supported by a strong build", "shows in a healthy workload history", "is comfortably above average"],
    avg: ["backed up a tick the third time through", "supports five innings, not seven", "is ordinary for the level", "raises mild questions about a rotation role", "is adequate and no more"],
    bd: ["fell off sharply after sixty pitches", "points to a relief role", "is limited by a slight frame", "shows in a thin workload history", "won't support a starter's innings"],
    low: ["collapsed in the third inning", "makes this a one-inning arm", "is the lowest I've graded this spring", "means he's never thrown a real workload", "rules out anything but short relief"],
  },
};

function coreLine(tool, b) {
  if (!PRED[tool] || !SUBJ[tool] || rnd() < 0.30) return pick(T[tool][b]);
  return `${pick(SUBJ[tool])} ${pick(PRED[tool][b])}.`;
}


/* ---------- your permanent area staff ----------
   These are your employees for thirty years. Each carries a habit: an overall
   lean high or low, one tool he falls in love with, one he never trusts. You
   are never told what it is. You work it out from watching his reports fail. */
const HIT_TOOLS = ["hit", "power", "run", "field", "arm", "disc"];
const PIT_TOOLS = ["fb", "brk", "ch", "cmd", "delivery", "dur"];
// A scout isn't uniformly noisy. Every one of them sees some kind of player
// more clearly than the rest of your staff — and some kind of player worse.
const DOMAIN_TOOLS = {
  bats: ["hit", "power", "run", "field", "arm", "disc"],
  arms: ["fb", "brk", "ch", "cmd", "delivery", "dur"],
  phys: ["power", "run", "arm", "fb", "frame"],
  feel: ["hit", "cmd", "ch", "disc", "brk"],
  char: ["makeup", "health", "frame"],
};
const DOMAINS = ["bats", "arms", "phys", "feel", "char", "young", "polish"];
const DOMAIN_LABEL = { bats: "position players", arms: "pitchers", phys: "physical tools",
  feel: "feel and skill", char: "character and medicals", young: "high schoolers and 16-year-olds",
  polish: "college players" };
function domainHit(dom, tool, p) {
  if (dom === "young") return p.origin === "HS" || p.origin === "INTL";
  if (dom === "polish") return p.origin === "COL" || p.origin === "JUCO";
  return (DOMAIN_TOOLS[dom] || []).indexOf(tool) !== -1;
}

function makeScout(quality) {
  const all = HIT_TOOLS.concat(PIT_TOOLS);
  const pet = pick(all);
  let blind = pick(all);
  while (blind === pet) blind = pick(all);
  const sharp = pick(DOMAINS);
  let weak = pick(DOMAINS);
  while (weak === sharp) weak = pick(DOMAINS);
  return { name: scoutName(), bias: Math.round(clamp(gauss(0, Math.max(1.6, 4.6 - 1.0 * (quality || 0))), -7, 7) * 10) / 10,
    pet, blind, sharp, weak, filed: 0 };
}
function scoutTendency(sc) {
  const parts = [];
  parts.push(sc.bias >= 2.2 ? "grades the whole board a touch high"
    : sc.bias <= -2.2 ? "grades conservatively across the board"
    : "grades honestly overall");
  parts.push(`falls in love with ${TOOL_LABEL[sc.pet] || sc.pet}`);
  parts.push(`never trusts ${TOOL_LABEL[sc.blind] || sc.blind}`);
  let out = parts.join(", ") + ".";
  if (sc.sharp) out += ` Sees ${DOMAIN_LABEL[sc.sharp]} more clearly than anyone else on staff; least reliable on ${DOMAIN_LABEL[sc.weak]}.`;
  return out;
}

/* ---------- the very top of the scale gets its own language ---------- */
const SPECIAL_PRED = {
  hit: ["is the best I have graded in a decade", "makes professional pitching look slow", "is a genuinely historic ability to hit", "belongs in a big-league batting order today"],
  power: ["is the loudest I have ever put a number on", "is top-of-the-scale and it plays in games", "would lead a professional league in home runs", "produces contact I have not seen from an amateur"],
  run: ["is the quickest I have ever timed", "is an 80 runner and it is not close", "changes a game the instant he reaches", "would be elite even in a professional league"],
  field: ["is the finest I have scouted anywhere", "would win Gold Gloves in the big leagues now", "makes plays that do not exist for anyone else", "is worth watching for the defence alone"],
  arm: ["is the best in this class by a distance", "is a genuine 80 and hitters know it", "ends a running game by itself", "is the finest I have seen at the position"],
  disc: ["is the most disciplined amateur hitter I have covered", "controls the strike zone like a ten-year veteran", "simply does not expand, ever", "is elite and essentially finished already"],
  fb: ["is the best in this class and possibly any recent one", "is a genuine 80 with life on top of the velocity", "would be a big-league out pitch tonight", "is the sort of pitch you see once in a career"],
  brk: ["is the best I have ever graded", "is unhittable and he knows exactly where it is going", "is a professional put-away pitch already", "would miss big-league bats today"],
  ch: ["is the finest I have seen from an amateur", "is a genuine 80 offering with the same arm speed", "disappears entirely at the plate", "is better than most in the big leagues already"],
  cmd: ["is the best I have graded at any level of amateur ball", "would be a strength in a big-league rotation", "means he has never missed his spot in three looks", "is finished, professional pitching ability"],
  delivery: ["is flawless and utterly repeatable", "is the cleanest in this class", "will never need a pro staff to touch it", "is elite athleticism on the mound"],
  dur: ["is a genuine two-hundred-inning build", "is the most durable arm in this class", "has never missed a start in four years", "will handle any workload asked of him"],
};
for (const t in SPECIAL_PRED) if (PRED[t]) PRED[t].special = SPECIAL_PRED[t];
// anything without bespoke top-of-scale language falls back to elite
for (const t in T) if (!T[t].special) T[t].special = T[t].elite;
for (const f in FOLLOW) if (!FOLLOW[f].special) FOLLOW[f].special = FOLLOW[f].elite;
for (const k in EVIDENCE) if (!EVIDENCE[k].special) EVIDENCE[k].special = EVIDENCE[k].elite;
for (const t in PRED) if (!PRED[t].special) PRED[t].special = PRED[t].elite;
for (const t in SUBJ) { /* subjects are band-independent */ }

/* ---------- qualifiers that can only be true on a repeat visit ---------- */
const QUALIFIERS_REPEAT = [
  "Second look confirmed the first.",
  "I've had him three times now and it's been consistent.",
  "I saw him earlier in the spring and he looked different.",
  "Nothing here I haven't seen from him before.",
];
const QUALIFIERS_FIRST = [
  "That's one look, for whatever it's worth.",
  "I'd want to see it again before I put it in writing.",
  "Reserve the right to change my mind on this one.",
  "Talk to the area guy before you weight this heavily.",
  "Take the sample size into account.",
  "This is the part I'd want a cross-checker on.",
  "Conditions were fine, no excuses either way.",
  "He knew he was being watched, which cuts both ways.",
  "The coaching staff sees it the same way I do.",
  "Everyone in the section had the same reaction.",
  "I was the only scout there, which tells you something.",
  "Twenty-odd scouts behind the plate, so the market knows.",
  "Long season and it showed a little.",
];

// A report is one man describing one afternoon. The evidence and the caveat
// belong to the report, not to each tool — that is what stopped them agreeing
// with each other.
function reportCloser(p, isP, overallGrade, repeatVisit) {
  const out = [];
  if (rnd() < 0.72) out.push(pick(EVIDENCE[isP ? "pitcher" : "hitter"][band(overallGrade)]));
  if (rnd() < 0.34) out.push(pick(repeatVisit ? QUALIFIERS_REPEAT : QUALIFIERS_FIRST));
  return out;
}
