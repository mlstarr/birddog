

/* ============================================================
   BIRDDOG — an amateur scouting sim
   ============================================================ */

/* ---------- math / rng ---------- */
const rnd = () => Math.random();
const ri = (a, b) => Math.floor(a + rnd() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function gauss(mu = 0, sd = 1) {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function pickN(arr, n) {
  const c = [...arr];
  const out = [];
  while (out.length < n && c.length) out.push(c.splice(Math.floor(rnd() * c.length), 1)[0]);
  return out;
}
const r5 = (v) => Math.round(clamp(v, 20, 80) / 5) * 5;
const money = (m) => (m >= 1000 ? `$${(m / 1000).toFixed(2)}B` : m >= 1 ? `$${m.toFixed(1)}M` : `$${Math.round(m * 1000)}K`);
const moneyK = (m) => (m >= 1 ? `$${m.toFixed(2)}M` : `$${Math.round(m * 1000)}K`);

/* ---------- names ---------- */
const US_FIRST = ["Jace","Tucker","Rhett","Colton","Brayden","Beau","Landry","Kade","Grayson","Wyatt","Cade","Braxton","Camden","Levi","Knox","Easton","Sawyer","Nolan","Bennett","Micah","Zane","Rowan","Dax","Ryder","Tate","Marcus","Elijah","Malik","Xavier","Terrance","DeShawn","Jamal","Isaiah","Amir","Jaylen","Quinton","Darius","Trevon","Emmett","Silas","Holden","Brooks","Porter","Lane","Crew","Judd","Cormac","Hayes","Finnegan","Deacon","Wilder","Bo","Rocco","Vance","Griffin","Sullivan","Maddox","Ellis","Ozzie","Trey"];
const US_LAST = ["Ashworth","Bellamy","Crandall","Dunbar","Eldridge","Halloran","Kestler","Ledbetter","Mabry","Norquist","Ormsby","Pruitt","Quimby","Rademacher","Stapleton","Thornbury","Ulmer","Vandergriff","Wexler","Yarborough","Ziemba","Boughton","Calloway","Dellinger","Fenwick","Gundersen","Hollinger","Iverson","Jergens","Kilbride","Lattimore","McQuiston","Nesmith","Overstreet","Pickering","Rothgeb","Sizemore","Tackett","Vandiver","Whitmarsh","Applegate","Brumfield","Cardwell","Dorsett","Ferrell","Grissom","Huddleston","Ingersoll","Jessup","Kirkendall","Loughlin","Mattson","Northcutt","Peavey","Quarles","Rundle","Stallings","Tillman","Wagoner","Yeager"];
const LATIN_FIRST = ["Yordani","Wilmer","Yeison","Adonis","Ederlyn","Elvin","Kelvin","Jhoan","Deivi","Yoendrys","Cristian","Franklin","Wilfredo","Osiris","Yandel","Dariel","Yohandry","Enmanuel","Braylin","Randy","Junior","Alberto","Starlin","Miguelangel","Yariel","Leonardo","Anderson","Wandy","Fredy","Jeisson","Ramón","Aneudy","Elian","Yohan","Darvin"];
const LATIN_LAST = ["Peralta","Ureña","Batista","Cabral","Mejía","Almonte","Tavárez","Encarnación","De León","Guzmán","Cedeño","Núñez","Polanco","Solano","Difo","Terrero","Valdez","Aybar","Rosario","Beltrán","Carrasco","Duvergé","Espinal","Familia","Gómez","Herrera","Inoa","Jiménez","Lantigua","Montero","Ovalles","Paulino","Quezada","Rincón","Sención","Tejada","Veras","Ynoa","Zapata","Arístides"];
const ASIA_FIRST = ["Kaito","Ren","Sora","Haruto","Yuto","Riku","Min-jun","Seo-jun","Do-hyun","Ji-ho","Chen-wei","Hong-yu"];
const ASIA_LAST = ["Nishimura","Tanabe","Kikuchi","Ohara","Sugiyama","Kurokawa","Park","Kang","Yoon","Baek","Hsu","Chiang"];

const HS_PREFIX = ["Bishop Lynch","Cypress Grove","Ridgeline","Saint Aloysius","Buford Trail","Marshall Hills","Deer Park","Wheatland","Chaparral","Blue Ridge","Ponte Verde","Harker Point","Lakeview East","Del Mar","Sunnybrook","Trinity Fork","Amherst Central","North Cobb Heritage","Vista Verde","Fort Bend Riley","Oakmont","Cedar Bluff","Palm Bay Central","Grandview","Kearney North"];
const COLLEGES = ["Coastal Carolina","Wichita State","Sam Houston","Elon","Kennesaw State","Loyola Marymount","Dallas Baptist","UC Santa Barbara","Southern Miss","Campbell","Troy","Long Beach State","Wake Forest","Vanderbilt","LSU","Oregon State","East Carolina","Grand Canyon","Charlotte","Stetson","Bradley","Xavier","Kent State","Fresno State","Texas Tech","Arkansas","Clemson","UConn","Duke","Tulane","Nevada","Air Force"];
const JUCOS = ["Chipola JC","San Jacinto CC","Wabash Valley JC","Central Arizona JC","Weatherford JC","Iowa Western CC","Grayson County JC","Northwest Florida State"];
const STATES = ["TX","CA","FL","GA","NC","TN","AZ","OK","LA","AL","SC","OH","IL","MO","VA","WA","NJ","PA","IN","MS","AR","NV","KY","MI"];
const COUNTRIES = ["Dominican Republic","Venezuela","Cuba","Colombia","Panama","Curaçao","Mexico","Nicaragua"];
const DR_TOWNS = ["San Pedro de Macorís","Santo Domingo","Boca Chica","Baní","La Romana","Santiago","Azua"];

const HIT_POS = ["C","1B","2B","3B","SS","LF","CF","RF"];
const POS_ADJ = { C: 12.5, SS: 7, "2B": 2.5, "3B": 2.5, CF: 2.5, LF: -7, RF: -7, "1B": -9.5, DH: -15 };

/* ---------- archetypes ---------- */
const ARCH_HIT = [
  { k: "toolshed", n: "Toolsy athlete", w: 12, mod: { run: 8, arm: 6, field: 4, hit: -8, proj: 8, risk: 10 } },
  { k: "performer", n: "Polished performer", w: 14, mod: { hit: 8, disc: 8, power: -3, proj: -6, risk: -10 } },
  { k: "slugger", n: "Bat-first corner", w: 12, mod: { power: 10, run: -10, field: -6, hit: -2 } },
  { k: "glove", n: "Glove-first middle", w: 11, mod: { field: 10, arm: 6, power: -9, hit: 1 } },
  { k: "projbody", n: "Projectable frame", w: 11, mod: { proj: 14, power: -4, hit: -4, risk: 8 } },
  { k: "catch", n: "Defensive catcher", w: 7, mod: { field: 8, arm: 8, run: -12, hit: -3 } },
  { k: "burner", n: "Top-of-order speed", w: 8, mod: { run: 14, power: -10, disc: 4 } },
  { k: "sleeper", n: "Small-school riser", w: 8, mod: { hit: 4, power: 4, buzz: -28, risk: 4 } },
  { k: "twoway", n: "Two-way athlete", w: 5, mod: { arm: 8, run: 5, hit: -5, proj: 6, risk: 8 } },
  { k: "bounce", n: "Injury-return bat", w: 5, mod: { hit: 5, power: 5, health: -14, buzz: -14 } },
  { k: "cold", n: "Cold-weather bat", w: 7, mod: { proj: 6, hit: -3, buzz: -12, risk: 5 } },
];
const ARCH_PIT = [
  { k: "power", n: "Power arm", w: 14, mod: { fb: 10, brk: 4, cmd: -8, risk: 10 } },
  { k: "pitchab", n: "Pitchability lefty", w: 11, mod: { cmd: 10, ch: 8, fb: -8, risk: -8 } },
  { k: "spin", n: "Elite spin", w: 10, mod: { brk: 12, ch: -6, cmd: -3 } },
  { k: "projarm", n: "Projectable arm", w: 12, mod: { proj: 14, fb: -5, cmd: -5, risk: 9 } },
  { k: "starter", n: "Strike-throwing starter", w: 13, mod: { cmd: 8, dur: 8, fb: -3, brk: -2, risk: -10 } },
  { k: "relief", n: "Reliever profile", w: 10, mod: { fb: 8, dur: -14, cmd: -4, brk: 4 } },
  { k: "sinker", n: "Sinker/slider ground-baller", w: 8, mod: { cmd: 5, dur: 5, brk: 3, fb: -2 } },
  { k: "sleeperarm", n: "Cold-weather arm", w: 8, mod: { proj: 8, buzz: -26, risk: 5 } },
  { k: "tj", n: "Post-surgery arm", w: 6, mod: { fb: 6, health: -16, buzz: -16, dur: -6 } },
  { k: "juco", n: "JUCO strike-thrower", w: 8, mod: { cmd: 6, buzz: -14 } },
];

function weightedArch(list) {
  const tot = list.reduce((s, a) => s + a.w, 0);
  let r = rnd() * tot;
  for (const a of list) { r -= a.w; if (r <= 0) return a; }
  return list[0];
}

/* ============================================================
   SCOUT LANGUAGE
   ============================================================ */
// A 63 and an 80 are not the same player. Six bands, so the top of the scale
// reads like the top of the scale.
const band = (g) => (g <= 34 ? "low" : g <= 42 ? "bd" : g <= 52 ? "avg" : g <= 62 ? "plus" : g <= 70 ? "elite" : "special");

const T = {
  hit: {
    elite: ["Barrel stays in the zone forever — squares up spin and velo with the same swing.","Hands are special. Beat inside velo, then stayed back and drove a slider the other way.","Rare feel for the barrel. Never looked uncomfortable in any count.","Adjusts mid-swing. Took an 0-2 breaking ball and shot it into the left-center gap."],
    plus: ["Short to it, quick hands, controls the barrel through the zone.","Line-drive stroke with real feel. Handled velo, took a good AB against the change.","Consistent contact point, doesn't get sped up. Bat plays.","Swing works. Slightly grooved to the pull side but he squares balls up."],
    avg: ["Fringe-to-average feel. Gets to the ball but the barrel wanders.","Contact is there against fastballs; spin gives him trouble in the middle of the zone.","Hands work fine, but he's early on anything soft. Timing is a work in progress.","Serviceable swing. Nothing loud, nothing broken."],
    bd: ["Bat drags through the zone. Late on anything above 92.","Long path, gets under it. Lot of swing-and-miss in the zone.","Front side flies open, barrel never gets on plane.","Fooled repeatedly on the second time through. Pitch recognition is a question."],
    low: ["Serious swing-and-miss. Doesn't recognize spin at all right now.","Hitch on the load, can't catch up to velo. This is the carrying question.","Bat speed is below the line and the path is uphill. Hard to see him hitting.","Three swings on balls out of the zone in one AB."],
  },
  power: {
    elite: ["Damage on contact is real. Ball jumps different off his barrel.","Effortless carry — he flicked one out to the opposite field gap.","Plus-plus raw. Ball sounds different off the bat in BP and it plays in games.","Elite leverage and bat speed. Backspins the ball with almost no effort."],
    plus: ["Real raw juice. Got into one and it kept going.","Leverage in the swing, sneaky pop, especially to the pull side.","Above-average raw that should play if he makes enough contact.","Ball carries. Doubles power now with a chance for more."],
    avg: ["Average raw. Gap-to-gap now, maybe 12–15 homers if it all clicks.","Pop is more BP than game. Doesn't consistently get to it in competition.","Fringe-average juice. Needs contact quality to carry the profile.","Ball travels okay but he doesn't hunt damage."],
    bd: ["Below-average power. Line drives, not damage.","Contact is soft. Not much behind it right now.","Doesn't drive the ball. Power will need to come from strength gains he hasn't made.","No leverage. Flat path, singles profile."],
    low: ["Well below-average power. Ball dies at the warning track in BP.","No real thump. This is a slap-and-run profile.","Doesn't hit the ball hard enough to matter at higher levels.","Zero present strength behind the barrel."],
  },
  run: {
    elite: ["Plus-plus wheels. Turns singles into doubles without thinking about it.","Elite straight-line speed. Changed the shape of the inning after he reached.","Blazer. Gets down the line before the throw is out of the infield.","Top-of-the-scale runner. Steals bases on pure speed."],
    plus: ["Above-average speed that plays on the bases and in the gaps.","Gets going quickly, good closing speed on the grass.","Plus runner underway, average out of the box.","Runs well for the frame. Real base-stealing threat."],
    avg: ["Average runner. Fine underway, nothing that changes a game.","Average speed. Will be a station-to-station guy at the top level.","Runs okay now, likely a tick below once he fills out.","Not a burner, not a clogger."],
    bd: ["Below-average runner. Heavy-footed out of the box.","Speed is fringe now and going backwards with the body.","Not a threat on the bases, slow first three steps.","Will be a bottom-of-scale runner in three years."],
    low: ["Well-below-average speed. Clogs the bases.","Bottom-of-the-scale runner. Body already limits it.","Doesn't move. Speed is a non-tool.","Labored gait. It's a DH clock."],
  },
  field: {
    elite: ["Special defender. Instincts, actions, and hands all plus-plus. Plays the position like he's bored.","Gold-glove type actions. Made two plays no one else on the field makes.","Elite hands and internal clock. Never rushed.","Defense alone will carry him to the big leagues."],
    plus: ["Clean actions, soft hands, good first step. Stays at the position.","Reliable defender. Reads the ball off the bat well.","Above-average glove with real body control.","Defense is ahead of the bat. Comfortable, quiet feet."],
    avg: ["Average defender. Makes the plays he gets to.","Adequate. Actions get stiff on balls to his backhand.","Fringe-average glove; a corner move is possible but not required.","Hands are fine, range is average. Fits the position for now."],
    bd: ["Below-average defender. Footwork gets sloppy under pressure.","Body is going to force a move down the defensive spectrum.","Hard hands, choppy actions. Will need to move off the position.","Struggles with anything requiring a first-step read."],
    low: ["Defense is a real problem. Two misplays in six chances.","No feel for the position. This is a bat-only profile.","Well-below-average defender at any spot on the field.","Actions are stiff, hands are heavy. First base or DH."],
  },
  arm: {
    elite: ["Plus-plus arm strength with carry and accuracy. Threw a runner out from the corner.","Cannon. Ball explodes out of his hand from any arm slot.","Elite arm — a weapon that changes how teams run.","Threw a laser on a line to third from the wall."],
    plus: ["Above-average arm with good carry.","Arm plays. Quick transfer, accurate on the move.","Plus arm strength, throws are on line.","Strong arm, gets rid of it quickly."],
    avg: ["Average arm. Accurate but not a weapon.","Playable arm strength for the position.","Arm is fine, throws lose carry on the run.","Average now, could tick up with strength."],
    bd: ["Below-average arm. Runners will test him.","Throws lose steam. Long arm action.","Arm strength is fringe and limits his position options.","Has to crow-hop to get anything on it."],
    low: ["Well below average arm. Real limitation.","Can't make the throw from the hole.","Arm is a non-tool. Left field or first base only.","Loopy arm action, no carry."],
  },
  fb: {
    elite: ["Elite fastball. Rides through the top of the zone and hitters keep swinging under it.","Premium velocity with life. Blew it by good hitters at the letters.","Double-plus heater, holds it deep into the outing.","Fastball is a weapon on its own — big extension makes it play up further."],
    plus: ["Plus fastball with late run in on righties.","Comfortable velocity with some finish. Hitters were late.","Above-average heater; holds velo through the fifth.","Fastball has angle and jumps out of the hand."],
    avg: ["Average fastball, straight, gets hit when he leaves it middle.","Velocity is fine but the pitch lacks characteristics.","Sits in the average band. Will need the secondary stuff to carry him.","Fastball plays down a bit — flat plane, easy to elevate."],
    bd: ["Below-average fastball. Hitters were comfortable on it.","Velo backed up in the third. Fringe pitch.","Not enough on the heater to survive above A-ball as is.","Fastball is hittable — no life, and he lives in the middle."],
    low: ["Well below-average velocity. Bat speed at the next level will eat this.","Heater doesn't have a chance without a big physical jump.","No fastball. Gets by on soft stuff against overmatched competition.","Velo bottom of the scale, no deception."],
  },
  brk: {
    elite: ["Wipeout breaking ball. Sharp, late, and he can throw it for a strike or bury it.","Plus-plus spin with power tilt. Hitters had no chance.","Breaking ball is a genuine out pitch right now.","Two distinct breaking balls, both play, tunnels them off the heater."],
    plus: ["Above-average breaker with real depth. Got swings and misses.","Slider has tilt and he trusts it in any count.","Plus flashes on the curveball, more consistent than most at this age.","Breaking ball is his best pitch — sharp, repeatable shape."],
    avg: ["Average breaking ball. Shape is fine, command of it is not.","Slurvy shape, plays as a get-me-over pitch.","Flashes average, more often it's soft and early.","Breaking ball is usable but doesn't miss bats."],
    bd: ["Below-average breaker. Rolls out of the hand, hitters spit on it.","Slider is slurvy and telegraphed — different arm speed.","No consistent shape. It's a show-me pitch.","Breaking ball backs up more often than not."],
    low: ["No breaking ball to speak of. Loopy and out of the hand early.","Can't spin it. Big development question.","Breaking ball is a non-pitch, hitters never offered.","Bottom-of-scale spin, no depth."],
  },
  ch: {
    elite: ["Changeup is a legitimate plus-plus offering with fade and matching arm speed.","Change is his best secondary — tumbles late, arm speed identical.","Elite feel for the change; used it against both handedness.","Change disappears at the plate. Big weapon."],
    plus: ["Above-average change with fade. Real feel for it.","Change plays — good separation and he sells it.","Advanced changeup for his age.","Change has late tumble and he'll throw it in any count."],
    avg: ["Average change. Firm, but he'll flash a good one.","Change is functional, mostly a first-pitch offering.","Fringe-average feel. Comes in too firm.","Third pitch is average — enough to turn a lineup over."],
    bd: ["Below-average change, arm speed gives it away.","Change is firm and flat. Barely used it.","No feel for the change. Two-pitch look.","Change is behind — will be a reliever if it doesn't come."],
    low: ["No third pitch. Threw two changeups all night, both non-competitive.","Change is a non-offering. Bullpen risk.","Doesn't have it and doesn't trust it.","Change is well below average and it isn't close."],
  },
  cmd: {
    elite: ["Exceptional command. Worked both edges, changed eye level at will.","Pinpoint. Located all three pitches to the glove side on demand.","Command is the carrying tool — never missed over the middle.","Advanced command and sequencing. Pitched like a big leaguer."],
    plus: ["Above-average command. Repeats it and fills up the zone.","Throws strikes with all his pitches. Misses in good spots.","Command projects to plus — clean, repeatable delivery.","Good strike-throwing feel, works ahead consistently."],
    avg: ["Average command. Around the zone, but not in it precisely.","Strike-thrower without a plan. Misses tend to be over the plate.","Control ahead of command. Hit the zone, not the target.","Fringe-average. Fine in the zone, not fine in the count."],
    bd: ["Below-average command. Fell behind repeatedly, lost the zone in the third.","Effort in the delivery costs him the strike zone.","Misses are big misses. Four walks in four innings.","Command is well behind the stuff. Bullpen if it doesn't come."],
    low: ["No command. Two wild pitches and a hit batter in one inning.","Can't find the zone consistently. Delivery has too many moving parts.","Bottom-of-scale strikes. This is the reason he's available.","Scattershot. Catcher never set up in the same place twice."],
  },
  frame: {
    elite: ["Prototype frame. Long levers, high waist, room for 25 more pounds without losing athleticism.","Big, loose, athletic body. The kind of frame you dream on.","Exceptional physical projection — still growing into it.","Great body, elite athleticism for the size."],
    plus: ["Good frame with room to add. Athletic mover.","Long and lean, should fill out well.","Projectable build, loose limbs, coordinated.","Nice body, above-average athlete."],
    avg: ["Average build, some strength left to add.","Solid frame, mostly filled out. What you see is close to what you get.","Body is fine, athleticism is average.","Physically mature for the age but not maxed."],
    bd: ["Thicker build, close to physically maxed. Not much projection left.","Body is already heavy in the lower half. Will need maintenance.","Limited projection — he's what he is physically.","Below-average athlete for the position."],
    low: ["Body is a real concern — soft, already maxed, conditioning question.","Poor athlete. The body is going to limit everything else.","Physically maxed at 18. No projection.","Heavy-legged, high-maintenance body."],
  },
  makeup: {
    elite: ["Everyone at the school volunteered the same thing: he's the hardest worker they've had.","Outstanding makeup. Ran the pregame himself, first one out, last one off.","Coaches, teammates, opposing coaches all rave. Leader, learner, competitor.","Exceptional aptitude — made an in-game adjustment I'd expect from a Double-A hitter."],
    plus: ["Good makeup, well-liked, competitive. No concerns from the school.","Coach says he's coachable and works. Nothing negative in the background.","Solid character. Handles failure well.","Good student, good teammate. Reports are clean."],
    avg: ["Makeup reports are average. Nothing bad, nothing that stands out.","Fine kid. Coach was noncommittal, said all the right things quickly.","No red flags but no one went out of their way to praise him.","Average work ethic per the coaching staff."],
    bd: ["Mixed reports. Two people mentioned effort level on days he isn't hitting.","Some concern about how he handles adversity. Sulked after a punchout.","Coach hesitated when asked about makeup. That's usually an answer.","Body language is poor. Showed up an umpire."],
    low: ["Real makeup concerns. Multiple sources, consistent story.","Attendance and effort issues at the school. Not a small thing.","Blew off a workout. Coach volunteered that he's a problem in the clubhouse.","Two separate sources flagged the same off-field issue."],
  },
  health: {
    elite: ["Clean medicals. No history, exceptional mobility screen, durable build.","Nothing in the file. Well-conditioned, never missed time.","Medical is a green light. Big durable frame.","Physical came back clean across the board."],
    plus: ["Medicals are clean. Minor stuff only — one ankle roll two years back.","No structural concerns. Good mobility numbers.","Healthy history, no missed time of consequence.","Physical is fine. Slight shoulder tightness noted, nothing imaging-worthy."],
    avg: ["Standard medical. Some wear typical for the workload.","Nothing disqualifying. Minor back tightness in the file.","Average durability profile. Missed two weeks last spring with a hamstring.","Imaging is unremarkable. Some hip mobility limitation."],
    bd: ["Medical flags. Prior elbow soreness, shut down for six weeks as a junior.","Some concern in the imaging — labrum wear. Would want a second read.","Durability question. Two separate soft-tissue injuries in eighteen months.","Knee has a history. Cleared, but it's on the file."],
    low: ["Significant medical concerns. Prior surgery and lingering symptoms.","Would not clear him without an independent review. Real risk here.","Chronic issue in the file. This is the reason the price is where it is.","Medical is the story — multiple flags, one of them structural."],
  },
  delivery: {
    elite: ["Delivery is clean, on-line, and effortlessly repeated. Low-effort velocity.","Beautiful operation — balanced, direct, elite extension.","Repeats it every pitch. Arm works exceptionally well.","Athletic, easy delivery. Nothing to fix."],
    plus: ["Clean arm action, repeats well. Some effort late but holds up.","Delivery is on-line with good extension down the mound.","Good operation, arm works fine, minor timing inconsistency.","Athletic delivery that should hold up as a starter."],
    avg: ["Average operation. Some head whack, drifts open occasionally.","Delivery works but he doesn't repeat it consistently.","Arm works okay. Slight hook in the back but nothing alarming.","Functional. Loses his line to the plate under stress."],
    bd: ["Effort delivery, lands closed, arm drags. Command risk.","Head violence and a stiff front side. Reliever traits.","Doesn't repeat. Arm timing is late.","High-effort operation with recoil. Durability question."],
    low: ["Max-effort delivery with a real arm-injury look. Big red flag.","Falls off hard to first base, no direction. This is a relief profile at best.","Arm action is a genuine concern for a medical staff.","Delivery is violent and unrepeatable."],
  },
  disc: {
    elite: ["Elite strike-zone discipline. Took four pitches off the plate by an inch.","Never expands. Controls the at-bat from the first pitch.","Advanced approach — hunted a pitch and didn't leave the zone.","Zone awareness is exceptional for the level."],
    plus: ["Good approach. Works counts and takes his walks.","Doesn't chase much. Knows what he's looking for.","Above-average zone discipline for the age.","Patient without being passive."],
    avg: ["Approach is average. Chases some spin down.","Aggressive early, will expand with two strikes.","Zone judgment is fine but not a strength.","Average discipline — swings at strikes, mostly."],
    bd: ["Expands the zone. Chased a slider in the dirt twice.","Free swinger. Walks will not be part of this profile.","Approach is a question — swings at everything early.","Doesn't work counts. Pitchers will exploit it."],
    low: ["No approach. Swung at four pitches out of the zone in two ABs.","Chases everything. Real hit-tool risk on top of the swing.","Zone discipline is bottom of the scale.","Overaggressive and won't take a walk."],
  },
  dur: {
    elite: ["Big innings horse. Held stuff into the 100th pitch, no drop.","Durable build with a starter's workload history.","Never comes out. Stuff at pitch 95 matched pitch 5.","Ideal starter durability."],
    plus: ["Holds velocity deep. Should handle a starter's workload.","Body and delivery support 160+ innings.","Stuff held through six. Good conditioning.","Durable frame, consistent workload history."],
    avg: ["Stuff backed up a tick the third time through.","Average durability. Probably a five-and-dive starter.","Held up for five innings, then it went.","Workload history is average for the level."],
    bd: ["Stuff dropped hard after 60 pitches. Reliever risk.","Slight frame, limited workload history.","Doesn't hold it. Two-inning look is the best version.","Durability is a real question."],
    low: ["Velocity fell off a cliff in the third. This is a one-inning arm.","Body won't hold a starter's workload.","Has never thrown more than 45 innings in a season.","Pure relief durability."],
  },
};

const BG_HEALTH = {
  good: ["Trainer says he's never missed a game. Durable kid.", "Nothing in the school's injury log at all.", "Coach volunteered that he plays every day and never asks out."],
  ok: ["Missed a couple of weeks last spring, nothing chronic per the trainer.", "Normal wear for the workload. Nothing the school flagged.", "One hamstring issue two years ago, cleared without incident."],
  bad: ["School confirmed he was shut down for a long stretch last season.", "Trainer got vague about a recurring issue. Worth a real medical.", "Coach mentioned he's been managed carefully. That's usually a tell."],
};

const VENUES_HS = ["a district game","a regional semifinal","a Friday doubleheader","a showcase in Fort Myers","a summer wood-bat game","a rainy midweek game","an early-season game in 44 degrees","a tournament pool-play game"];
const VENUES_COL = ["a midweek game","a Friday-night conference start","a Sunday rubber game","a neutral-site tournament game","a Saturday doubleheader nightcap","a regional elimination game"];
const CONTEXT = [
  "Wind blowing in from left all night.","Crosswind, ball wasn't carrying.","Cold, damp, both teams looked slow.","Faced a projected top-three-round arm.","Overmatched competition — discount this one accordingly.","Second game of the day for him.","Small sample: two at-bats before I had to leave for the other side of the state.","He knew he was being watched. Twelve scouts behind the plate.","Backfield look, no radar competition, relaxed setting.","Late in a long season — legs looked heavy.","Turf field, plays fast.","He'd been sick the week before per the coach.",
];

const TAG = { hit: "Hit", power: "Power", run: "Run", field: "Field", arm: "Arm", disc: "Approach",
  fb: "Fastball", brk: "Breaking", ch: "Change", cmd: "Command", delivery: "Delivery", dur: "Durability",
  frame: "Frame", makeup: "Makeup", health: "Medical" };

/* ---------- box-score lines that actually reconcile ----------
   Innings are thirds, strikeouts are outs, and a hitter cannot go 4-for-3.
   Everything below is built from a single count of outs or at-bats so the
   numbers can't contradict each other. */
function ipString(outs) { return `${Math.floor(outs / 3)}.${outs % 3}`; }

function boxLinePitcher(o) {
  const q = (o.fb + o.brk + o.cmd) / 3;
  // Some days it isn't there, and some days everything is. This is why one look
  // is not an evaluation — the grade sets the odds, not the result.
  const day = rnd();
  const dayMult = day < 0.13 ? 1.75 + rnd() * 0.7 : day > 0.89 ? 0.28 + rnd() * 0.28 : 1;
  const dayOuts = day < 0.13 ? -ri(2, 7) : day > 0.89 ? ri(0, 3) : 0;
  // Better arms work deeper and put fewer men on. The multiplier is wide, so a
  // good arm can still get knocked around and a bad one can spin a gem.
  const outs = clamp(Math.round(ri(9, 21) + (q - 50) * 0.14 + gauss(0, 1.6) + dayOuts), 3, 24);
  const trafficRate = clamp(0.43 - (q - 50) * 0.010, 0.10, 0.78) * (0.55 + rnd() * 0.95) * dayMult;
  const traffic = Math.max(0, Math.round(outs * trafficRate));
  const bf = outs + traffic;
  const kRate = clamp(0.16 + (o.fb + o.brk - 100) * 0.0045, 0.05, 0.42);
  const K = clamp(Math.round(bf * kRate + gauss(0, 1.1)), 0, outs);
  const bbShare = clamp(0.44 - o.cmd * 0.0044, 0.07, 0.62);   // how much of the traffic was free
  const BB = clamp(Math.round(traffic * bbShare + gauss(0, 0.6)), 0, traffic);
  const H = traffic - BB;
  const ER = clamp(Math.round(H * 0.38 + BB * 0.20 + gauss(0, 1.15)), 0, H + BB);
  return `${ipString(outs)} IP, ${H} H, ${ER} ER, ${BB} BB, ${K} K`;
}

function boxLineHitter(o) {
  const ab = ri(3, 5);
  // Locked in, or lost at the plate. Either happens to anybody.
  const day = rnd();
  const dayMult = day < 0.12 ? 1.75 : day > 0.88 ? 0.45 : 1;
  const hitRate = clamp((0.16 + (o.hit - 30) * 0.0065) * dayMult, 0.03, 0.72);
  let h = 0;
  for (let i = 0; i < ab; i++) if (rnd() < hitRate) h++;
  const kRate = clamp(0.52 - (o.hit - 30) * 0.008, 0.08, 0.75);
  let k = 0;
  for (let i = 0; i < ab - h; i++) if (rnd() < kRate) k++;
  const bb = rnd() < clamp(0.06 + (o.disc - 30) * 0.004, 0.02, 0.38) ? 1 : 0;
  const extra = h > 0 && rnd() < clamp(0.14 + (o.power - 30) * 0.0055, 0.04, 0.55)
    ? (o.power >= 55 ? pick(["a double", "a double", "a home run", "a home run", "a triple"])
      : o.power >= 42 ? pick(["a double", "a double", "a double", "a triple", "a home run"])
      : pick(["a double", "a double", "a double", "a triple"])) : null;
  return `${h}-for-${ab}` + (bb ? `, ${bb} BB` : "") + (k ? `, ${k} K` : "")
    + (extra ? `, incl. ${extra}` : "");
}

/* ---------- measurable readings from observed grade ---------- */
const READ = {
  sixty: (g) => (8.05 - g * 0.023).toFixed(2) + " in the 60",
  ev: (g) => Math.round(88 + g * 0.34) + " mph max exit velo",
  evAvg: (g) => Math.round(78 + g * 0.30) + " mph average exit velo",
  bat: (g) => (58 + g * 0.19).toFixed(1) + " mph bat speed",
  ofArm: (g) => Math.round(70 + g * 0.31) + " mph from the outfield",
  ifArm: (g) => Math.round(66 + g * 0.30) + " mph across the diamond",
  pop: (g) => (2.35 - g * 0.006).toFixed(2) + " pop time",
  velo: (g) => `sat ${Math.round(83 + g * 0.185)}-${Math.round(85 + g * 0.185)}, touched ${Math.round(86 + g * 0.19)}`,
  spin: (g) => Math.round(1520 + g * 18.4) + " rpm on the breaker",
  ivb: (g) => Math.round(6 + g * 0.16) + '" induced vertical break on the heater',
  ext: (g) => (5.4 + g * 0.014).toFixed(1) + " ft extension",
  chsep: (g) => Math.round(4 + g * 0.10) + " mph separation on the change",
};

/* ============================================================
   PROSPECT GENERATION
   ============================================================ */
let UID = 1;

function genGrade(base, sd = 8) { return clamp(Math.round(gauss(base, sd)), 20, 80); }

function genProspect(year, opts = {}) {
  const forceIntl = opts.intl;
  let origin;
  if (forceIntl) origin = "INTL";
  else {
    const r = rnd();
    origin = r < 0.42 ? "HS" : r < 0.86 ? "COL" : "JUCO";
  }
  const isP = rnd() < 0.47;
  const arch = weightedArch(isP ? ARCH_PIT : ARCH_HIT);
  const mod = arch.mod;

  let age, school, home, level;
  // A player's school is in the state he's from — nobody is a Texas high
  // schooler at a school in New Jersey.
  if (origin === "HS") {
    age = ri(17, 19) - (rnd() < 0.5 ? 0.5 : 0);
    home = pick(STATE_LIST); school = makeHighSchool(home); level = "High school";
  } else if (origin === "COL") {
    age = 20 + (rnd() < 0.4 ? 1 : 0) + (rnd() < 0.5 ? 0.5 : 0);
    home = pick(STATE_LIST); school = makeCollege(home);
    // draft-eligible college players are overwhelmingly juniors
    const r = rnd();
    level = r < 0.68 ? "College junior" : r < 0.90 ? "College senior" : "College sophomore";
  } else if (origin === "JUCO") {
    age = 19 + (rnd() < 0.5 ? 0.5 : 0);
    home = pick(STATE_LIST); school = makeJuco(home); level = "Junior college";
  }
  else { age = 16 + (rnd() < 0.4 ? 0.5 : 0); const c = pick(COUNTRIES); school = c === "Dominican Republic" ? pick(DR_TOWNS) + ", D.R." : c; home = c; level = "International FA"; }

  const asian = origin === "INTL" && rnd() < 0.1;
  const latin = origin === "INTL" || (origin !== "INTL" && rnd() < 0.18);
  const name = asian ? `${pick(ASIA_FIRST)} ${pick(ASIA_LAST)}` : latin ? `${pick(LATIN_FIRST)} ${pick(LATIN_LAST)}` : `${pick(US_FIRST)} ${pick(US_LAST)}`;

  // Base talent level for the class — most are org filler, a few are real
  const tier = rnd();
  const baseTal = tier < 0.52 ? gauss(38, 5) : tier < 0.82 ? gauss(45, 4.5) : tier < 0.95 ? gauss(52, 4) : gauss(59.5, 4.5);

  const ht = isP ? ri(70, 78) : ri(68, 77);
  const wt = Math.round(ht * 2.55 + gauss(0, 16) + (origin === "INTL" || origin === "HS" ? -12 : 0));

  const projBase = origin === "INTL" ? 62 : origin === "HS" ? 55 : origin === "JUCO" ? 48 : 40;
  const proj = clamp(Math.round(gauss(projBase + (mod.proj || 0), 9)), 20, 80);
  const makeup = clamp(Math.round(gauss(50, 11)), 20, 80);
  const health = clamp(Math.round(gauss(52 + (mod.health || 0), 12)), 20, 80);

  const cur = {}, fut = {};
  const tools = isP ? ["fb", "brk", "ch", "cmd", "dur", "delivery"] : ["hit", "power", "run", "field", "arm", "disc"];
  for (const t of tools) {
    let b = baseTal + (mod[t] || 0);
    if (t === "delivery") b = baseTal * 0.4 + 30 + (mod.cmd || 0) * 0.5;
    if (t === "dur") b = baseTal * 0.4 + 30 + (mod.dur || 0);
    cur[t] = genGrade(b - (origin === "HS" ? 6 : origin === "INTL" ? 12 : 2), 7);
  }
  // future grades: growth toward ceiling driven by projection, age, makeup
  const growthPool = (proj - 30) * 0.36 + (makeup - 50) * 0.06 + gauss(0, 3.5);
  for (const t of tools) {
    const share = t === "hit" || t === "cmd" ? 0.55 : t === "power" || t === "fb" ? 1.25 : t === "run" ? 0.15 : 0.7;
    let f = cur[t] + Math.max(0, growthPool * share * (0.5 + rnd()));
    if (t === "run" && origin !== "COL") f = cur[t] - (wt > 215 ? ri(2, 8) : 0);
    fut[t] = clamp(Math.round(f), 20, 80);
  }

  // An amateur is signed AT a position — he came up there and his club played him
  // there. Deriving it from tools alone turned every fringe defender into a corner
  // outfielder and produced a class that was two-thirds first basemen and DHs.
  // So: start from a realistic organisational mix, then let the tools nudge it.
  const pos = isP ? (rnd() < 0.28 ? "LHP" : "RHP") : (() => {
    const w = { C: 13, "1B": 5, "2B": 12, "3B": 12, SS: 21, LF: 7, CF: 18, RF: 10, DH: 1 };
    // Tools shade the odds; they don't override them. Scaling rather than adding
    // keeps a weak defender from collapsing the whole distribution onto corners.
    const sc = (k, f) => (w[k] = w[k] * f);
    if (cur.run >= 58) { sc("CF", 2.0); sc("SS", 1.4); sc("2B", 1.3); sc("1B", 0.3); sc("DH", 0.2); }
    if (cur.run <= 38) { sc("CF", 0.3); sc("SS", 0.5); sc("1B", 2.0); sc("LF", 1.5); }
    if (cur.arm >= 60) { sc("RF", 1.7); sc("SS", 1.3); sc("3B", 1.4); sc("C", 1.3); sc("LF", 0.6); }
    if (cur.arm <= 40) { sc("RF", 0.4); sc("C", 0.3); sc("SS", 0.5); sc("3B", 0.6); sc("LF", 1.8); sc("2B", 1.3); }
    if (cur.field >= 58) { sc("SS", 1.5); sc("C", 1.3); sc("CF", 1.3); sc("1B", 0.5); }
    if (cur.field <= 40) { sc("SS", 0.4); sc("C", 0.4); sc("CF", 0.5); sc("1B", 1.8); sc("LF", 1.5); }
    if (cur.power >= 60) { sc("1B", 1.4); sc("RF", 1.3); }
    const tot = Object.values(w).reduce((a, b) => a + b, 0);
    let r = rnd() * tot;
    for (const k in w) { r -= w[k]; if (r <= 0) return k; }
    return "LF";
  })();

  // true overall value used for buzz + ask
  const tv = isP
    ? 0.32 * fut.fb + 0.24 * fut.brk + 0.14 * fut.ch + 0.30 * fut.cmd
    : 0.40 * fut.hit + 0.26 * fut.power + 0.09 * fut.run + 0.16 * fut.field + 0.09 * fut.arm;

  // public buzz — imperfect view of true value. This is the market's opinion.
  let buzz = tv + gauss(0, 11) + (mod.buzz || 0) * 0.4 + (origin === "COL" ? 3 : 0) + (isP && cur.fb >= 60 ? 5 : 0) + (!isP && cur.power >= 60 ? 4 : 0);
  buzz = clamp(buzz, 20, 82);

  // ask price driven almost entirely by buzz, not truth
  // askBase is the public expectation — what his ranking says he's "worth"
  const askRaw = Math.pow(Math.max(0, buzz - 30) / 24, 3.1) * 5.6 + 0.06 + Math.abs(gauss(0, 0.25));
  // demand is lumpy: agents, timing, how many clubs are on him. Price is not a
  // clean restatement of the ranking.
  const demand = Math.exp(gauss(0, 0.30));
  const askBase = Math.round(clamp(askRaw * demand, 0.05, 22) * 100) / 100;
  // leverage is the private part: what he'll actually sign for
  let ask = askBase;
  if (origin === "HS" && buzz > 48) ask *= 1.35;   // college commitment
  if (origin === "INTL") ask *= 0.72;
  if (level === "College senior") ask *= 0.35;         // no leverage at all
  if (arch.k === "tj" || arch.k === "bounce") ask *= 0.7;
  ask = Math.round(clamp(ask, 0.05, 26) * 100) / 100;

  // What the industry publicly believes about his individual tools: a partial,
  // noisy view of how his tools sit relative to each other. Everyone knows he's
  // a power bat with hit-tool questions; nobody knows by how much.
  const pub = {};
  for (const t of tools) pub[t] = (fut[t] - tv) * 0.55 + gauss(0, 4.5);

  // Handedness follows the position. There are no left-handed catchers, second
  // basemen, third basemen or shortstops — the throw doesn't work.
  const rightOnly = ["C", "2B", "3B", "SS"].includes(pos);
  const throws = isP ? (pos === "LHP" ? "L" : "R")
    : rightOnly ? "R"
    : (pos === "1B" ? (rnd() < 0.35 ? "L" : "R") : rnd() < 0.14 ? "L" : "R");
  const bats = throws === "L" ? (rnd() < 0.86 ? "L" : rnd() < 0.5 ? "S" : "R")
    : (rnd() < 0.24 ? "L" : rnd() < 0.13 ? "S" : "R");

  return {
    id: UID++,
    name, pos, isP, origin, level, school, home, age,
    ht: `${Math.floor(ht / 12)}-${ht % 12}`, wt, bats, throws,
    arch: arch.k, archName: arch.n,
    cur, fut, proj, makeup, health, buzz: Math.round(buzz), ask, askBase, tv, pub,
    est: {}, reports: [], looks: 0, board: null, areaScout: null,
    seen: { game: 0, work: 0, bg: 0, med: 0, data: 0, xc: 0 },
    askKnown: null,
  };
}

/* ---------- money ---------- */
// What the industry expects him to get. Public, rough, and blind to his leverage.
function marketRange(p) {
  const b = p.askBase ?? p.ask;
  return { lo: Math.round(b * 0.62 * 100) / 100, hi: Math.round(b * 1.48 * 100) / 100 };
}
// Underpaying is a real option, not a wasted offer — it's just a long shot.
function signChance(ratio, agents) {
  const a = 1 + 0.075 * (agents || 0);   // relationships buy a little goodwill
  if (ratio >= 1) return 1;
  if (ratio >= 0.88) return clamp(0.5 * a, 0, 0.85);
  if (ratio >= 0.78) return clamp(0.22 * a, 0, 0.62);
  if (ratio >= 0.68) return clamp(0.08 * a, 0, 0.38);
  if (ratio >= 0.58 && (agents || 0) >= 2) return 0.045 * ((agents || 0) - 1);
  return 0;
}

/* ---------- Bayesian belief ---------- */
const GROWTH_SHARE = { hit: 0.55, cmd: 0.55, power: 1.25, fb: 1.25, run: 0.10, brk: 0.8, ch: 0.8, field: 0.6, arm: 0.7, disc: 0.7, dur: 0.5, delivery: 0.5 };
const DEFAULT_PROJ = { INTL: 62, HS: 55, JUCO: 48, COL: 40 };

// how much more you expect him to grow, informed by any read you have on his frame
function expGrowth(p, tool) {
  // Must match the growth the generator actually applies, or every read drifts
  // low and the whole board looks worse than it is.
  const fr = p.est.frame_cur ? p.est.frame_cur.m : DEFAULT_PROJ[p.origin];
  return clamp((fr - 30) * 0.36, 0, 20) * (GROWTH_SHARE[tool] ?? 0.7);
}

function priorFor(p, key) {
  // Before you've seen him, all you have is the board — and the board regresses hard
  // toward the middle of the class. Your own reports do the real work.
  const [tool, when] = key.split("_");
  // The board number is the industry's actual opinion, not a shrunken version of
  // it. Regressing it toward the class average made almost every player read
  // BELOW the board once your staff looked, which is a statistical artifact
  // rather than a scouting insight. The prior stays wide — evidence still
  // dominates it — but it is centred where the market really is.
  let m = p.buzz + (p.pub && p.pub[tool] != null ? p.pub[tool] : 0);
  if (!p.isP) {
    if (tool === "run") m += p.pos === "CF" || p.pos === "SS" ? 6 : p.pos === "1B" || p.pos === "C" ? -10 : 0;
    if (tool === "power") m += p.pos === "1B" || p.pos === "RF" || p.pos === "DH" ? 5 : 0;
    if (tool === "field") m += p.pos === "SS" || p.pos === "C" ? 4 : -2;
  }
  if (when === "fut") m += expGrowth(p, tool) * 0.6;
  else m -= expGrowth(p, tool) * 0.5;
  return { m: clamp(m, 20, 80), v: when === "fut" ? 330 : 300 };
}
function getEst(p, key) {
  return p.est[key] || priorFor(p, key);
}
// You can narrow a read. You cannot close it — projection has an irreducible floor.
const VAR_FLOOR_CUR = 13;
const VAR_FLOOR_FUT = 34;
function observe(p, key, obsVal, obsVar) {
  const cur = getEst(p, key);
  let v = 1 / (1 / cur.v + 1 / obsVar);
  const m = v * (cur.m / cur.v + obsVal / obsVar);
  v = Math.max(v, key.endsWith("_fut") ? VAR_FLOOR_FUT : VAR_FLOOR_CUR);
  p.est[key] = { m, v };
}
const sdOf = (e) => Math.sqrt(e.v);
const confOf = (e) => clamp(1 - (sdOf(e) - 3.2) / 11, 0, 1);

/* ============================================================
   LOOKS
   ============================================================ */
const LOOK_DEFS = {
  area: { name: "Area report", cost: 0, blurb: "Your area guy's spring write-up. Every player in the class gets one.", req: null, hidden: true },
  game: { name: "Game look", cost: 1, blurb: "Watch him compete. Broad read on how the tools actually play.", req: null },
  work: { name: "Private workout", cost: 1, blurb: "Controlled setting. Precise measurables, no game context.", req: null },
  bg: { name: "Background work", cost: 1, blurb: "Coaches, teachers, summer-ball people. Makeup and a read on the asking price.", req: null },
  med: { name: "Medical review", cost: 1, blurb: "Imaging, history, mobility screen.", req: "medical" },
  data: { name: "Data pull", cost: 1, blurb: "TrackMan, bat tracking, batted-ball data, statistical translation.", req: "analytics" },
  xc: { name: "Cross-check", cost: 2, blurb: "Senior evaluator's eyes. Sharpens everything, especially the future grades.", req: "crosscheck" },
};

function noiseScale(g, kind) {
  // upgrades reduce observation variance
  const xc = g.upgrades.crosscheck, an = g.upgrades.analytics, sc = g.upgrades.scouts;
  let s = 1 / (1 + 0.10 * xc + 0.05 * sc);
  if (kind === "data") s /= (1 + 0.22 * an);
  if (kind === "med") s /= (1 + 0.30 * g.upgrades.medical);
  return s;
}

function drawObs(trueVal, variance) {
  return clamp(gauss(trueVal, Math.sqrt(variance)), 12, 88);
}

function runLook(game, p, kind) {
  const ns = noiseScale(game, kind);
  const lines = [];
  const numbers = [];
  // Every line carries what it's about, so a report reads as a form rather than
  // a paragraph. Untagged lines are report-level remarks.
  const L = (tag, text) => { if (text) lines.push({ t: tag || null, s: text }); };
  // A report is one person on one day. If he caught a bad night, or fell in love with
  // the body, he is wrong about every tool at once and in the same direction. That
  // shared error is what a second look actually buys you — it never averages out
  // within a single report.
  const BIAS_SD = { area: 9.5, game: 5.5, work: 3.4, bg: 4.0, med: 3.0, data: 1.8, xc: 3.0 };
  // Roughly one area report in seven is a genuinely bad look — wrong day, wrong
  // conditions, three innings before the drive back. Those reports are wrong
  // about the whole player at once, and the write-up says so.
  const shaky = kind === "area" && rnd() < 0.15;
  const biasSD = (shaky ? 22 : (BIAS_SD[kind] ?? 4)) * Math.sqrt(ns);
  const bias = gauss(0, biasSD);
  // Your own man's standing habits ride along on everything he files. The model
  // does not know about them, which is exactly why you have to.
  const own = ["area", "game", "work", "bg"].includes(kind);
  const sc = own && game.staff && game.staff.length ? game.staff[(p.sc || 0) % game.staff.length] : null;
  if (sc) sc.filed = (sc.filed || 0) + 1;
  const staffBias = sc ? sc.bias : 0;
  const tweak = (t) => (sc ? (t === sc.pet ? 5.5 : t === sc.blind ? -5.5 : 0) : 0);
  // his specialities sharpen or blur the read itself, and the confidence bar
  // reflects it honestly — that's how you discover what he's good at.
  const acc = (t) => (sc ? (domainHit(sc.sharp, t, p) ? 0.45 : 1) * (domainHit(sc.weak, t, p) ? 2.0 : 1) : 1);
  const biasVar = biasSD * biasSD + (sc ? 9 : 0);
  // seeing a tool today also tells you something about where it ends up — filtered
  // through what you believe about his body and remaining projection
  const doObs = (tool, baseVar, futExtra = 175) => {
    // A man who reads a kind of player well projects him better too, so the
    // speciality applies to the forward look as much as the present one.
    const a = acc(tool);
    const v = baseVar * ns * a;
    const o = clamp(gauss(p.cur[tool] + bias + staffBias + tweak(tool), Math.sqrt(v)), 12, 88);
    observe(p, `${tool}_cur`, o, v + biasVar);
    observe(p, `${tool}_fut`, clamp(o + expGrowth(p, tool), 20, 80), v + biasVar + futExtra * a);
    return o;
  };
  // a direct projection of the finished product
  const doFut = (tool, baseVar) => {
    const v = baseVar * ns * acc(tool);
    const o = clamp(gauss(p.fut[tool] + bias + staffBias + tweak(tool), Math.sqrt(v)), 12, 88);
    observe(p, `${tool}_fut`, o, v + biasVar);
    return o;
  };

  const hitTools = ["hit", "power", "run", "field", "arm", "disc"];
  const pitTools = ["fb", "brk", "ch", "cmd", "dur", "delivery"];

  if (kind === "area") {
    // shallow coverage of the whole class: real signal, badly noisy
    const av = 85 / (1 + 0.16 * game.upgrades.scouts);
    if (p.isP) {
      const fb = doObs("fb", av, 215), brk = doObs("brk", av + 14, 225), cmd = doObs("cmd", av + 10, 225);
      L(TAG.fb, scoutLine("fb", fb, p.isP, true, p));
      if (rnd() < 0.5) L(TAG.brk, scoutLine("brk", brk, p.isP, false, p)); else L(TAG.cmd, scoutLine("cmd", cmd, p.isP, false, p));
      numbers.push(READ.velo(fb));
    } else {
      const hit = doObs("hit", av + 12, 225), pw = doObs("power", av, 215), run = doObs("run", av - 22, 200);
      L(TAG.hit, scoutLine("hit", hit, p.isP, true, p));
      if (rnd() < 0.5) L(TAG.power, scoutLine("power", pw, p.isP, false, p)); else L(TAG.run, scoutLine("run", run, p.isP, false, p));
      numbers.push(READ.sixty(run));
    }
    L(null, pick(shaky ? [
      "Caveat: three innings in awful conditions before I had to drive to the other side of the state. I would not weight this heavily.",
      "Honest warning — he was coming off illness and the field was a mess. File it, don't trust it.",
      "I got there in the fourth and left in the sixth. This is a fragment, not an evaluation.",
      "Rain delay, two-hour wait, and he sat the back half. Take this one with a great deal of salt.",
      "He was clearly not himself. Something was off and I don't know what. Needs a clean look.",
      "Worst possible setting to judge anybody — wind howling, terrible mound, backup catcher. Discount accordingly.",
    ] : [
      "One look, early in the spring. Take it for what it is.",
      "Saw him once on a swing through the area. Worth a second set of eyes.",
      "Preliminary. I'd want a longer look before I put a number on him.",
      "Wrote this up off a single game. Don't hang your hat on it.",
      "Quick write-up — the follow list is long and he made it, barely.",
      "Clean look in decent conditions, but it's still just the one.",
    ])); 
  }

  if (kind === "game") {
    if (p.isP) {
      const o = {};
      o.fb = doObs("fb", 46);
      o.brk = doObs("brk", 52);
      o.ch = doObs("ch", 62);
      o.cmd = doObs("cmd", 55);
      o.dur = doObs("dur", 75);
      o.delivery = doObs("delivery", 60);
      L(TAG.fb, scoutLine("fb", o.fb, true, true, p));
      L(TAG.brk, scoutLine("brk", o.brk, true, false, p));
      L(TAG.cmd, scoutLine("cmd", o.cmd, true, false, p));
      if (rnd() < 0.5) { const e = pick(["ch", "delivery", "dur"]); L(TAG[e], scoutLine(e, o[e], true, false, p)); }
      reportCloser(p, true, (o.fb + o.brk + o.cmd) / 3, (p.seen.game || 0) > 0).forEach((l) => L(null, l));
      numbers.push(READ.velo(o.fb));
      if (rnd() < 0.55) numbers.push(boxLinePitcher(o));
    } else {
      const o = {};
      o.hit = doObs("hit", 60);
      o.power = doObs("power", 58);
      o.run = doObs("run", 40);
      o.field = doObs("field", 55);
      o.arm = doObs("arm", 52);
      o.disc = doObs("disc", 62);
      L(TAG.hit, scoutLine("hit", o.hit, false, true, p));
      L(TAG.power, scoutLine("power", o.power, false, false, p));
      const extraH = pickN(["field", "run", "arm", "disc"], rnd() < 0.6 ? 1 : 2);
      for (const e of extraH) L(TAG[e], scoutLine(e, o[e], false, false, p));
      reportCloser(p, false, (o.hit + o.power + o.field) / 3, (p.seen.game || 0) > 0).forEach((l) => L(null, l));
      numbers.push(READ.sixty(o.run));
      if (rnd() < 0.65) numbers.push(boxLineHitter(o));
    }
  }

  if (kind === "work") {
    if (p.isP) {
      const fr = clamp(gauss(p.proj, Math.sqrt(38 * ns)), 12, 88);
      observe(p, "frame_cur", fr, 38 * ns * acc("frame"));
      const fb = doObs("fb", 22, 140);
      const brk = doObs("brk", 34, 155);
      const del = doObs("delivery", 30);
      L(null, "Bullpen setting, no hitters.");
      L(TAG.fb, scoutLine("fb", fb, true, false, p));
      L(TAG.brk, scoutLine("brk", brk, true, false, p));
      if (rnd() < 0.6) L(TAG.delivery, scoutLine("delivery", del, true, false, p));
      L(TAG.frame, scoutLine("frame", fr, true, false, p));
      numbers.push(READ.velo(fb), READ.spin(brk));
    } else {
      const fr = clamp(gauss(p.proj, Math.sqrt(36 * ns)), 12, 88);
      observe(p, "frame_cur", fr, 36 * ns * acc("frame"));
      const pw = doObs("power", 24, 140);
      const run = doObs("run", 18, 140);
      const arm = doObs("arm", 22, 140);
      L(null, "Private workout, controlled BP.");
      L(TAG.power, scoutLine("power", pw, false, false, p));
      if (rnd() < 0.7) L(TAG.run, scoutLine("run", run, false, false, p));
      if (rnd() < 0.7) L(TAG.arm, scoutLine("arm", arm, false, false, p));
      L(TAG.frame, scoutLine("frame", fr, false, false, p));
      numbers.push(READ.ev(pw), READ.sixty(run), p.pos === "C" ? READ.pop(arm) : READ.ofArm(arm));
    }
    L(null, "Caveat: cage and workout numbers. None of this was against a pitcher trying to get him out.");
  }

  if (kind === "bg") {
    const mk = clamp(gauss(p.makeup, Math.sqrt(30 * ns)), 12, 88);
    observe(p, "makeup_cur", mk, 30 * ns * acc("makeup"));
    L(TAG.makeup, scoutLine("makeup", mk, p.isP, true, p));
    if (rnd() < 0.6) {
      const h = clamp(gauss(p.health, Math.sqrt(120 * ns)), 12, 88);
      observe(p, "health_cur", h, 120 * ns * acc("health"));
      L(TAG.health, pick(BG_HEALTH[h >= 53 ? "good" : h >= 42 ? "ok" : "bad"]));
    }
    // signability read
    const spread = 0.30 / (1 + 0.35 * game.upgrades.crosscheck + 0.30 * (game.upgrades.agents || 0));
    const lo = Math.max(0.03, p.ask * (1 - spread) * (0.9 + rnd() * 0.2));
    const hi = p.ask * (1 + spread) * (0.9 + rnd() * 0.2);
    p.askKnown = { lo, hi };
    if (p.origin === "HS" && p.ask > 2) L("Leverage", `Committed and the family knows it. Advisor is anchoring high.`);
    else if (p.level === "College senior") L("Leverage", "Senior sign. No leverage whatsoever — he'll take what's offered.");
    else if (p.origin === "INTL") L("Leverage", "Trainer controls the conversation. Deal gets done early or not at all.");
    L("Price", `He signs somewhere around ${moneyK(lo)}–${moneyK(hi)}.`);
  }

  if (kind === "med") {
    const h = clamp(gauss(p.health, Math.sqrt(26 * ns)), 12, 88);
    observe(p, "health_cur", h, 26 * ns);
    L(TAG.health, scoutLine("health", h, p.isP, true, p));
    if (p.arch === "tj") L("History", "Reconstructive elbow surgery 22 months ago. Velocity is back, the file is not clean.");
    if (p.arch === "bounce") L("History", "Missed most of last season. The structural read is the question, not the bat.");
    if (h < 40) L(null, "I would not go to the top of my range on this medical.");
  }

  if (kind === "data") {
    if (p.isP) {
      const fb = doObs("fb", 14, 150); doFut("fb", 150);
      const brk = doObs("brk", 16, 150); doFut("brk", 155);
      const ch = doObs("ch", 20, 160);
      const cmd = doObs("cmd", 26, 160); doFut("cmd", 160);
      numbers.push(READ.velo(fb), READ.spin(brk), READ.ivb(fb), READ.ext(fb), READ.chsep(ch));
      L("Command", `Zone rate ${Math.round(46 + cmd * 0.22)}%, first-pitch strike ${Math.round(44 + cmd * 0.28)}%.`);
      L("Breaking", `Whiff rate on the breaker ${Math.round(14 + brk * 0.45)}%. ${brk >= 58 ? "That's a real bat-misser." : brk <= 40 ? "That does not miss bats." : "Middling."}`);
      L("Projection", `Model translation puts him around a ${clamp(7.51 - (0.32 * fb + 0.24 * brk + 0.14 * ch + 0.30 * cmd) * 0.0666, 2.05, 8.4).toFixed(2)} ERA in full-season ball.`);
    } else {
      const pw = doObs("power", 14, 150); doFut("power", 150);
      const hit = doObs("hit", 30, 160); doFut("hit", 155);
      const disc = doObs("disc", 16, 160);
      const run = doObs("run", 12, 140);
      numbers.push(READ.ev(pw), READ.evAvg(pw), READ.bat(pw), READ.sixty(run));
      L("Approach", `Chase rate ${Math.round(46 - disc * 0.34)}%, in-zone contact ${Math.round(63 + hit * 0.35)}%.`);
      L("Power", `Hard-hit rate ${Math.round(14 + pw * 0.52)}%, sweet-spot ${Math.round(22 + pw * 0.22)}%.`);
      L("Projection", `${hit >= 58 ? "Contact quality and swing decisions both grade out well above his peer group." : hit <= 40 ? "The swing-decision data is ugly. Chase and in-zone whiff are both bottom-decile." : "Data is unremarkable in both directions."}`);
    }
  }

  if (kind === "xc") {
    const tools = p.isP ? pitTools : hitTools;
    const shown = [];
    for (const t of tools) {
      const oc = doObs(t, 30, 150);
      const of_ = doFut(t, 88);
      shown.push([t, oc, of_]);
    }
    const mk = clamp(gauss(p.makeup, Math.sqrt(45 * ns)), 12, 88);
    observe(p, "makeup_cur", mk, 45 * ns);
    const best = shown.slice().sort((a, b) => b[2] - a[2])[0];
    const worst = shown.slice().sort((a, b) => a[2] - b[2])[0];
    
    L(TAG[best[0]], scoutLine(best[0], best[2], p.isP, true, p));
    L(TAG[worst[0]], scoutLine(worst[0], worst[2], p.isP, false, p));
    const ofp = p.isP
      ? 0.32 * shown.find(s => s[0] === "fb")[2] + 0.24 * shown.find(s => s[0] === "brk")[2] + 0.14 * shown.find(s => s[0] === "ch")[2] + 0.30 * shown.find(s => s[0] === "cmd")[2]
      : 0.40 * shown.find(s => s[0] === "hit")[2] + 0.26 * shown.find(s => s[0] === "power")[2] + 0.09 * shown.find(s => s[0] === "run")[2] + 0.16 * shown.find(s => s[0] === "field")[2] + 0.09 * shown.find(s => s[0] === "arm")[2];
    L("OFP", `${r5(ofp)}. ${ofp >= 60 ? "First-division regular or better. Take him wherever." : ofp >= 52 ? "Everyday player if it comes together. Worth real money." : ofp >= 45 ? "Second-division regular / bench profile." : "Org depth. Don't spend on this."}`);
  }

  // The closer already carries the caveat. A second one contradicted the first
  // ("cold and windy" followed by "conditions were fine"), so it's gone.

  const venue = p.isP || !p.isP
    ? (p.origin === "COL" ? pick(VENUES_COL) : pick(VENUES_HS))
    : pick(VENUES_HS);
  const months = ["Feb", "Mar", "Mar", "Apr", "Apr", "May", "May", "Jun"];
  const header = kind === "area" ? `${pick(["Feb", "Mar", "Mar", "Apr"])} ${ri(1, 28)} — area coverage`
    : kind === "game" ? `${pick(months)} ${ri(1, 28)} — ${venue}`
    : kind === "work" ? `${pick(months)} ${ri(1, 28)} — private workout`
    : kind === "bg" ? `${pick(months)} ${ri(1, 28)} — background`
    : kind === "med" ? `${pick(months)} ${ri(1, 28)} — medical file`
    : kind === "data" ? `${pick(months)} ${ri(1, 28)} — data review`
    : `${pick(months)} ${ri(1, 28)} — cross-check`;

  const shakyFlag = typeof shaky !== "undefined" && shaky;
  const by = kind === "xc" ? scoutName() : kind === "data" ? "R&D" : kind === "med" ? "Medical"
    : (sc ? sc.name : (p.areaScout || (p.areaScout = scoutName())));
  p.reports.push({ id: Math.random().toString(36).slice(2), kind, header, lines, numbers, by, shaky: shakyFlag });
  p.looks += LOOK_DEFS[kind].cost;
  p.seen[kind] = (p.seen[kind] || 0) + 1;
}

/* ============================================================
   CAREER SIMULATION
   ============================================================ */
const LEVELS = ["Complex", "Low-A", "High-A", "Double-A", "Triple-A", "MLB"];
const DOLLARS_PER_WAR = 8.5;
const MIN_SALARY = 0.78;

function hitOVR(g) { return 0.40 * g.hit + 0.26 * g.power + 0.09 * g.run + 0.16 * g.field + 0.09 * g.arm; }
function pitOVR(g) { return 0.32 * g.fb + 0.24 * g.brk + 0.14 * g.ch + 0.30 * g.cmd; }

function simCareer(p, bonus, upgrades) {
  const devBoost = 1 + 0.12 * (upgrades.playerdev || 0);
  const medBoost = 1 + 0.08 * (upgrades.medical || 0);
  const g = { ...p.cur };
  const ceil = { ...p.fut };

  // ---- The development path: the part no scout can see ----
  // Tools are only the starting conditions. What a player does with six years of
  // professional coaching is its own roll, and it can go well past what anybody
  // projected — or nowhere at all. Makeup tilts the odds; it does not decide them.
  const mkTilt = (p.makeup - 50) / 22;
  const youthVar = p.age <= 18.5 ? 1.30 : p.age <= 20.5 ? 1.10 : p.age <= 22 ? 0.92 : 0.78;
  const pathRoll = clamp(rnd() + mkTilt * 0.085, 0, 1);
  let devPath, ceilBoost, realBase, earlyRate = 1, lateRate = 1;
  if (pathRoll > 0.952) { devPath = "breakout"; ceilBoost = ri(9, 21) * youthVar; realBase = 1.02; }
  else if (pathRoll > 0.892) { devPath = "late"; ceilBoost = ri(5, 15) * youthVar; realBase = 0.95; earlyRate = 0.45; lateRate = 2.1; }
  else if (pathRoll > 0.445) { devPath = "steady"; ceilBoost = ri(-2, 3); realBase = 0.80; }
  else if (pathRoll > 0.195) { devPath = "stalled"; ceilBoost = -ri(3, 10); realBase = 0.60; }
  else { devPath = "flat"; ceilBoost = -ri(3, 8); realBase = 0.40; earlyRate = 0.5; lateRate = 0.5; }

  for (const k in ceil) {
    const share = GROWTH_SHARE[k] ?? 0.7;
    ceil[k] = clamp(ceil[k] + ceilBoost * share, 20, 80);
  }
  const real = clamp(gauss(realBase + (p.makeup - 50) * 0.0035, 0.22), 0.05, 1.45);
  for (const k in ceil) ceil[k] = clamp(Math.round(g[k] + (ceil[k] - g[k]) * real), 20, 80);

  let age = p.age;
  let li = p.origin === "COL" ? 1 : p.origin === "JUCO" ? 1 : 0;
  const years = [];
  let mlbYears = 0, totalWAR = 0, totalSalary = 0;
  let done = false, outcome = "", careerOver = false;
  let prevWAR = 0;
  let injuryDamage = 0;
  let peakWAR = 0;
  let badYears = 0;
  let injuryDays = 0, debutGrades = null, reliefYears = 0, startYears = 0, paSum = 0, seasonsPlayed = 0;
  const honors = [];

  for (let yr = 1; yr <= 14 && !done; yr++) {
    age += 1;
    // development
    const ageF = age <= 20 ? 1.25 : age <= 22 ? 1.0 : age <= 25 ? 0.72 : age <= 28 ? 0.3 : -0.12;
    for (const k in g) {
      const gap = ceil[k] - g[k];
      const phase = age <= 22.5 ? earlyRate : lateRate;
      const rate = (0.20 + (p.makeup - 50) * 0.0022) * devBoost * ageF * phase * (0.45 + rnd() * 1.2);
      let d = gap * Math.max(0, rate);
      if (age >= 30) d -= (k === "run" || k === "fb" ? ri(1, 4) : ri(0, 2));
      if (rnd() < 0.05) d += gauss(0, 3.5); // random breakout/backslide
      g[k] = clamp(g[k] + d, 20, 80);
    }
    // injury
    let missed = 0, injNote = "";
    const injRisk = clamp(0.30 - (p.health - 50) * 0.0042 / 1 - (medBoost - 1) * 0.08, 0.05, 0.55);
    if (rnd() < injRisk) {
      const sev = rnd();
      if (sev < 0.55) { missed = ri(15, 45); injNote = pick(["strained oblique", "hamstring strain", "sprained thumb", "forearm tightness", "back spasms"]); }
      else if (sev < 0.86) { missed = ri(60, 110); injNote = pick(["hamate surgery", "shoulder inflammation", "high ankle sprain", "elbow inflammation", "sports hernia"]); injuryDamage += 1; }
      else { missed = ri(140, 240); injNote = p.isP ? "UCL reconstruction" : pick(["labrum surgery", "second knee operation", "fractured wrist"]); injuryDamage += 3; for (const k in g) g[k] = clamp(g[k] - ri(1, 5), 20, 80), ceil[k] = clamp(ceil[k] - ri(1, 4), 20, 80); }
    }
    injuryDays += missed;
    const ovr = p.isP ? pitOVR(g) : hitOVR(g);

    // level movement
    const needed = [28, 34, 38, 42, 45, 48];
    if (li < 5) {
      const thr = needed[li + 1];
      if (ovr >= thr + gauss(0, 1.5) && missed < 100) li += 1;
      else if (ovr >= thr - 3 && rnd() < 0.35 && missed < 100) li += 1;
    }
    const level = LEVELS[li];
    const inMLB = li === 5;

    // performance
    let line = "", war = 0, salary = 0, st = {};
    const lvlBoost = inMLB ? 0 : (5 - li) * 2.2; // easier competition below
    if (!p.isP) {
      const eg = { hit: g.hit + lvlBoost, power: g.power, run: g.run, field: g.field, disc: g.disc + lvlBoost };
      // Calibrated to the live league: MLB 2026 is .244/.318/.401, 8.9% walks,
      // 1.16 homers a game. A 50 grade should look like that and no better.
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
      st = { avg, obp, slg, ops: obp + slg, hr, pa: fullPA };
      line = fullPA < 40 ? `Missed the season`
        : `${avg.toFixed(3).slice(1)}/${obp.toFixed(3).slice(1)}/${slg.toFixed(3).slice(1)}, ${hr} HR, ${sb} SB in ${fullPA} PA`;
      if (inMLB) {
        paSum += fullPA; if (fullPA >= 40) seasonsPlayed++;
        const ops = obp + slg;
        const offR = fullPA < 40 ? 0 : (ops - 0.719) * 200 * (fullPA / 600);
        const defR = ((g.field - 50) * 0.34 + (POS_ADJ[p.pos] ?? 0)) * (fullPA / 600);
        const repR = 20 * (fullPA / 600);
        war = (offR + defR + repR) / 9.7;
      }
    } else {
      const eg = { fb: g.fb, brk: g.brk, ch: g.ch, cmd: g.cmd + lvlBoost };
      const stuff = 0.32 * eg.fb + 0.24 * eg.brk + 0.14 * eg.ch + 0.30 * eg.cmd;
      // League ERA is about 4.18. A 50 sits there; a 70 is an ace at 2.85.
      const era = clamp(7.51 - stuff * 0.0666 + gauss(0, 0.46) - lvlBoost * 0.05, 2.05, 8.40);
      const isRP = g.dur < 42 || (p.arch === "relief" && g.dur < 52);
      let ip = isRP ? clamp(Math.round(66 - missed * 0.36 + gauss(0, 8)), 0, 82)
        : clamp(Math.round((inMLB ? 172 : 128) - missed * 0.95 + gauss(0, 18) - Math.max(0, 52 - g.dur) * 2.0), 0, 215);
      const k9 = clamp(2.2 + eg.fb * 0.062 + eg.brk * 0.062 + (isRP ? 1.1 : 0) + gauss(0, 0.55), 3, 16);
      const bb9 = clamp(6.70 - eg.cmd * 0.0668 + gauss(0, 0.48), 0.8, 8);
      st = { era, ip, k: Math.round((k9 * ip) / 9), isRP };
      line = ip < 8 ? `Missed the season`
        : `${ipString(ip * 3 + ri(0, 2))} IP, ${era.toFixed(2)} ERA, ${k9.toFixed(1)} K/9, ${bb9.toFixed(1)} BB/9${isRP ? " · relief" : ""}`;
      if (inMLB) {
        if (ip >= 8) { seasonsPlayed++; if (isRP) reliefYears++; else startYears++; }
        war = ip < 8 ? 0 : ((5.25 - era) * ip / 9) / 9.7 + (isRP ? 0.15 : 0);
      }
    }
    war = Math.round(war * 10) / 10;
    if (inMLB) {
      if (!debutGrades) debutGrades = { ...g };
      mlbYears += 1;
      if (mlbYears <= 3) salary = MIN_SALARY;
      else if (mlbYears === 4) salary = Math.max(0.9, prevWAR * DOLLARS_PER_WAR * 0.19);
      else if (mlbYears === 5) salary = Math.max(1.2, prevWAR * DOLLARS_PER_WAR * 0.34);
      else salary = Math.max(1.6, prevWAR * DOLLARS_PER_WAR * 0.52);
      salary = Math.round(salary * 10) / 10;
      totalWAR += war;
      totalSalary += salary;
      prevWAR = Math.max(prevWAR * 0.5, war);
      peakWAR = Math.max(peakWAR, war);
    }

    // What the industry would give up for him right now. Distance from the majors
    // is most of it — a loud 18-year-old on a back field is a lottery ticket, and
    // the market prices him like one.
    // ---- hardware ----
    const aw = [];
    if (inMLB && (p.isP ? st.ip >= 40 : st.pa >= 150)) {
      // Thirty clubs share these. They should be scarce enough that one means something.
      if (mlbYears === 1 && war >= 3.2 && rnd() < 0.16) aw.push("Rookie of the Year");
      if (war >= 4.6 ? rnd() < 0.44 : war >= 3.5 ? rnd() < 0.18 : false) aw.push("All-Star");
      if (!p.isP && war >= 7.4 && rnd() < 0.22) aw.push("MVP");
      if (p.isP && war >= 6.2 && !st.isRP && rnd() < 0.24) aw.push("Cy Young");
      if (!p.isP && p.pos !== "DH" && p.pos !== "1B" && g.field >= 63 && war >= 3.2 && rnd() < 0.16) aw.push("Gold Glove");
      if (!p.isP && st.ops >= 0.890 && war >= 3.8 && rnd() < 0.18) aw.push("Silver Slugger");
      if (!p.isP && st.avg >= 0.336 && rnd() < 0.22) aw.push("Batting title");
      if (!p.isP && st.hr >= 42) aw.push(`${st.hr}-homer season`);
      if (p.isP && !st.isRP && st.era <= 2.70 && st.ip >= 160 && rnd() < 0.20) aw.push("ERA title");
      if (p.isP && st.k >= 235) aw.push(`${st.k}-strikeout season`);
      if (p.isP && st.isRP && war >= 2.6 && rnd() < 0.22) aw.push("Reliever of the Year");
    }
    aw.forEach((a) => honors.push(a));

    const youth = clamp(1.5 - (Math.floor(age) - 20) * 0.09, 0.45, 1.5);
    const LVL_MULT = { Complex: 0.20, "Low-A": 0.30, "High-A": 0.45, "Double-A": 0.66, "Triple-A": 0.82, MLB: 1.0 };
    const mktValue = Math.round(Math.min(120,
      Math.pow(Math.max(0, ovr - 42), 1.6) * 0.30 * youth * (LVL_MULT[level] ?? 0.5)) * 10) / 10;
    years.push({ year: yr, age: Math.floor(age), level, line, war: inMLB ? war : null,
      salary: inMLB ? salary : null, injNote, missed, ovr: Math.round(ovr), mktValue, awards: aw });

    if (inMLB && war < 0.2) badYears += 1;
    if (mlbYears >= 6) { done = true; outcome = "control-complete"; }
    if (inMLB && badYears >= 2 && mlbYears >= 2) { done = true; careerOver = true; outcome = "released"; }
    if (!inMLB && age >= 25 && ovr < 41 && rnd() < 0.55) { done = true; careerOver = true; outcome = "released"; }
    if (!inMLB && age >= 27) { done = true; careerOver = true; outcome = "released"; }
    if (injuryDamage >= 5) { done = true; careerOver = true; outcome = "injury-ended"; }
  }

  // ---- Trades. Players get moved, and what comes back is yours. ----
  // You are credited HIS SHARE of the deal, never the whole return. He is priced
  // off what he looked worth on the day he was moved — a noisy read on what he
  // actually became — and if he was one of three pieces going out, the club got
  // roughly three times his value back and he is credited his third of it.
  // Sometimes you sell high on a bust. Sometimes you give away a star for a rental.
  let trade = null;
  const tradeable = years.map((y, i) => ({ i, v: y.mktValue })).filter((x) => x.v > 0.04);
  if (tradeable.length && rnd() < 0.32) {
    const wsum = tradeable.reduce((a, x) => a + x.v, 0);
    let pickN2 = rnd() * wsum, chosen = tradeable[0];
    for (const x of tradeable) { pickN2 -= x.v; if (pickN2 <= 0) { chosen = x; break; } }
    const y = years[chosen.i];
    const ret = Math.round(y.mktValue * Math.exp(gauss(0, 0.30) - 0.045) * 10) / 10;
    // how many pieces went out with him
    const pr = rnd();
    const pkgSize = pr < 0.55 ? 1 : pr < 0.83 ? 2 : pr < 0.96 ? 3 : 4;
    let othersValue = 0;
    for (let q = 1; q < pkgSize; q++) othersValue += ret * (0.35 + rnd() * 1.05);
    othersValue = Math.round(othersValue * 10) / 10;
    const dealTotal = Math.round((ret + othersValue) * 10) / 10;
    const RET_DESC = dealTotal < 6 ? "a fringe bullpen arm"
      : dealTotal < 14 ? "a useful reliever"
      : dealTotal < 30 ? "a solid everyday regular"
      : dealTotal < 58 ? "a very good everyday player"
      : dealTotal < 100 ? "a bona fide All-Star"
      : "a franchise cornerstone";
    const keptWAR = years.slice(0, chosen.i + 1).reduce((a, b) => a + (b.war || 0), 0);
    const keptSal = years.slice(0, chosen.i + 1).reduce((a, b) => a + (b.salary || 0), 0);
    const lostWAR = Math.round((totalWAR - keptWAR) * 10) / 10;
    trade = { atIndex: chosen.i, age: y.age, level: y.level, ret, pkgSize, othersValue, dealTotal,
      desc: RET_DESC, share: Math.round((ret / Math.max(0.1, dealTotal)) * 100),
      keptWAR: Math.round(keptWAR * 10) / 10, keptSal: Math.round(keptSal * 10) / 10, lostWAR };
    years.forEach((yy, i) => { if (i > chosen.i) yy.afterTrade = true; });
  }

  let verdict;
  if (trade && trade.keptWAR < 0.2 && mlbYears === 0) verdict = "Traded as a prospect. He never played a game for you.";
  else if (trade && trade.keptWAR < 0.2) verdict = "Traded before he contributed anything on the field.";
  else if (outcome === "released") verdict = mlbYears > 0 ? "Never stuck. Released after a cup of coffee." : "Never made it. Released as a minor league free agent.";
  else if (outcome === "injury-ended") verdict = "Career derailed by injuries.";
  else if (peakWAR >= 6) verdict = "Superstar. Perennial MVP candidate.";
  else if (peakWAR >= 4.5) verdict = "All-Star. Cornerstone of the roster.";
  else if (peakWAR >= 3) verdict = "Quality everyday regular.";
  else if (peakWAR >= 1.8) verdict = "Solid regular / second-division starter.";
  else if (peakWAR >= 0.8) verdict = "Useful role player.";
  else if (mlbYears >= 2) verdict = "Up-and-down bench piece.";
  else verdict = "Fringe major leaguer.";

  // ---- role, and an honest account of why the numbers came out this way ----
  let role;
  if (p.isP) {
    role = reliefYears === 0 && startYears === 0 ? "Never pitched in the majors"
      : reliefYears === 0 ? "Starter"
      : startYears === 0 ? "Reliever"
      : startYears >= reliefYears ? "Starter / swingman" : "Swingman / reliever";
  } else {
    const pa = seasonsPlayed ? paSum / seasonsPlayed : 0;
    role = seasonsPlayed === 0 ? "Never played in the majors"
      : pa >= 500 ? `Everyday ${p.pos}` : pa >= 340 ? `Part-time ${p.pos}` : `Bench ${p.pos}`;
  }

  const notes = [];
  const MK = r5(p.makeup);
  const DEV_STORY = {
    breakout: [
      `Nobody saw this coming, including you. He added strength and rebuilt his swing in the low minors and turned into a completely different player than the one you signed.`,
      `He outgrew the report. A mechanical change at ${Math.floor(p.age) + 3} unlocked tools that weren't there on draft day.`,
      `A genuine breakout. Whatever the organization did with him worked, and he finished well past any grade anyone put on him.`,
    ],
    late: [
      `Nothing for three years, then it clicked. Some players need to be 24 before the ability shows up in games.`,
      `Slow starter. He was overmatched at every level until suddenly he wasn't, and the last half of his control years were the good half.`,
    ],
    steady: [`He developed about the way you'd expect from where he started.`],
    stalled: [
      `The development stalled out. He got to a level, stopped improving, and the tools never turned into performance.`,
      `Plateaued in the upper minors. The ability was real; the adjustments never came.`,
    ],
    flat: [
      `He was the same player at 26 that he was at 20. No progress at all — which happens more often than anyone signing these players likes to admit.`,
      `Never developed. The tools on draft day were the tools he retired with.`,
    ],
  };
  notes.push(pick(DEV_STORY[devPath]));
  if (devPath === "breakout" || devPath === "late") {
    if (p.makeup >= 58) notes.push(`Makeup ${MK}. The work ethic was reported as a strength and it showed up — those players convert projection into performance more often.`);
    else if (p.makeup <= 42) notes.push(`Makeup ${MK}, and it happened anyway. Character reports tilt the odds; they don't settle them.`);
  } else if (devPath === "stalled" || devPath === "flat") {
    if (p.makeup <= 42) notes.push(`Makeup ${MK}. The questions in the background work were the right questions.`);
    else if (p.makeup >= 58) notes.push(`Makeup ${MK} — he did the work. It still didn't come. Effort isn't a guarantee.`);
  }
  if (trade) {
    notes.push(
      (trade.pkgSize === 1
        ? `Traded at ${trade.age} out of ${trade.level}, straight up, for ${trade.desc}. The return was valued at ${money(trade.dealTotal)} and all of it is credited to you.`
        : `Traded at ${trade.age} out of ${trade.level} as one of ${trade.pkgSize} pieces going out for ${trade.desc}. The whole deal was worth about ${money(trade.dealTotal)}; he was ${trade.share}% of what the other club was buying, so ${money(trade.ret)} of it is credited to you.`) +
      (trade.lostWAR >= 6 ? ` He produced ${trade.lostWAR} more WAR after the deal that you never saw — you sold low.`
        : trade.lostWAR <= 0.6 ? ` He did almost nothing afterward. You sold at exactly the right time.`
        : ` He produced ${trade.lostWAR} WAR elsewhere after the deal.`));
  }
  const keyTools = p.isP ? ["fb", "brk", "ch", "cmd"] : ["hit", "power", "run", "field", "arm"];
  const finalAvg = keyTools.reduce((a, k) => a + g[k], 0) / keyTools.length;
  const debutAvg = debutGrades ? keyTools.reduce((a, k) => a + debutGrades[k], 0) / keyTools.length : null;

  if (debutAvg != null && finalAvg - debutAvg >= 6)
    notes.push(`He arrived unfinished. The grades below are where he ended up — he spent the first half of your six years getting there, and you paid for the climb as well as the peak.`);
  if (injuryDays >= 240)
    notes.push(`Lost ${injuryDays} days to injury — most of two seasons${injuryDamage >= 3 ? ", and the tools never fully came back" : ""}.`);
  else if (injuryDays >= 110)
    notes.push(`Missed ${injuryDays} days to injury, which cost him a good chunk of a season.`);
  if (p.isP && reliefYears > 0 && startYears === 0)
    notes.push(`Relief only. His durability never supported a rotation workload, and sixty innings caps what any arm can be worth — even a good one.`);
  else if (p.isP && reliefYears > 0)
    notes.push(`Bounced between the rotation and the bullpen, which held his innings down.`);
  if (!p.isP && (POS_ADJ[p.pos] ?? 0) <= -7)
    notes.push(`A ${p.pos} has to hit a great deal to be worth anything — the position itself costs about ${Math.abs(POS_ADJ[p.pos])} runs a year against a shortstop or catcher.`);
  if (!p.isP && g.disc <= 42 && g.hit >= 55)
    notes.push(`He hit for average without walking. A ${r5(g.disc)} approach keeps the on-base number ordinary no matter how good the bat is.`);
  if (!p.isP && g.power <= 42 && g.hit >= 58)
    notes.push(`Contact without damage. Singles from a corner spot don't move the needle much.`);
  if (!p.isP && seasonsPlayed > 0 && paSum / seasonsPlayed < 380 && mlbYears >= 3)
    notes.push(`Never locked down everyday at-bats, so even good rate stats came in small doses.`);
  if (mlbYears < 6 && outcome === "released")
    notes.push(`The six years of control ran out early — you don't get value from years he wasn't on the roster.`);
  if (notes.length === 0 && peakWAR >= 3)
    notes.push(`Healthy, played every day, and the tools showed up. This is what it looks like when it works.`);

  const value = (trade ? trade.keptWAR : totalWAR) * DOLLARS_PER_WAR;
  const paidSalary = trade ? trade.keptSal : totalSalary;
  const devCost = 1.1 + years.filter((y, i) => y.level !== "MLB" && (!trade || i <= trade.atIndex)).length * 0.35;
  const surplus = value + (trade ? trade.ret : 0) - paidSalary - bonus - devCost;

  return {
    years, totalWAR: Math.round(totalWAR * 10) / 10, totalSalary: Math.round(totalSalary * 10) / 10,
    value: Math.round(value * 10) / 10, surplus: Math.round(surplus * 10) / 10,
    peakWAR: Math.round(peakWAR * 10) / 10, mlbYears, verdict, bonus, devCost: Math.round(devCost * 10) / 10,
    finalGrades: g, debutGrades, reachedMLB: mlbYears > 0, role, notes, injuryDays,
    avgPA: seasonsPlayed ? Math.round(paSum / seasonsPlayed) : 0,
    trade, devPath, totalSalary: Math.round(paidSalary * 10) / 10,
    honors, honorList: summariseHonors(honors),
  };
}

// "3x All-Star, MVP, Gold Glove" rather than a list of nine lines.
function summariseHonors(list) {
  if (!list.length) return [];
  const order = ["MVP", "Cy Young", "Rookie of the Year", "All-Star", "Gold Glove", "Silver Slugger",
    "Batting title", "ERA title", "Reliever of the Year"];
  const counts = {};
  for (const h of list) counts[h] = (counts[h] || 0) + 1;
  const keys = Object.keys(counts).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return keys.map((k) => (counts[k] > 1 ? `${counts[k]}\u00d7 ${k}` : k));
}

/* ============================================================
   UPGRADES
   ============================================================ */
const UPGRADES = [
  { k: "scouts", name: "Area scout network", max: 4, cost: [55, 130, 240, 400],
    desc: ["Two more area guys. +4 looks and +1 signing slot each spring.", "Regional coverage. +4 looks, +1 slot.", "Full national coverage. +4 looks, +1 slot.", "Best staff in the game. +4 looks, +1 slot."],
    effect: "+4 looks and +1 signing slot per spring, sharper area reports" },
  { k: "crosscheck", name: "Cross-checkers", max: 3, cost: [70, 165, 320],
    desc: ["Hire a national cross-checker. Unlocks cross-check looks.", "Second cross-checker. Sharper reads.", "Elite evaluation staff."],
    effect: "Unlocks cross-check; reduces noise on every look" },
  { k: "analytics", name: "Analytics department", max: 3, cost: [65, 155, 300],
    desc: ["Build the department. Unlocks data pulls.", "Proprietary models. Much tighter data.", "Best-in-class R&D."],
    effect: "Unlocks data pull; very precise measurables" },
  { k: "medical", name: "Medical & performance", max: 3, cost: [50, 120, 235],
    desc: ["Team physician on staff. Unlocks medical reviews.", "Full performance staff.", "Elite sports-science group."],
    effect: "Unlocks medicals; signed players get hurt less" },
  { k: "playerdev", name: "Player development", max: 4, cost: [85, 175, 330, 520],
    desc: ["Rebuild the complex and coaching staff.", "Pitching lab and hitting lab.", "Individualized dev plans.", "Best dev system in baseball."],
    effect: "+12% development rate per tier for everyone you sign" },
  { k: "intl", name: "International operations", max: 3, cost: [60, 140, 265],
    desc: ["Open a Dominican academy. Adds international amateurs to your class.", "Expand to Venezuela and Colombia.", "Global pipeline."],
    effect: "Adds international free agents (younger, cheaper, riskier)" },
  { k: "pool", name: "Bonus pool", max: 4, cost: [45, 105, 200, 340],
    desc: ["Ownership frees up money. +$4M pool.", "+$5M pool.", "+$6M pool.", "+$8M pool."],
    effect: "More money to sign players each spring" },
  { k: "video", name: "Video & coverage tech", max: 3, cost: [40, 95, 190],
    desc: ["Video everywhere. You see more of the class.", "Expanded coverage.", "Nothing gets past you."],
    effect: "More prospects appear in your class each spring" },
];
const upgCost = (u, tier) => u.cost[tier];

function looksMax(g) { return 18 + 4 * g.upgrades.scouts; }
function signMax(g) { return 5 + g.upgrades.scouts; }
function poolMax(g) { return 9 + [0, 4, 9, 15, 23][g.upgrades.pool]; }
function classSize(g) { return 22 + 5 * g.upgrades.video + (g.upgrades.intl > 0 ? 3 + 3 * g.upgrades.intl : 0); }

/* ============================================================
   GAME STATE
   ============================================================ */
function newGame() {
  const g = {
    v: 4,
    year: 2026,
    budget: 0,
    lifetimeSurplus: 0,
    upgrades: { scouts: 0, crosscheck: 0, analytics: 0, medical: 0, playerdev: 0, intl: 0, pool: 0, video: 0 },
    looksLeft: 10,
    poolLeft: 9,
    offers: {},
    prospects: [],
    history: [],
    phase: "office",
    lastResults: null,
  };
  return g;
}
function buildClass(g) {
  const n = classSize(g);
  const arr = [];
  const nIntl = g.upgrades.intl > 0 ? 3 + 3 * g.upgrades.intl : 0;
  for (let i = 0; i < n - nIntl; i++) arr.push(genProspect(g.year));
  for (let i = 0; i < nIntl; i++) arr.push(genProspect(g.year, { intl: true }));

  // Every class has names the industry is wrong about in both directions.
  for (let i = 0; i < 3; i++) {
    const sleeper = genProspect(g.year);
    // force real talent, then bury the price and the ranking
    if (sleeper.tv < 48) { arr.push(sleeper); continue; }
    sleeper.buzz = clamp(Math.round(sleeper.buzz - ri(16, 30)), 20, 80);
    sleeper.askBase = Math.max(0.08, Math.round(Math.pow(Math.max(0, sleeper.buzz - 30) / 24, 3.1) * 5.6 * 100) / 100 + 0.1);
    sleeper.ask = sleeper.askBase;
    arr.push(sleeper);
  }
  for (let i = 0; i < 2; i++) {
    const hyped = genProspect(g.year);
    hyped.buzz = clamp(Math.round(hyped.buzz + ri(10, 22)), 20, 82);
    hyped.askBase = Math.round(Math.pow(Math.max(0, hyped.buzz - 30) / 24, 3.1) * 5.6 * 100) / 100 + 0.1;
    hyped.ask = hyped.askBase;
    arr.push(hyped);
  }

  arr.sort((a, b) => b.buzz - a.buzz);
  arr.forEach((p, i) => (p.rank = i + 1));
  // your area staff files a rough report on everyone before you spend a single trip
  for (const p of arr) runLook(g, p, "area");
  return arr;
}

