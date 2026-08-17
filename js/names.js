/* ============================================================
   NAMES
   The old pools held 60 American surnames, so roughly one player in fifty
   shared any given one and a 74-man follow list routinely had two Halloransin
   it. These are about five times larger, and weighted so common surnames are
   common and unusual ones are unusual, the way a real list reads.
   ============================================================ */

const NAMES_US_FIRST = [
  "Aaron","Abel","Adrian","Aidan","Alec","Andre","Angus","Anthony","Archer","Arlo","Asher","August","Austin","Avery",
  "Barrett","Beau","Beckett","Bennett","Blaine","Blake","Bo","Boone","Braden","Bradley","Brady","Brandon","Braxton",
  "Brayden","Brendan","Brennan","Brett","Brody","Bryce","Bryson","Byron","Caleb","Callum","Camden","Cameron","Carson",
  "Carter","Case","Casey","Cash","Chance","Charlie","Chase","Chris","Clay","Clayton","Cody","Colby","Cole","Colin",
  "Collin","Colt","Colton","Conner","Connor","Cooper","Corbin","Corey","Cormac","Craig","Crew","Cristian","Cullen",
  "Curtis","Cyrus","Dallas","Dalton","Damon","Dane","Daniel","Darius","Davis","Dawson","Dean","Declan","Derek","Desmond",
  "Devin","Dexter","Dillon","Dominic","Donovan","Drake","Drew","Duke","Dustin","Dylan","Easton","Eli","Elias","Elijah",
  "Elliot","Emerson","Emmett","Eric","Ethan","Evan","Everett","Ezra","Finn","Finnegan","Fletcher","Flynn","Ford",
  "Foster","Gabe","Gage","Gannon","Garrett","Gavin","Grady","Graham","Grant","Grayson","Griffin","Gunnar","Hank",
  "Harlan","Harrison","Hayden","Hayes","Heath","Hendrix","Holden","Houston","Hudson","Hunter","Ian","Isaac","Isaiah",
  "Jace","Jack","Jackson","Jacob","Jaden","Jake","Jalen","James","Jared","Jasper","Jaxon","Jay","Jayce","Jaylen",
  "Jedidiah","Jeremiah","Jesse","Joel","Jonah","Jordan","Joseph","Josh","Judah","Judd","Julian","Justin","Kade",
  "Kaden","Kai","Kaleb","Kane","Keegan","Keith","Kellan","Kelvin","Kendrick","Kenny","Kevin","Killian","King","Knox",
  "Kobe","Kolby","Kyle","Kyler","Lachlan","Landon","Lane","Lawson","Layne","Leo","Levi","Lincoln","Logan","Lucas",
  "Luke","Mack","Maddox","Malachi","Malik","Marcus","Mason","Mateo","Maverick","Max","Maxwell","Micah","Michael",
  "Miles","Milo","Mitchell","Monte","Morgan","Nash","Nate","Nathan","Nicholas","Nico","Noah","Nolan","Oakley","Odin",
  "Oliver","Orion","Oscar","Owen","Parker","Patrick","Paxton","Payton","Peyton","Phillip","Pierce","Porter","Preston",
  "Quentin","Quinn","Randall","Reece","Reed","Reese","Reid","Remy","Rhett","Rhys","Riley","River","Rocco","Rodney",
  "Roman","Ronan","Rory","Ross","Rowan","Ryan","Ryder","Ryker","Sam","Samuel","Sawyer","Scott","Seamus","Sean","Seth",
  "Shane","Shaun","Shawn","Sheldon","Sidney","Silas","Simon","Skyler","Slade","Solomon","Spencer","Stetson","Sullivan",
  "Sutton","Tanner","Tate","Tatum","Taylor","Terrance","Theo","Thomas","Timothy","Titus","Tobias","Todd","Travis",
  "Trent","Trenton","Trevor","Trey","Tristan","Troy","Tucker","Turner","Tyler","Tyson","Vance","Van","Vaughn","Victor",
  "Vincent","Wade","Walker","Warren","Watson","Wayne","Wesley","Weston","Wilder","Will","William","Wilson","Wyatt",
  "Xavier","Zachary","Zane","Zeke",
];

