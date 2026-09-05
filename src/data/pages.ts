/* ————————————————————————————————————————————————
   THE BIRTHDAY BOOK — default content
   Act I  (cartoons) : 7 ta — funny, cute
   Act II (memories) : 9 ta — halka serious
   Act III(extras)   : 7 ta — interactive
   Quiz              : 3 ta prosno — shesh page-e dhukar age
   Act IV (wish)     : 1 ta — full serious
   Sob kichu app-er edit mode (code 2525) diye bodlano jay.
———————————————————————————————————————————————— */

export type Act = "cartoons" | "memories" | "extras" | "wish";
export type SceneKey = "noodles" | "road" | "rain" | "movie" | "sunrise" | "chat";
export type ExtraKind = "awards" | "coupons" | "complaints" | "roulette" | "timeline" | "voice" | "bridge";

export interface BookPage {
  id: string;
  act: Act;
  title: string;
  caption?: string;
  img?: string;        // default/static path
  imgKey?: string;     // upload kora chobi (IndexedDB)
  scene?: SceneKey;    // chobi na thakle icon-scene
  date?: string;
  place?: string;
  extra?: ExtraKind;
  voiceKey?: string;   // ei page-er voice note (IndexedDB)
  voiceLabel?: string;
}

export interface QuizQ {
  id: string;
  q: string;
  options: string[];
  answer: number;
  hint?: string;
}

export const ACTS: { key: Act; label: string; labelBn: string }[] = [
  { key: "cartoons", label: "Cartoons", labelBn: "hashir odhyay" },
  { key: "memories", label: "Memories", labelBn: "moner odhyay" },
  { key: "extras", label: "Extras", labelBn: "mojar odhyay" },
  { key: "wish", label: "The Wish", labelBn: "ashol odhyay" },
];

export const EXTRA_LABEL: Record<ExtraKind, string> = {
  awards: "Award Night",
  coupons: "Coupon Book",
  complaints: "Complaint Box",
  roulette: "Reason Roulette",
  timeline: "Timeline",
  voice: "Voice Corner",
  bridge: "Serious Bridge",
};

export const SCENE_LABEL: Record<SceneKey, string> = {
  noodles: "Noodles", road: "Road Trip", rain: "Brishti", movie: "Movie Night", sunrise: "Shokal", chat: "Raater Chat",
};

