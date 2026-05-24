import { QuizQuestion, QuestionType } from "../types";

export interface MetadataQuestion extends QuizQuestion {
  grade: string;
  topic: string;
  difficulty: "Könnyű" | "Közepes" | "Nehéz";
}

export const FALLBACK_QUESTIONS: MetadataQuestion[] = [
  // === 9. ÉVFOLYAM ===
  // Topic: Őskor és az ókori Kelet
  {
    id: "q9_1_1",
    grade: "9. évfolyam",
    topic: "Őskor és az ókori Kelet",
    difficulty: "Könnyű",
    type: "multiple_choice",
    question: "Melyik jelentős ókori folyam mentén alakult ki az egyiptomi civilizáció?",
    options: [
      "Nílus",
      "Tigris",
      "Eufrátesz",
      "Gangesz"
    ],
    correctAnswer: "A",
    hint: "Ez a folyó észak felé folyik, évente ismétlődő áradásai biztosították az öntözéses földművelést.",
    explanation: "Az egyiptomi civilizáció az öntözéses földművelésre épült, melyet a Nílus folyó évenkénti áradása és a lerakott termékeny iszap tett lehetővé."
  },
  {
    id: "q9_1_2",
    grade: "9. évfolyam",
    topic: "Őskor és az ókori Kelet",
    difficulty: "Közepes",
    type: "true_false",
    question: "Hammurapi törvénykönyve a 'szemet szemért, fogat fogért' elvre (talió elv) épült.",
    correctAnswer: "Igaz",
    hint: "Ez a megtorlás törvénye, amely azonos társadalmi réteghez tartozó személyeknél azonos büntetést írt elő.",
    explanation: "Igaz. Hammurapi törvénykönyvében fontos szerepet játszott az egyenértékű megtorlás (talió-elv), bár a büntetések mértéke függött a felek társadalmi helyzetétől is."
  },
  {
    id: "q9_1_3",
    grade: "9. évfolyam",
    topic: "Őskor és az ókori Kelet",
    difficulty: "Nehéz",
    type: "essay",
    question: "Mutassa be röviden az egyiptomi államvallás és a fáraóhatalom kapcsolatát!",
    hint: "Gondoljon a teokratikus berendezkedésre és a fáraó isteni származására.",
    explanation: "Értékelési szempontok: Utalás a teokratikus jellegre (a fáraó Amon-Ré, illetve Hórusz földi megtestesülése/fia). Az isteni legitimáció szerepe az egység fenntartásában, a papság befolyása, és a túlvilághit (piramisépítkezések)."
  },

  // Topic: Az ókori görög civilizáció
  {
    id: "q9_2_1",
    grade: "9. évfolyam",
    topic: "Az ókori görög civilizáció",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik athéni politikus nevéhez fűződik a közvetlen demokrácia aranykora (Kr. e. V. század közepe)?",
    options: [
      "Szolón",
      "Klisztenész",
      "Periklész",
      "Peiszisztratosz"
    ],
    correctAnswer: "C",
    hint: "Nevéhez fűződik a napidíjak bevezetése, a rászoruló polgárok színházba járásának támogatása és az Akropolisz újjáépítése.",
    explanation: "A Kr. e. V. század közepén Periklész volt Athén legbefolyásosabb sztratégosza, aki tökéletesítette a közvetlen demokráciát és nagyszabású építkezéseket indított."
  },
  {
    id: "q9_2_2",
    grade: "9. évfolyam",
    topic: "Az ókori görög civilizáció",
    difficulty: "Könnyű",
    type: "true_false",
    question: "A spártai társadalomban a teljes jogú polgárok fő tevékenysége a mezőgazdasági munka volt.",
    correctAnswer: "Hamis",
    hint: "Melyik réteg végezte a földművelést Spártában?",
    explanation: "Hamis. A spártai teljes jogú polgárok kizárólag katonáskodással és államügyekkel foglalkozhattak, míg a földet a jogfosztott helóták művelték."
  },

  // Topic: Az ókori Róma
  {
    id: "q9_3_1",
    grade: "9. évfolyam",
    topic: "Az ókori Róma",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik tisztségviselők képviselték a plebejusok érdekeit az ókori rómában, vétójoggal felvértezve?",
    options: [
      "Konzulok",
      "Néptribunusok",
      "Censorok",
      "Diktátorok"
    ],
    correctAnswer: "B",
    hint: "Személyük szent és sérthetetlen (sacrosanctus) volt, és 'Veto' (Megtiltom) felkiáltással megsemmisíthették a magisztrátusok döntéseit.",
    explanation: "A néptribunusok (tribuni plebis) intézményét a plebejusok harcolták ki Kr. e. 494-ben saját érdekük védelmében."
  },
  {
    id: "q9_3_2",
    grade: "9. évfolyam",
    topic: "Az ókori Róma",
    difficulty: "Nehéz",
    type: "essay",
    question: "Elemezze Julius Caesar hatalomkoncentrációját és a köztársaság válságát!",
    hint: "Gondoljon az egyeduralom formájára (diktatúra), a tisztségek halmozására és a szenátus háttérbe szorítására.",
    explanation: "Értékelési szempontok: A polgárháborús válság bemutatása, az első triumvirátus szerepe, Caesar diktátori kinevezése élethossziglan, a reformok (naptár, földosztás), a szenátusi gyilkosság (Kr. e. 44) és a principátusba való átmenet előkészítése."
  },

  // Topic: Népvándorlás és a magyarok eredete
  {
    id: "q9_4_1",
    grade: "9. évfolyam",
    topic: "Népvándorlás és a magyarok eredete",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Nyelvészeti bizonyítékok alapján a magyar nyelv melyik nyelvcsaládba tartozik?",
    options: [
      "Indoeurópai nyelvcsalád",
      "Urál-altáji nyelvcsalád finnugor ága",
      "Török nyelvcsalád",
      "Szláv nyelvcsalád"
    ],
    correctAnswer: "B",
    hint: "A rokonság az alapszókincs, a nyelvtani szerkezetek és a legközelebbi rokon nyelvek (hanti, manysi) alapján mutatható ki.",
    explanation: "A magyar nyelv az uráli nyelvcsalád finnugor ágába tartozik, amit a rendszerszerű nyelvtani egyezések és az alapszókincs bizonyít, függetlenül a későbbi nomád török kulturális és genetikai hatásoktól."
  },

  // Topic: Honfoglalás és az Árpád-kor
  {
    id: "q9_5_1",
    grade: "9. évfolyam",
    topic: "Honfoglalás és az Árpád-kor",
    difficulty: "Nehéz",
    type: "multiple_choice",
    question: "Melyik törzsfő vezette a magyar seregeket a 907-es pozsonyi csatában, végleg biztosítva a Kárpát-medence birtokbavételét?",
    options: [
      "Álmos",
      "Árpád",
      "Kurszán",
      "Taksony"
    ],
    correctAnswer: "B",
    hint: "Ő Álmos fia, a dinasztia megalapítója, aki a honfoglaló törzsszövetség katonai vezetője (gyula) volt.",
    explanation: "A 907-es pozsonyi csatában a honfoglaló magyar seregek Árpád fejedelem vezetésével megsemmisítő vereséget mértek a Keleti Frank Királyság támadó seregére."
  },

  // === 10. ÉVFOLYAM ===
  // Topic: A középkori Európa
  {
    id: "q10_1_1",
    grade: "10. évfolyam",
    topic: "A középkori Európa",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Milyen jogi dokumentumot bocsátott ki I. (Földnélküli) János angol király 1215-ben, amely korlátozta a királyi önkényt és lefektette a rendi jogok alapjait?",
    options: [
      "Aranybulla",
      "Magna Charta Libertatum",
      "Wormsi konkordátum",
      "Verduni szerződés"
    ],
    correctAnswer: "B",
    hint: "A név latinul 'Nagy Szabadságlevelet' jelent, és tartalmazza az ellenállási záradékot is.",
    explanation: "A Magna Charta Libertatum (1215) korlátozta a királyi adószedést és bíráskodást, és szavatolta az angol főurak (bárók) alapvető szabadságjogait."
  },
  {
    id: "q10_1_2",
    grade: "10. évfolyam",
    topic: "A középkori Európa",
    difficulty: "Könnyű",
    type: "true_false",
    question: "A hűbéri láncolatban (feudalizmus) az 'az én hűbéresem hűbérese az én hűbéresem is' elv érvényesült az egész középkori Európában.",
    correctAnswer: "Hamis",
    hint: "Gondoljon a kontinentális francia és a szigetországi angol modellek közötti különbségre.",
    explanation: "Hamis. A kontinentális Európában (főleg Franciaországban) az érvényesült, hogy 'az én hűbéresem hűbérese nem az én hűbéresem' (tehát nem engedelmeskedett közvetlenül a királynak, csak a saját urának)."
  },

  // Topic: Magyar Királyság az Árpád-korban
  {
    id: "q10_2_1",
    grade: "10. évfolyam",
    topic: "Magyar Királyság az Árpád-korban",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik magyar uralkodó bocsátotta ki az 1222-es Aranybullát a nemesi jogok biztosítására?",
    options: [
      "I. István",
      "I. László",
      "Kálmán",
      "II. Endre (András)"
    ],
    correctAnswer: "D",
    hint: "Uralkodása alatt mértéktelenül adományozott királyi birtokokat (újszerű intézkedések), ami gazdasági és politikai válsághoz vezetett.",
    explanation: "Az 1222-es Aranybullát II. András adta ki a serviensek és főurak nyomására, amely garantálta az adómentességet, a bírói szabadságot és az ellenállási jogot (31. cikkely)."
  },
  {
    id: "q10_2_3",
    grade: "10. évfolyam",
    topic: "Magyar Királyság az Árpád-korban",
    difficulty: "Nehéz",
    type: "essay",
    question: "Mutassa be IV. Béla tevékenységét a tatárjárás előtt, alatt és után, kitérve a második honalapító megnevezésre!",
    hint: "Foglalkozzon a kunok befogadásával, a muhi csatával, a kővárak építésével és a birtokpolitika megváltozásával.",
    explanation: "Értékelési szempontok: A királyi birtokok visszavételével keltett elégedetlenség, a muhi csata (1241) katasztrófája, a pusztítás mértéke. A tatárok kivonulása utáni tanulságok levonása: intenzív kővár-építési program, városi kiváltságok, birtokadományozások feltételekkel, emiatt nevezik 'második honalapítónak'."
  },

  // Topic: Késő középkor – Hunyadiak kora
  {
    id: "q10_3_1",
    grade: "10. évfolyam",
    topic: "Késő középkor – Hunyadiak kora",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik évben védte meg Hunyadi János a déli kaput jelentő Nándorfehérvárat a török ostrom ellen?",
    options: [
      "1444",
      "1453",
      "1456",
      "1490"
    ],
    correctAnswer: "C",
    hint: "Ahhoz a győzelemhez kapcsolódik a déli harangszó elrendelése III. Kallixtusz pápa által.",
    explanation: "1456. július 21-22-én Hunyadi János gátat szabott II. Mehmed hódításának Nándorfehérvárnál (ma Belgrád). Ezzel a győzelemmel mintegy hét évtizedre megvédte Magyarországot a török terjeszkedéstől."
  },

  // Topic: Kora újkor és reformáció
  {
    id: "q10_4_1",
    grade: "10. évfolyam",
    topic: "Kora újkor és reformáció",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik német teológus indította el a reformációt Luther-kabátban, kifüggesztve 95 tételét Wittembergből 1517. október 31-én?",
    options: [
      "Kálvin János",
      "Luther Márton",
      "Zwingli Ulrik",
      "Servet Mihály"
    ],
    correctAnswer: "B",
    hint: "Sola fide (egyedül a hit által) tanítása fókuszált a bűnbocsátó cédulák eladása ellen.",
    explanation: "A Wittenberg vártemplomának kapujára kifüggesztett 95 ponttal Luther Márton reformátor elindította az egyház megújulási mozgalmát."
  },

  // Topic: A török hódoltság Magyarországon
  {
    id: "q10_5_1",
    grade: "10. évfolyam",
    topic: "A török hódoltság Magyarországon",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik tragikus évben esett el a Magyar Királyság hadereje a mohácsi csatatéren II. Lajos királlyal együtt?",
    options: [
      "1514",
      "1521",
      "1526",
      "1541"
    ],
    correctAnswer: "C",
    hint: "A csata augusztus 29-én zajlott le, és elbukott a középkori magyar nagyhatalom.",
    explanation: "1526-ban Mohácsnál I. Szulejmán szultán seregei legyőzték a felkészületlen magyar fősereget, II. Lajos király is belefulladt a Csele-patakba."
  },

  // === 11. ÉVFOLYAM ===
  // Topic: Felvilágosodás és francia forradalom
  {
    id: "q11_1_1",
    grade: "11. évfolyam",
    topic: "Felvilágosodás és francia forradalom",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "A Bastille ostromával (1789. július 14.) vette kezdetét a francia forradalom. Melyik jelszó fejezi ki legjobban a forradalom hármas eszméjét?",
    options: [
      "Rend, Család, Munka",
      "Szabadság, Egyenlőség, Testvériség",
      "Kenyér, Föld, Béke",
      "Isten, Haza, Család"
    ],
    correctAnswer: "B",
    hint: "Franciául: 'Liberté, Égalité, Fraternité'.",
    explanation: "A francia forradalom alapvető jelmondata a 'Szabadság, Egyenlőség, Testvériség' lett, amely az emberi jogok nyilatkozatában is visszatükröződik."
  },

  // Topic: A napóleoni korszak
  {
    id: "q11_2_1",
    grade: "11. évfolyam",
    topic: "A napóleoni korszak",
    difficulty: "Könnyű",
    type: "true_false",
    question: "Napóleon végső katonai vereségét a waterlooi csatában szenvedte el 1815-ben.",
    correctAnswer: "Igaz",
    hint: "Ez a csata a mai Belgium területén zajlott, Wellington hercegével és Blücher tábornokával szemben.",
    explanation: "Igaz. Az 1815-ös waterlooi csatában Napóleon visszatérési kísérletének a szövetséges angol-porosz seregek végleg véget vetettek, ezt követően Szt. Ilona szigetére száműzték."
  },

  // Topic: Reformkor és 1848–49
  {
    id: "q11_3_1",
    grade: "11. évfolyam",
    topic: "Reformkor és 1848–49",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Ki volt a reformkori 'Hitel' (1830) szerzője, akit Kossuth Lajos 'a legnagyobb magyarnak' nevezett?",
    options: [
      "Deák Ferenc",
      "Széchenyi István",
      "Kölcsey Ferenc",
      "Wesselényi Miklós"
    ],
    correctAnswer: "B",
    hint: "Gyakorlati alkotásai közé tartozik a Lánchíd építése, a Tisza szabályozása és a pesti Magyar Tudományos Akadémia alapítása.",
    explanation: "Gróf Széchenyi István indította el elméleti munkáival (Hitel, Világ, Stádium) a magyar reformkort, s vezette a gazdasági infrastruktúra nemzeti szintű modernizációját."
  },
  {
    id: "q11_3_2",
    grade: "11. évfolyam",
    topic: "Reformkor és 1848–49",
    difficulty: "Nehéz",
    type: "essay",
    question: "Mutassa be a márciusi ifjak és a pesti forradalom (1848. március 15.) főbb eseményeit és jelentőségét!",
    hint: "Említse meg a Pilvax kávéházat, Nemzeti dalt, Landerer nyomdát, a 12 pontot és Táncsics kiszabadítását.",
    explanation: "Értékelési szempontok: A bécsi forradalom hírére való gyors reagálás Petőfi, Jókai, Vasvári vezetésével. Sajtószabadság kivívása cenzúra nélkül, Nemzeti Múzeum előtti gyűlés, Városháza meggyőzése, Táncsics Mihály politikai fogoly börtönből való kiszabadítása."
  },

  // Topic: Az ipari forradalom
  {
    id: "q11_4_1",
    grade: "11. évfolyam",
    topic: "Az ipari forradalom",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Ki találta fel a gőzgépet 1769-ben, amely az első ipari forradalom legfontosabb erőgépévé vált?",
    options: [
      "George Stephenson",
      "James Watt",
      "Robert Fulton",
      "Thomas Edison"
    ],
    correctAnswer: "B",
    hint: "A teljesítmény egységét (watt) az ő tiszteletére nevezték el.",
    explanation: "Bár gőzzel hajtott dugattyúk korábban is léteztek, James Watt skót feltaláló tökéletesítette a gőzgépet úgy, hogy az sokoldalúan felhasználható gyári erőforrás lett."
  },

  // Topic: Az első világháború
  {
    id: "q11_5_1",
    grade: "11. évfolyam",
    topic: "Az első világháború",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik szarajevói merénylet váltotta ki az első világháború kitörését 1914 nyarán?",
    options: [
      "Ferenc Ferdinánd trónörökös meggyilkolása",
      "Erzsébet királyné (Sisi) meggyilkolása",
      "I. Ferenc József császár elleni merénylet",
      "Tisza István miniszterelnök meggyilkolása"
    ],
    correctAnswer: "A",
    hint: "A merényletet a szerb nacionalista Gavrilo Princip követte el június 28-án Boszniában.",
    explanation: "A szarajevói látogatáson lévő Ferenc Ferdinánd osztrák-magyar trónörökös meggyilkolása volt a casus belli (háborús indok), amely elindította a dominó-hatást és a hadüzeneteket."
  },

  // === 12. ÉVFOLYAM ===
  // Topic: A két háború közötti időszak
  {
    id: "q12_1_1",
    grade: "12. évfolyam",
    topic: "A két háború közötti időszak",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik hírhedt békeszerződés pecsételte meg Magyarország sorsát a Nagy Háború után, 1920. június 4-én?",
    options: [
      "Versailles-i béke",
      "Trianoni békediktátum",
      "Saint-germaini béke",
      "Párizsi békeszerződés"
    ],
    correctAnswer: "B",
    hint: "A Nagy-Trianon kastély folyosóján írták alá, s ennek következtében az ország területe harmadára esett vissza.",
    explanation: "A Trianoni békediktátum következtében a történelmi Magyarország elveszítette területének mintegy kétharmadát és lakosságának 60%-át, több millió magyar rekedt az új határokon túlra."
  },

  // Topic: A második világháború
  {
    id: "q12_2_1",
    grade: "12. évfolyam",
    topic: "A második világháború",
    difficulty: "Nehéz",
    type: "multiple_choice",
    question: "Melyik magyar hadsereg szenvedett tragikus, csaknem teljes pusztulást a Don-kanyarban 1943 januárjában?",
    options: [
      "1. magyar hadsereg",
      "2. magyar hadsereg",
      "3. magyar hadsereg",
      "Gyorshadtest"
    ],
    correctAnswer: "B",
    hint: "A parancsnoka Jány Gusztáv vezérezredes volt, a veszteség meghaladta a 100 000 főt.",
    explanation: "A 2. magyar hadsereg a Don-kanyarnál szovjet offenzívával találkozott rendkívül zord, fagyos körülmények között, s katasztrofális felszereléshiány miatt szinte teljesen megsemmisült."
  },
  {
    id: "q12_2_2",
    grade: "12. évfolyam",
    topic: "A második világháború",
    difficulty: "Könnyű",
    type: "true_false",
    question: "A második világháború hivatalosan Lengyelország náci Németország általi lerohanásával kezdődött 1939. szeptember 1-jén.",
    correctAnswer: "Igaz",
    hint: "A villámháborús (Blitzkrieg) taktika bevetésével Hitler megtámadta keleti szomszédját.",
    explanation: "Igaz. Németország lengyelországi támadása után két nappal Nagy-Britannia és Franciaország hadat üzent Berlinnek, kitört a második világháború."
  },

  // Topic: A hidegháború
  {
    id: "q12_3_1",
    grade: "12. évfolyam",
    topic: "A hidegháború",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik katonai védelmi szövetséget hozták létre a nyugati szövetségesek Washingtonban, 1949-ben?",
    options: [
      "Varsói Szerződés",
      "NATO (Észak-atlanti Szerződés Szervezete)",
      "ENSZ (Egyesült Nemzetek Szervezete)",
      "Európai Szén- és Acélközösség"
    ],
    correctAnswer: "B",
    hint: "Alapokmánya az 5. cikk, amely kollektív védelmet biztosít bármely tagállam külső támadása esetén.",
    explanation: "A NATO-t 1949-ben alapították meg a fegyveres szovjet előretörés ellensúlyozására Európában."
  },

  // Topic: Magyarország 1945–1990
  {
    id: "q12_4_1",
    grade: "12. évfolyam",
    topic: "Magyarország 1945–1990",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik híres miniszterelnök állt az 1956-os magyar forradalom kormányfői posztján, s akit később Kádár-rezsimben kivégeztek?",
    options: [
      "Rákosi Mátyás",
      "Kádár János",
      "Nagy Imre",
      "Gerő Ernő"
    ],
    correctAnswer: "C",
    hint: "A forradalom alatt bejelentette a többpártrendszer visszaállítását, a Varsói Szerződésből való kilépést és az ország semlegességét.",
    explanation: "Nagy Imre az 1956-os forradalom mártír miniszterelnöke, aki nem volt hajlandó visszavonni forradalmi nyilatkozatait, így koholt vádak alapján 1958. június 16-án kivégezték."
  },
  {
    id: "q12_4_2",
    grade: "12. évfolyam",
    topic: "Magyarország 1945–1990",
    difficulty: "Nehéz",
    type: "essay",
    question: "Elemezze az 1956-os forradalmat megelőző Rákosi-rendszer sztálinista jellegét és a társadalmi feszültségeket!",
    hint: "Személyi kultusz, ÁVH terror, erőszakos kollektivizálás, beszolgáltatás, koncepciós perek, életszínvonal mélypont.",
    explanation: "Értékelési szempontok: A szovjet típusú totális diktatúra kiépítése (1948-49 után). Rákosi Mátyás személyi kultusza, koncepciós perek (Rajk László), az ÁVH általi terror és kitelepítések. Gazdaságpolitika: nehézipar erőltetése ('vas és acél országa'), kollektivizálás a mezőgazdaságban, éhezéshez közeli állapotok, amelyek feszültségét Sztálin halála és Nagy Imre első enyhülése hozta felszínre."
  },

  // Topic: Rendszerváltás és jelenkor
  {
    id: "q12_5_1",
    grade: "12. évfolyam",
    topic: "Rendszerváltás és jelenkor",
    difficulty: "Közepes",
    type: "multiple_choice",
    question: "Melyik évben tartották az első szabad rendszerváltó választásokat Magyarországon, véget vetve az egypárti kommunista uralomnak?",
    options: [
      "1985",
      "1989",
      "1990",
      "2004"
    ],
    correctAnswer: "C",
    hint: "Ilyenkor alakult meg az Antall József vezette MDF-FKGP-KDNP koalíciós kormány.",
    explanation: "Az 1990 tavaszán lebonyolított első szabad parlamenti választások mérföldkövet jelentettek a békés magyar demokratikus átmenetben."
  }
];