const NAMES_US_LAST = [
  "Abernathy","Ackerman","Adkins","Alderman","Aldridge","Alford","Allred","Amundson","Anderson","Applegate","Archer",
  "Armbruster","Arrington","Ashcraft","Atwater","Avery","Babcock","Bachman","Bagley","Bainbridge","Baldwin","Ballard",
  "Bancroft","Banister","Barclay","Barkley","Barlow","Barnhart","Barrentine","Bartholomew","Bascomb","Batchelder",
  "Baxter","Beasley","Beauchamp","Beckwith","Bedford","Beecham","Belcher","Bellamy","Benoit","Bergeron","Berkshire",
  "Bettencourt","Bickford","Biddle","Billingsley","Birdsong","Bishop","Blackburn","Blackwood","Blakeney","Blanchard",
  "Blankenship","Bledsoe","Bogart","Bolinger","Bondurant","Boothe","Boswell","Bourgeois","Bowden","Bracken",
  "Bradshaw","Bramlett","Brandenburg","Brantley","Brashear","Breckenridge","Bridgeman","Brightwell","Brinkley",
  "Bristow","Brockman","Bromley","Brookshire","Broussard","Brumfield","Buckhalter","Buckley","Bullard","Bumgarner",
  "Burkhalter","Burnside","Butterfield","Cadwallader","Calloway","Cannady","Cantrell","Carmichael","Carrington",
  "Carstensen","Cartwright","Casteel","Castleberry","Cavanaugh","Chadwick","Chalmers","Chandler","Chapman","Chastain",
  "Cheatham","Chenoweth","Chesterfield","Chilton","Christenberry","Clabaugh","Claiborne","Clanton","Clemons",
  "Clendenin","Cloninger","Coffman","Colquitt","Comstock","Conaway","Coppinger","Corbett","Cornelison","Cothran",
  "Coulter","Courtland","Covington","Crabtree","Craddock","Crandall","Cranfield","Crenshaw","Crisp","Crockett",
  "Cromwell","Crowder","Culpepper","Cunningham","Cutliff","Dabney","Dalrymple","Danforth","Darby","Daugherty",
  "Davenport","Deaton","Delacroix","Dellinger","Denbow","Dennard","Derrickson","Devereaux","Dill","Dinwiddie",
  "Dobbins","Doolittle","Dorsett","Doughty","Drennan","Driscoll","Dubose","Dugger","Dunbar","Dunwoody","Durrant",
  "Eastland","Eckhardt","Edgerton","Eldridge","Ellington","Ellsworth","Emberton","Endicott","Ennis","Epperson",
  "Escobedo","Estabrook","Etheridge","Fairbanks","Fairchild","Falkner","Fanning","Farnsworth","Faulkenberry","Fenwick",
  "Ferrell","Fetterman","Fickle","Fillmore","Finnegan","Fitzsimmons","Flanagan","Fleharty","Fletcher","Flournoy",
  "Fogarty","Followill","Fontenot","Forsythe","Fothergill","Frampton","Frazier","Freeland","Fulbright","Fullerton",
  "Gaddis","Gainey","Gallagher","Galloway","Gambrell","Gantt","Garfield","Garrison","Gatlin","Gentry","Gerhardt",
  "Gillespie","Gilliland","Gilmore","Ginsberg","Glasscock","Goforth","Goodnight","Gossett","Grantham","Gravitt",
  "Greenway","Gresham","Gridley","Grimsley","Grissom","Guthrie","Gwaltney","Hackworth","Hadfield","Hagerman",
  "Hainsworth","Halloran","Hamblin","Hammond","Hampton","Hanley","Hardaway","Hargrove","Harkness","Harmon","Harrell",
  "Hartsfield","Hasselbach","Hathaway","Havens","Hawkinson","Haygood","Heatherly","Hedgepeth","Helmuth","Hemphill",
  "Henderson","Hendrix","Hennessey","Hepworth","Herrington","Hetherington","Hickman","Highsmith","Hildebrand",
  "Hillenbrand","Hinkle","Hobart","Hockenberry","Hodgkins","Hoffmeyer","Hollingsworth","Holcomb","Holliday","Honeycutt",
  "Hopper","Hornbeck","Horsley","Hotchkiss","Houghton","Howerton","Hubbard","Huddleston","Huffstetler","Hulbert",
  "Humphries","Hunnicutt","Hutchins","Ingersoll","Inman","Isbell","Ivey","Jacoby","Jarrell","Jeffcoat","Jernigan",
  "Jessup","Jolley","Jordan","Judkins","Kalinowski","Karnes","Keating","Kellerman","Kelso","Kemper","Kendrick",
  "Kennard","Kerrigan","Kessler","Kilbride","Killingsworth","Kimbrough","Kincaid","Kingsley","Kinnard","Kirkpatrick",
  "Kittredge","Klingensmith","Knowlton","Kolbeck","Kramer","Ladd","Lafferty","Lambert","Lancaster","Landrum","Langford",
  "Lanier","Lassiter","Latham","Lattimore","Ledbetter","Ledford","Leffingwell","Lemmon","Lenhart","Lightfoot",
  "Lindstrom","Linkous","Litchfield","Littlejohn","Livengood","Lockridge","Loflin","Longstreet","Loughlin","Lovejoy",
  "Lowrance","Lucero","Lumpkin","Lunsford","Mabry","Macomber","Maddox","Magruder","Mahoney","Mallory","Manchester",
  "Mancuso","Mangum","Marchetti","Markham","Marlowe","Mashburn","Massengale","Matheson","Mattingly","Maxfield",
  "McAllister","McCafferty","McClanahan","McCollough","McCorkle","McCutcheon","McDaniel","McElroy","McFadden",
  "McGillicuddy","McGowan","McKinnon","McLendon","McMasters","McNair","McPherson","McQuiston","McSwain","Meacham",
  "Meadows","Melancon","Mendenhall","Merriweather","Middlebrook","Milburn","Millsap","Minter","Mixon","Monaghan",
  "Montague","Moody","Moorhead","Morgenstern","Mortimer","Mosley","Muncy","Murchison","Musgrove","Nabors","Nagle",
  "Nally","Nesbitt","Nettles","Newcomb","Niedermeyer","Nixon","Northcutt","Norwood","Oberlin","Odom","Ogletree",
  "Oldham","Olinger","Orendorff","Osborne","Ostrander","Overstreet","Owings","Padgett","Palmieri","Pankey","Parrish",
  "Partridge","Passmore","Patterson","Pemberton","Pendergrass","Penrose","Pepperdine","Percival","Perkins","Perryman",
  "Pettigrew","Pfeiffer","Phelan","Philbrick","Pickering","Pilcher","Pinkerton","Pittman","Plunkett","Poindexter",
  "Pollard","Ponder","Prescott","Prewitt","Prichard","Pruitt","Puckett","Purcell","Quarles","Quimby","Quinlan",
  "Radcliffe","Rademacher","Rainwater","Ramsdell","Randolph","Rasmussen","Ratliff","Rawlings","Redfern","Reddick",
  "Renfroe","Rennick","Renshaw","Rhodes","Richmond","Ridenour","Ridgeway","Rigsby","Rinehart","Ringgold","Roark",
  "Robicheaux","Rockwell","Roebuck","Rollins","Roper","Rothgeb","Roundtree","Rowlett","Rucker","Rudisill","Rundle",
  "Rushton","Rutherford","Sackett","Saltonstall","Sanderlin","Sandoval","Satterfield","Saunders","Scarborough",
  "Schaeffer","Schoonover","Schroeder","Scoggins","Seaborn","Sedgwick","Selby","Sessions","Shackleford","Shanahan",
  "Sharpe","Shelburne","Shepherd","Sherrill","Shiflett","Shipley","Shockley","Shropshire","Sikes","Silverthorne",
  "Simmerman","Sinclair","Skaggs","Slaughter","Sloan","Smallwood","Snodgrass","Somerville","Southerland","Spangler",
  "Sparkman","Speight","Spillane","Stackhouse","Stallworth","Standridge","Stanfield","Stapleton","Starnes","Steadman",
  "Steinbrenner","Stembridge","Stephenson","Stillwell","Stovall","Stratton","Strickland","Stringfellow","Strother",
  "Stubblefield","Sturdivant","Sullivan","Summerlin","Sutherland","Swafford","Swanigan","Sweatt","Swinney","Tackett",
  "Talley","Tanguay","Tarpley","Tatum","Teague","Tennyson","Thackeray","Thibodeaux","Thornbury","Threadgill",
  "Thurmond","Tidwell","Tillery","Tinsley","Tolliver","Toomey","Torrance","Townsend","Trammell","Traywick","Trickett",
  "Trimble","Troutman","Tuggle","Turnbull","Tuttle","Twombly","Ulmer","Underwood","Upchurch","Vandegrift","Vanderpool",
  "Vandiver","Vansickle","Varnadore","Vaughan","Verdugo","Vickery","Villanueva","Vinson","Waddell","Wadsworth",
  "Wagoner","Wainwright","Wakefield","Waldrop","Walkup","Wallingford","Wamsley","Wardlaw","Warfield","Waterman",
  "Watkins","Weatherford","Weatherspoon","Webber","Weddington","Welborn","Wellman","Wentworth","Westbrook",
  "Whitcomb","Whitehurst","Whitesides","Whitfield","Whittaker","Wickersham","Widener","Wigginton","Wilburn",
  "Wilcoxson","Wilhoit","Wilkerson","Willingham","Winchester","Windham","Wingate","Winslow","Winterbourne","Wisniewski",
  "Witherspoon","Wolcott","Woodbury","Woolridge","Wooten","Workman","Worthington","Wrenn","Yancey","Yarborough",
  "Yeager","Yelverton","Yonkers","Younts","Zabriskie","Zeigler",
];

