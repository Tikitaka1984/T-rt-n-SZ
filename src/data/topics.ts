import { Grade } from "../types";

export const GRADE_TOPICS: Record<Grade, string[]> = {
  "9. évfolyam": [
    "Őskor és az ókori Kelet",
    "Az ókori görög civilizáció",
    "Az ókori Róma",
    "Népvándorlás és a magyarok eredete",
    "Honfoglalás és az Árpád-kor"
  ],
  "10. évfolyam": [
    "A középkori Európa",
    "Magyar Királyság az Árpád-korban",
    "Késő középkor – Hunyadiak kora",
    "Kora újkor és reformáció",
    "A török hódoltság Magyarországon"
  ],
  "11. évfolyam": [
    "Felvilágosodás és francia forradalom",
    "A napóleoni korszak",
    "Reformkor és 1848–49",
    "Az ipari forradalom",
    "Az első világháború"
  ],
  "12. évfolyam": [
    "A két háború közötti időszak",
    "A második világháború",
    "A hidegháború",
    "Magyarország 1945–1990",
    "Rendszerváltás és jelenkor"
  ],
  "Vegyes (Ismétlés)": [
    "Teljes középiskolai anyag",
    "Érettségi felkészítő – egyetemes történelem",
    "Érettségi felkészítő – magyar történelem"
  ]
};

export const TOPICS: Record<string, { nat: string[]; erettsegi: string[] }> = {
  "9. évfolyam": {
    nat: [
      "Őskor és az ókori Kelet",
      "Az ókori görög civilizáció",
      "Az ókori Róma",
      "Népvándorlás és a magyarok eredete",
      "Honfoglalás és az Árpád-kor"
    ],
    erettsegi: [
      "Ókori keleti civilizációk vallási és kulturális jellemzői",
      "Ókori Izrael és Fönícia",
      "Athéni demokrácia",
      "Görög-római hitvilág és filozófia",
      "A köztársaság válsága az ókori Rómában",
      "Julius Caesar és Augustus principátusa",
      "A kereszténység kialakulása és elterjedése",
      "A Bizánci és a Frank Birodalom",
      "Feudális gazdasági és társadalmi rend",
      "A magyarság története az államalapításig",
      "Az Árpád-házi királyok kora",
      "Az Anjouk és Luxemburgi Zsigmond kora",
      "A Hunyadiak kora"
    ]
  },
  "10. évfolyam": {
    nat: [
      "A középkori Európa",
      "Magyar Királyság az Árpád-korban",
      "Késő középkor – Hunyadiak kora",
      "Kora újkor és reformáció",
      "A török hódoltság Magyarországon"
    ],
    erettsegi: [
      "A földrajzi felfedezések és következményei",
      "Reformáció és katolikus megújulás",
      "Alkotmányosság és abszolutizmus a 17-18. században",
      "A felvilágosodás kora",
      "Nagyhatalmi konfliktusok a 17-18. században",
      "Magyarország a kora újkorban – török hódoltság",
      "A Rákóczi-szabadságharc",
      "Felvilágosult abszolutizmus Magyarországon",
      "Demográfiai változások Magyarországon a XVIII. században"
    ]
  },
  "11. évfolyam": {
    nat: [
      "Felvilágosodás és francia forradalom",
      "A napóleoni korszak",
      "Reformkor és 1848–49",
      "Az ipari forradalom",
      "Az első világháború"
    ],
    erettsegi: [
      "A francia forradalom és a napóleoni korszak",
      "Az ipari forradalom és hatásai",
      "A 19. század első felének uralkodó eszméi",
      "A német egység és a balkáni nemzetállamok",
      "Szövetségi rendszerek és gyarmatosítás",
      "Az első világháború",
      "Az első világháborút lezáró békerendszer – Trianon",
      "Reformkor és 1848-49 Magyarországon",
      "A kiegyezés és a dualizmus kora",
      "Dualizmus kori gazdaság és társadalom",
      "Budapest a századfordulón"
    ]
  },
  "12. évfolyam": {
    nat: [
      "A két háború közötti időszak",
      "A második világháború",
      "A hidegháború",
      "Magyarország 1945–1990",
      "Rendszerváltás és jelenkor"
    ],
    erettsegi: [
      "Világgazdasági válság és kiutak keresése",
      "Fasizmus Olaszországban",
      "Nemzetiszocializmus Németországban",
      "Kommunista diktatúra a Szovjetunióban",
      "A második világháború és a holokauszt",
      "Az ENSZ és a hidegháború kialakulása",
      "A hidegháború évei 1953-63",
      "Gyarmati rendszer felbomlása",
      "A kétpólusú világrend megszűnése",
      "Az ellenforradalmi rendszer konszolidációja – Horthy-korszak",
      "Magyarország háborúba sodródása",
      "A Rákosi-diktatúra 1945-1956",
      "Az 1956-os forradalom és szabadságharc",
      "A Kádár-korszak",
      "A rendszerváltás Magyarországon",
      "Az egységesülő Európa és globalizáció"
    ]
  }
};
