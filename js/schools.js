/* ============================================================
   SCHOOLS
   Every school belongs to a state, and the state a player comes from is the
   state he plays in. The level is legible from the name itself: "HS", a
   university with a city, "Community College" or "Junior College" for the
   two-year schools. All fictional, so nothing is attached to a real programme.
   ============================================================ */

// state -> [towns/qualifiers used for both high schools and colleges]
const REGIONS = {
  TX: ["Bandera", "Kerrville", "Sugar Land", "Amarillo", "Del Rio", "Bastrop", "Lufkin", "Odessa", "Waxahachie", "Katy"],
  CA: ["Chino Hills", "Modesto", "Redlands", "Camarillo", "Turlock", "Escondido", "Visalia", "Novato", "Clovis"],
  FL: ["Palm Bay", "Ocala", "Sarasota", "Wellington", "Lakeland", "Port Charlotte", "Bradenton", "Estero"],
  GA: ["Marietta", "Kennesaw", "Valdosta", "Douglasville", "Statesboro", "Peachtree", "Rome"],
  NC: ["Cary", "Concord", "Hickory", "Wilmington", "Gastonia", "Matthews", "Apex"],
  TN: ["Franklin", "Cleveland", "Murfreesboro", "Collierville", "Maryville", "Cookeville"],
  AZ: ["Gilbert", "Peoria", "Surprise", "Oro Valley", "Chandler", "Yuma"],
  OK: ["Broken Arrow", "Edmond", "Bixby", "Moore", "Owasso", "Jenks"],
  LA: ["Slidell", "Lafayette", "Ruston", "Houma", "Zachary", "Sulphur"],
  AL: ["Hoover", "Madison", "Prattville", "Enterprise", "Fairhope", "Cullman"],
  SC: ["Fort Mill", "Summerville", "Greer", "Lexington", "Florence", "Easley"],
  OH: ["Massillon", "Mason", "Hilliard", "Elyria", "Springboro", "Lancaster"],
  IL: ["Naperville", "Edwardsville", "Barrington", "Normal", "Quincy", "Moline"],
  MO: ["Blue Springs", "Nixa", "Ozark", "Chesterfield", "Liberty", "Rolla"],
  VA: ["Chesapeake", "Salem", "Midlothian", "Manassas", "Blacksburg", "Suffolk"],
  WA: ["Puyallup", "Yakima", "Bellingham", "Kennewick", "Redmond", "Wenatchee"],
  NJ: ["Toms River", "Cherry Hill", "Hackensack", "Wall Township", "Vineland"],
  PA: ["Bethel Park", "Lancaster", "Doylestown", "Altoona", "Norristown"],
  IN: ["Carmel", "Zionsville", "Munster", "Terre Haute", "Kokomo"],
  MS: ["Brandon", "Petal", "Gulfport", "Oxford", "Southaven"],
  AR: ["Bentonville", "Conway", "Jonesboro", "Cabot", "Russellville"],
  NV: ["Henderson", "Sparks", "Summerlin", "Carson City"],
  KY: ["Bowling Green", "Owensboro", "Florence", "Paducah", "Elizabethtown"],
  MI: ["Grandville", "Portage", "Novi", "Midland", "Saline"],
};
const STATE_LIST = Object.keys(REGIONS);

const HS_STYLE = ["{T} High", "{T} High", "{T} High", "{T} Central High", "{T} North High",
  "{T} South High", "{T} East High", "{T} West High", "Bishop {S} High", "Saint {S} High",
  "{T} Prep", "{T} Catholic High", "{T} Academy", "{N} High"];
const SAINTS = ["Ambrose", "Bede", "Cyprian", "Dominic", "Fabian", "Gerard", "Ignatius",
  "Jerome", "Killian", "Leo", "Malachy", "Norbert", "Oswald", "Pius"];
const NATURE = ["Cedar Ridge", "Copper Creek", "Fox Hollow", "Granite Bay", "Hawk Valley",
  "Juniper Flats", "Larkspur", "Maple Bend", "Pine Hollow", "Quail Run", "Sable Ridge",
  "Stony Brook", "Timber Ridge", "Wolf Creek"];

const COL_STYLE = ["{T} State", "{T} State", "University of {ST}", "{T} University",
  "{T} College", "Saint {S}'s College", "{T} Tech", "{T} A&M", "{ST} Southern", "{ST} Wesleyan", "{N} College"];
const STATE_FULL = { TX: "Texas", CA: "California", FL: "Florida", GA: "Georgia", NC: "Carolina",
  TN: "Tennessee", AZ: "Arizona", OK: "Oklahoma", LA: "Louisiana", AL: "Alabama", SC: "Carolina",
  OH: "Ohio", IL: "Illinois", MO: "Missouri", VA: "Virginia", WA: "Washington", NJ: "Jersey",
  PA: "Pennsylvania", IN: "Indiana", MS: "Mississippi", AR: "Arkansas", NV: "Nevada",
  KY: "Kentucky", MI: "Michigan" };

const JC_STYLE = ["{T} Community College", "{T} Junior College", "{T} County CC",
  "{ST} Community College", "{T} CC"];

function fillSchool(tpl, st) {
  return tpl
    .replace("{T}", pick(REGIONS[st]))
    .replace("{S}", pick(SAINTS))
    .replace("{N}", pick(NATURE))
    .replace("{ST}", STATE_FULL[st] || st);
}
function makeHighSchool(st) { return fillSchool(pick(HS_STYLE), st); }
function makeCollege(st) { return fillSchool(pick(COL_STYLE), st); }
function makeJuco(st) { return fillSchool(pick(JC_STYLE), st); }

// How a school reads on a report line, with the level made explicit.
function schoolLine(p) {
  if (p.origin === "INTL") return p.school;
  return `${p.school}, ${p.home}`;
}