const NAMES_LATIN_FIRST = [
  "Adalberto","Adonis","Adrián","Alberto","Alcides","Alejandro","Alexei","Alfredo","Andrés","Ángel","Anibal","Antonio",
  "Ariel","Arístides","Armando","Bartolo","Bienvenido","Braulio","Bruno","Camilo","Carlos","César","Cristian","Damián",
  "Danilo","Dariel","Darío","Deivi","Delvin","Diego","Dilson","Domingo","Eduardo","Edwin","Elián","Elvis","Emilio",
  "Enmanuel","Enrique","Ercilio","Ernesto","Esteban","Ezequiel","Fabio","Federico","Felipe","Fernando","Francisco",
  "Franklin","Freddy","Gabriel","Genaro","Geraldo","Gerardo","Gilberto","Gregorio","Guillermo","Gustavo","Héctor",
  "Heliot","Hernán","Horacio","Ignacio","Ismael","Iván","Jairo","Javier","Jeferson","Jesús","Joan","Joel","Jorge",
  "José","Josué","Juan","Julio","Junior","Leandro","Leonel","Lorenzo","Lucas","Luis","Manuel","Marcelo","Marco",
  "Mariano","Martín","Mateo","Maximiliano","Miguel","Moisés","Nelson","Néstor","Nicolás","Noel","Octavio","Omar",
  "Orlando","Óscar","Osvaldo","Pablo","Pascual","Pedro","Rafael","Ramón","Randy","Raúl","Reinaldo","Ricardo","Roberto",
  "Rodolfo","Rogelio","Rolando","Ronald","Rubén","Salvador","Samuel","Santiago","Sebastián","Sergio","Silvano",
  "Starlin","Teodoro","Tomás","Ubaldo","Ulises","Valentín","Vicente","Víctor","Wander","Wilfredo","Wilson","Yadier",
  "Yandel","Yasiel","Yoan","Yordan","Yuniel",
];