export const DEFAULT_PAGES: BookPage[] = [
  /* ═══════ ACT I — cartoon + caption ═══════ */
  {
    id: "c1", act: "cartoons", title: "The Great Momo War", img: "images/cartoon-1.jpg",
    caption: "Shesh momo ta niye amader World War 3. Na kono treaty, na kono mercy. Obosheshe jitlam ami — tomar chokher samne, chutney sohoge. Bhalobasha ache thik ache, kintu shesh momo ta keu deay na.",
  },
  {
    id: "c2", act: "cartoons", title: "Ek Chhatar Theory", img: "images/cartoon-2.jpg",
    caption: "Tumi bolle, “Ek chhata tei hoye jabe.” Onko bole: hobe na. Mon bole: hoye gelo. Tumi adhek bhija hero, ami shukno villain — kintu chobi ta perfect uthlo.",
  },
  {
    id: "c3", act: "cartoons", title: "Raat 3:12 AM Philosophy", img: "images/cartoon-3.jpg",
    caption: "Raat tinta baro. Hothat tumi: “Pigeon-ra ki shopno dekhe?” Ami ghum chere bhabchi — manush ke keno eto bhalobasha jay. Pigeon committee-r meeting ta obosshoi ekta mention paway.",
  },
  {
    id: "c4", act: "cartoons", title: "Sofar Geneva Convention", img: "images/cartoon-4.jpg",
    caption: "Kombol niye amader juddhe kono ain khate na. Niyom ekta-i — ja ache shob amar, ja nei sheta-o amar. Popcorn bicharok hote esechilo, ekhon shob mejhe te.",
  },
  {
    id: "c5", act: "cartoons", title: "The Parking Guru", img: "images/cartoon-5.jpg",
    caption: "Ekta parking spot peye tumi superhero-r pose nile. Ami hattali dilam, tumi bolle “kokhono doubt korio na.” Kori na. Universe-er parking department-e tomar CV pathiye diyechi.",
  },
  {
    id: "c6", act: "cartoons", title: "Michelin Kitchen (Pora)", img: "images/cartoon-6.jpg",
    caption: "Atha makha mejhe, pora pancake, ar fridge-er alote amader slow dance. Kono chef dekhle kandto — kintu ei rannaghor chara amar ar kichu chai na.",
  },
  {
    id: "c7", act: "cartoons", title: "Human Burrito Manual", img: "images/cartoon-7.jpg",
    caption: "Tumi jokhon kombole guTiye jao — climate controlled burrito. Ami waiter, noodles serve kori. Amader love language: burrito ke khaoate khaoate hashano.",
  },

  /* ═══════ ACT II — memories ═══════ */
  {
    id: "m1", act: "memories", title: "Prothom Bikel", img: "images/memory-beach.jpg",
    date: "Golden Hour", place: "Balur Char",
    caption: "Akash ta shob rong shesh kore fello, ar tumi bolle “aro ektu thaki” — shotero bar. Ami gunechi. Ekbar-o mone hoyni je bari fera dorkar.",
  },
  {
    id: "m2", act: "memories", title: "Prothom Date", scene: "noodles",
    date: "Jekhane shob shuru", place: "Chhoto Noodle-er Dokan",
    caption: "Shosta noodles, dami kotha. Corner-er table ta ekhon legally amader. Shohorer shobcheye dami jayga oi chhoto dokan tai.",
  },
  {
    id: "m3", act: "memories", title: "Highway Concert", scene: "road",
    date: "Janala khola", place: "Highway, Lane of Legends",
    caption: "Tumi steering-e drum bajale, ami beshure gailam, ekjon truck driver hattali dilo. Duibar rasta harialam — dosh ta obosshoi GPS-er.",
  },
  {
    id: "m4", act: "memories", title: "Shei Brishti", scene: "rain",
    date: "Brishtir Raat", place: "Shohorer Majhkhane",
    caption: "Ek chhata, duijon adhek bhija manush, ar ekta bhije pizza. Footpath-e boshe hashte hashte khawa oi pizza ta Michelin star deserve kore.",
  },
  {
    id: "m5", act: "memories", title: "Flour War", img: "images/memory-kitchen.jpg",
    date: "Raat 1 ta", place: "Amader Rannaghor",
    caption: "Recipe bollo “4 jon-er jonno”. Holo 2 jon-er — baki tuku amader gaye ar ceiling-e. Atha makha mukhe tomar oi hashi ta ekhono mone porle bhalo lage.",
  },
  {
    id: "m6", act: "memories", title: "Sofa Premier League", scene: "movie",
    date: "Movie Night #47", place: "Amader Sofa (amar side)",
    caption: "Movie dekhte boshe 40 minute tarko — ke shera villain. Movie shesh hoyni, kotha shesh hoyni, mon ta bhalo hoye gelo. Rating: 10/10.",
  },
  {
    id: "m7", act: "memories", title: "Prothom Shokal", scene: "sunrise",
    date: "Eksathe dekha prothom shokal", place: "Balcony",
    caption: "Tumi chini kom cha baniye bolle “perfect hoyeche” — hoyni, kintu ami kokhono bolbo na. Oi shokaler alote bhebechilam: ei routine ta amar shobcheye priyo.",
  },
  {
    id: "m8", act: "memories", title: "Shohor Amader Dekhechilo", img: "images/memory-city.jpg",
    date: "Ekta Bhija Raat", place: "Shohorer Batir Niche",
    caption: "Pichhil rasta, batir bokeh, ar haat dhora duijon. Shohor ta oi raate amader jonno alada ekta chapter likhe felechilo.",
  },
  {
    id: "m9", act: "memories", title: "11:47 PM Chronicles", scene: "chat",
    date: "Prottek raat", place: "Duita Phone, Duita Mon",
    caption: "“Ghumate jacchi” bola hoyeche pach bar. Ghum hoyeche shunno bar. Screenshot gulo rakha ache — court-e Grade A evidence hishebe cholbe.",
  },

  /* ═══════ ACT III — extras ═══════ */
  { id: "e1", act: "extras", title: "Barshik Award Night", extra: "awards" },
  { id: "e2", act: "extras", title: "Official Coupon Boi", extra: "coupons" },
  { id: "e3", act: "extras", title: "Ovijog Baksho", extra: "complaints" },
  { id: "e4", act: "extras", title: "Reason Roulette", extra: "roulette" },
  { id: "e5", act: "extras", title: "Amader Timelapse", extra: "timeline" },
  { id: "e6", act: "extras", title: "Voice Corner", extra: "voice" },
  { id: "e7", act: "extras", title: "Ekhon Ektu Serious…", extra: "bridge" },

  /* ═══════ ACT IV — the wish ═══════ */
  { id: "w1", act: "wish", title: "Jonmodiner Wish" },
];