export function getFallbackQuestions(
  grade: string,
  topic: string,
  type: string,
  count: number,
  difficulty?: "Könnyű" | "Közepes" | "Nehéz"
): QuizQuestion[] {
  // Filter questions matching grade and topic
  let filtered = FALLBACK_QUESTIONS.filter(
    (q) => q.grade === grade && q.topic === topic
  );

  // Filter by difficulty if provided (excluding Nehéz from Könnyű setup if possible)
  if (difficulty) {
    const diffMatch = filtered.filter((q) => q.difficulty === difficulty);
    if (diffMatch.length >= 1) {
      filtered = filtered; // Keep all but can prioritize difficulty in custom shuffling
    }
  }

  // Filter by type matching if requested
  if (type && type !== "Vegyes") {
    const typeKey =
      type === "Csak feleletválasztós"
        ? "multiple_choice"
        : type === "Igaz-Hamis"
        ? "true_false"
        : "essay";
    const typeMatch = filtered.filter((q) => q.type === typeKey);
    if (typeMatch.length > 0) {
      filtered = typeMatch;
    }
  }

  // If there are too few, grab other topics from the SAME grade to bolster the count!
  if (filtered.length < count) {
    const gradeLevel = FALLBACK_QUESTIONS.filter(
      (q) => q.grade === grade && q.id !== filtered[0]?.id
    );
    // Shuffle and pick
    for (const q of gradeLevel) {
      if (filtered.length >= count) break;
      if (!filtered.some((fq) => fq.id === q.id)) {
        filtered.push(q);
      }
    }
  }

  // Shuffle and slice
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    hint: q.hint,
    explanation: q.explanation
  }));
}