const NAMES_LATIN_LAST = [
  "Abreu","Acevedo","Acosta","Aguilar","Alcántara","Almonte","Alvarado","Álvarez","Amaya","Andújar","Aparicio",
  "Aquino","Aragón","Arenas","Arias","Ayala","Baez","Bautista","Beltrán","Benítez","Bermúdez","Betancourt","Bonilla",
  "Bravo","Cabrera","Calderón","Camacho","Cancel","Candelario","Cardenas","Carrasco","Carrillo","Castellanos",
  "Castillo","Castro","Cedeño","Cepeda","Cervantes","Chávez","Cintrón","Colón","Contreras","Cordero","Correa",
  "Cortés","Cruz","De la Rosa","Delgado","Díaz","Domínguez","Duarte","Durán","Echevarría","Encarnación",
  "Escobar","Espinal","Espinoza","Estrada","Fajardo","Feliz","Fermín","Fernández","Ferrer","Figueroa","Flores",
  "Fuentes","Gallardo","Galvez","García","Garrido","Gómez","González","Grullón","Guerrero","Gutiérrez","Guzmán",
  "Henríquez","Heredia","Hernández","Herrera","Hidalgo","Ibarra","Iglesias","Jiménez","Lagares","Lara","Leyva",
  "Linares","Lira","López","Lugo","Luna","Machado","Maldonado","Marte","Martínez","Matos","Medina","Mejía","Meléndez",
  "Méndez","Mendoza","Merced","Mieses","Millán","Miranda","Molina","Montero","Montes","Morales","Moreno","Muñoz",
  "Navarro","Nieves","Nuñez","Ocampo","Ochoa","Olivares","Olivo","Ortega","Ortiz","Oviedo","Pacheco","Padilla",
  "Paredes","Peña","Peralta","Pérez","Pimentel","Pineda","Polanco","Quintana","Quiñones","Ramírez","Ramos","Reyes",
  "Rincón","Ríos","Rivas","Rivera","Robles","Rodríguez","Rojas","Roldán","Romero","Rosario","Rueda","Ruiz","Salas",
  "Salazar","Samaniego","Sánchez","Sandoval","Santana","Santiago","Santos","Sarmiento","Segura","Sepúlveda","Serrano",
  "Sierra","Solano","Solís","Sosa","Soto","Suárez","Tapia","Tavárez","Tejada","Toribio","Torres","Trujillo","Ureña",
  "Valdez","Valencia","Valentín","Valera","Vargas","Vásquez","Vega","Velázquez","Ventura","Vera","Villalobos","Zamora",
  "Zapata","Zavala",
];