/* ——— quiz: shesh page-e dhukar age ——— */
export const DEFAULT_QUIZ: QuizQ[] = [
  {
    id: "q1",
    q: "Amader prothom date kothay hoyechilo?",
    options: ["Rooftop restaurant", "Chhoto noodle-er dokan", "Cinema hall", "Boi-er dokan"],
    answer: 1,
    hint: "Shosta noodles, dami kotha.",
  },
  {
    id: "q2",
    q: "Ei boi-er entry code ta ki chilo?",
    options: ["1112", "1211", "2112", "1201"],
    answer: 1,
    hint: "Amader taarikh — baro ar ek, pashapashi.",
  },
  {
    id: "q3",
    q: "Kombol juddhe ashol niyom ta ki?",
    options: [
      "Adha adha bhag hobe",
      "Ja ache shob amar, ja nei sheta-o amar",
      "Je age ghumay she paay",
      "Kombol nishiddho",
    ],
    answer: 1,
    hint: "Page 4 abar pore dekho, hero.",
  },
];

/* ——— wish letter (edit kora jay) ——— */
export const DEFAULT_WISH_LETTER = [
  "Tomar jonmodin.",
  "Boi ta shuru hoyechilo momo niye jhogra diye — kintu shesh ta ekhane, jekhane hashi ta ektu thame, ar ami shobcheye boro kotha ta bolte chai.",
  "Tumi shei manush, jar pashe boshe duniyar volume kome jay. Tomar sathe shokal banate, raat katate kono ojuhat lage na. Tomar chupchap pashe thaka ta amar shobcheye nirapod jayga.",
  "Ajke tomar din, kintu upohar ta amar — jibone tomake pawa. Ekta bochor tomake dekhe bujhechi: manush jodi kokhono shorgo banay, sheta dekhte tomar rannaghor-er motoi hobe — ektu eloamelo, onek uttap.",
  "Shubho jonmodin. Ekta kotha dite pari — agami bochor-o tomar haat ta dhore thakbo. Baki detail gulo pore mile-mishe thik kore nebo, agher motoi.",
  "— tomar nijer manush, protita shokaler jonno.",
];

/* ——— extras er static content ——— */
export const AWARDS = [
  { icon: "Drama", title: "Best Dramatic Performance", desc: "“Ek chhata tei hobe” — obhinoy itihasher shera scene. Oscar pathano hocche." },
  { icon: "Medal", title: "Gold Medal · Parking", desc: "Universe-er official parking delegate. Certificate gulo pouche jabe." },
  { icon: "Moon", title: "3 AM Philosophy Award", desc: "Pigeon Studies Department-er lifetime achievement." },
  { icon: "BadgeCheck", title: "World's Warmest Hug", desc: "Lab-tested: ghontay 4.2 ta kharap din thik kore. Warranty: ajibon." },
];