const NAMES_ASIA_FIRST = [
  "Akira","Chan-ho","Daichi","Daisuke","Eun-woo","Fumiya","Genki","Haruki","Hideki","Hiroto","Hyun-jin","Ichiro",
  "Jae-won","Jin-woo","Jun","Kaito","Kazuki","Keisuke","Kenta","Kohei","Kosuke","Kyung-min","Masato","Min-seok",
  "Naoya","Ren","Riku","Ryosuke","Sang-hoon","Satoshi","Seiya","Seung-hwan","Shohei","Shota","Sota","Takumi","Tatsuya",
  "Tomoki","Woo-jin","Yamato","Yohan","Yoshinobu","Yuki","Yuma","Yusei",
];
const NAMES_ASIA_LAST = [
  "Abe","Baek","Chang","Cho","Choi","Endo","Fujimoto","Fukuda","Goto","Han","Hasegawa","Hayashi","Hong","Ide","Ikeda",
  "Imai","Inoue","Ishikawa","Ito","Jang","Jung","Kang","Kaneko","Kato","Kikuchi","Kim","Kobayashi","Kondo","Kwon",
  "Lim","Maeda","Matsui","Matsumoto","Mori","Murakami","Nakamura","Nishida","Noguchi","Oh","Okada","Ono","Park",
  "Ryu","Saito","Sakamoto","Sasaki","Sato","Seo","Shim","Shin","Shimizu","Suzuki","Takahashi","Tanaka","Ueda",
  "Watanabe","Yamada","Yamamoto","Yang","Yoon","Yoshida",
];

/* ---------- where a player is from decides what he is called ----------
   The old code rolled a name style and a country separately, so one
   international prospect in ten was a Kenta Sasaki from San Pedro de Macorís.
   Curaçao is worth separating too — the Dutch-Caribbean naming convention is
   distinctive enough that borrowing Dominican names reads wrong. */

const DUTCH_CARIB_FIRST = [
  "Andruw","Andrelton","Bernardo","Didi","Dilson","Gregory","Hensley","Jair","Jonathan","Jurickson","Kenley",
  "Ozzie","Rangelo","Roger","Shairon","Sharlon","Simon","Urbanus","Vurnon","Wladimir","Xander","Yurendell","Jandro",
  "Juremi","Kelvin","Randall","Rojer","Shendrion",
];
const DUTCH_CARIB_LAST = [
  "Balentien","Bernadina","Bogaerts","Cuevas","Engelhardt","Gregorius","Isenia","Jansen","Legito",
  "Martina","Meulens","Nicolaas","Paulina","Profar","Rijk","Rosalia","Schoop","Simmons","Sluis","Statia","Suriel",
  "Tromp","Vrieling","Wattel","Windelborn","Zimmerman",
];

const TAIWAN_FIRST = ["Chien-Ming","Chih-Wei","Chin-Feng","Hong-Chih","Kuo-Hui","Ming-Chieh","Po-Jung","Sheng-An",
  "Tsung-Che","Wei-Chung","Wei-Yin","Yu-Cheng","Cheng-Hao","Chun-Hsiu"];
const TAIWAN_LAST = ["Chang","Chen","Chiang","Chou","Hsu","Huang","Kuo","Lai","Lee","Lin","Liu","Tsao","Wang","Yang"];

const JAPAN_FIRST = ["Akira","Daichi","Daisuke","Fumiya","Genki","Haruki","Hideki","Hiroto","Ichiro","Kaito","Kazuki",
  "Keisuke","Kenta","Kohei","Kosuke","Masato","Naoya","Ren","Riku","Ryosuke","Satoshi","Seiya","Shohei","Shota",
  "Sota","Takumi","Tatsuya","Tomoki","Yamato","Yoshinobu","Yuki","Yuma","Yusei"];
const JAPAN_LAST = ["Abe","Endo","Fujimoto","Fukuda","Goto","Hasegawa","Hayashi","Ide","Ikeda","Imai","Inoue",
  "Ishikawa","Ito","Kaneko","Kato","Kikuchi","Kobayashi","Kondo","Maeda","Matsui","Matsumoto","Mori","Murakami",
  "Nakamura","Nishida","Noguchi","Okada","Ono","Saito","Sakamoto","Sasaki","Sato","Shimizu","Suzuki","Takahashi",
  "Tanaka","Ueda","Watanabe","Yamada","Yamamoto","Yoshida"];

const KOREA_FIRST = ["Chan-ho","Eun-woo","Hyun-jin","Jae-won","Jin-woo","Kyung-min","Min-seok","Sang-hoon",
  "Seung-hwan","Woo-jin","Yohan","Ji-hoon","Dong-hyun","Tae-yang"];
const KOREA_LAST = ["Baek","Cho","Choi","Han","Hong","Jang","Jung","Kang","Kim","Kwon","Lim","Oh","Park","Ryu",
  "Seo","Shim","Shin","Yang","Yoon"];

// Each country carries its own naming convention, its share of the market, and
// the towns an academy would actually be in.
const INTL_COUNTRIES = [
  { c: "Dominican Republic", w: 40, style: "latin", short: "D.R.",
    towns: ["San Pedro de Macorís","Santo Domingo","Boca Chica","Baní","La Romana","Santiago","Azua","Haina","Nagua"] },
  { c: "Venezuela", w: 24, style: "latin", short: "Venezuela",
    towns: ["Maracay","Valencia","Caracas","Barquisimeto","Maracaibo","Puerto La Cruz","Cabimas"] },
  { c: "Cuba", w: 8, style: "latin", short: "Cuba",
    towns: ["Havana","Santiago de Cuba","Holguín","Pinar del Río","Matanzas"] },
  { c: "Colombia", w: 5, style: "latin", short: "Colombia",
    towns: ["Cartagena","Barranquilla","Montería","Sincelejo"] },
  { c: "Panama", w: 3, style: "latin", short: "Panama",
    towns: ["Panama City","Colón","David","La Chorrera"] },
  { c: "Mexico", w: 5, style: "latin", short: "Mexico",
    towns: ["Monterrey","Culiacán","Hermosillo","Mexicali","Guadalajara"] },
  { c: "Nicaragua", w: 2, style: "latin", short: "Nicaragua",
    towns: ["Managua","León","Chinandega"] },
  { c: "Curaçao", w: 3, style: "dutch", short: "Curaçao",
    towns: ["Willemstad","Sint Michiel","Barber"] },
  { c: "Aruba", w: 1, style: "dutch", short: "Aruba", towns: ["Oranjestad","San Nicolaas"] },
  { c: "Japan", w: 4, style: "japan", short: "Japan",
    towns: ["Osaka","Tokyo","Nagoya","Fukuoka","Sendai","Hiroshima"] },
  { c: "South Korea", w: 3, style: "korea", short: "South Korea",
    towns: ["Seoul","Busan","Incheon","Daegu","Gwangju"] },
  { c: "Taiwan", w: 2, style: "taiwan", short: "Taiwan",
    towns: ["Taipei","Kaohsiung","Taichung","Tainan"] },
];

function pickCountry() {
  const total = INTL_COUNTRIES.reduce((a, x) => a + x.w, 0);
  let r = rnd() * total;
  for (const x of INTL_COUNTRIES) { r -= x.w; if (r <= 0) return x; }
  return INTL_COUNTRIES[0];
}

function nameForStyle(style) {
  if (style === "dutch") return `${pick(DUTCH_CARIB_FIRST)} ${pick(DUTCH_CARIB_LAST)}`;
  if (style === "japan") return `${pick(JAPAN_FIRST)} ${pick(JAPAN_LAST)}`;
  if (style === "korea") return `${pick(KOREA_FIRST)} ${pick(KOREA_LAST)}`;
  if (style === "taiwan") return `${pick(TAIWAN_FIRST)} ${pick(TAIWAN_LAST)}`;
  return `${pick(NAMES_LATIN_FIRST)} ${pick(NAMES_LATIN_LAST)}`;
}