export const COUPONS = [
  { code: "CPN-01", title: "Full Day Playlist Pass", desc: "Puro din tomar playlist cholbe. Ami ekbar-o kan chepe dhorbo na." },
  { code: "CPN-02", title: "Momo Truce", desc: "Momo juddho suspended. Shesh momo ta tomar. Chokh bondho kore niye nao." },
  { code: "CPN-03", title: "Movie Pick Authority", desc: "Movie tumi choose korbe. Zero complaint. Emonki oi boring documentary tao." },
  { code: "CPN-04", title: "Emergency Jhapti", desc: "Je kono somoy ekta hug redeem korte parba. Refill free, validity ajibon." },
];

export const COMPLAINTS = [
  { title: "Chips Khawar Awaj", desc: "Case #12: Raat 2 tay chips khawa jeno surround sound. Verdict: cute bole beche gele. Jorimana: ekta hug." },
  { title: "Kombol Chori (Repeat Offender)", desc: "Dhara 1211 — raate kombol tene neowa. Shasti: jotodin thanda, totodin joriye thaka." },
  { title: "Amar Chobite Tomar Angul", desc: "Prottekta selfie-te ekta angul. Obhijog grohonjoggo, kintu obhijukto beshi handsome." },
  { title: "“5 Minute” Bole 50 Minute", desc: "Time Crime Division ke janano hoyeche. Jamin-er shorto: ekta raat, phone chhara, shudhu amra." },
];

export const ROULETTE_REASONS = [
  "Tumi hashle ghorer voltage bere jay.",
  "Tomar “thik achi” mane prayoi “thik nei” — ar ami sheta porte pari.",
  "Manusher chhoto kotha gulo tumi mone rakho, jeno oi ta tomar chakri.",
  "Bidaay ta kokhono skip koro na — hug, kopale chumu, “pouche text dio”.",
  "Tomar plan-B prayoi plan-A theke bhalo hoy.",
  "Raat 3 ta te duniya off, amra on.",
  "Bhoy peleo bhoyer kaj ta tumi koro. Oitai ashol shahosh.",
  "Amar kanna dekhe tumio emotional hoye jao, tarpor duijon hashi.",
  "Noodles banate tomar concentration Einstein-level.",
  "Tumi amar bananan thik koro, kintu tomar bhul gulo ami dhorte pari na.",
  "Je kono shadharon din ke tumi ekta event baniye felo.",
  "Karon tumi — tai. Ekhane logic khatano jabe na.",
];

export const TIMELINE = [
  { icon: "Eye", title: "Prothom Dekha", desc: "Chokh: milelo. Mon: emergency meeting daklo." },
  { icon: "UtensilsCrossed", title: "Prothom Date", desc: "Corner-er table, shosta noodles, dami shomoy." },
  { icon: "Cherry", title: "The Mango Project", desc: "Ekta aam. Ajo kono gift oi record bhangte pareni." },
  { icon: "HeartHandshake", title: "Prothom “Bhalobashi”", desc: "Atha makha rannaghor, pora pancake, bhora mon." },
  { icon: "Car", title: "Highway Concert Tour", desc: "Janala khola. World tour: amader lane theke tomar gola." },
  { icon: "CloudRain", title: "Brishtir Chukti", desc: "Ek chhata itihash holo. Amra adhek bhije legend." },
  { icon: "Cake", title: "Aj — Tomar Jonmodin", desc: "Puro boi ta ekhane eshe theme jay. Porer panna ekhono lekha hoyni." },
];

export const VOICE_TRANSCRIPT =
  "Hey… ei ta shudhu tomar jonno. Boi-er majhe majhe amar gola shunte iccha korle ei page-e chole esho. Ami ekhane achi — shobar age, shobar sheshe, tomar.";
