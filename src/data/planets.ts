export interface Planet {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  description: string;
  influence: string;
  positiveEffects: string[];
  negativeEffects: string[];
  rulesSign: string[];
  element: string;
  transitDuration: string;
  color: string;
  glow: string;
  imageUrl: string;
}

export const planets: Planet[] = [
  {
    id: "gunes",
    name: "Güneş",
    symbol: "☉",
    emoji: "☀️",
    description: "Güneş, astrolojide benliğin, yaşam enerjisinin ve temel kimliğin simgesidir. Bir kişinin haritasında Güneş'in konumu, o kişinin temel karakterini, yaşam amacını ve ego yapısını belirler.",
    influence: "Benlik, kimlik, ego, yaşam enerjisi, yaratıcılık, liderlik",
    positiveEffects: ["Güçlü liderlik", "Yaratıcılık", "Hayat enerjisi", "Kendine güven", "Cömertlik"],
    negativeEffects: ["Kibir", "Egosantrik davranış", "Baskınlık", "Gösteriş merakı"],
    rulesSign: ["aslan"],
    element: "Ateş",
    transitDuration: "Her burçta yaklaşık 1 ay",
    color: "#ffaa00",
    glow: "rgba(255, 170, 0, 0.4)",
    imageUrl: "https://images.unsplash.com/photo-1632395627732-005012dbc286?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "ay",
    name: "Ay",
    symbol: "☽",
    emoji: "🌙",
    description: "Ay, duygusal dünyamızı, iç dünyamızı ve bilinçaltımızı temsil eder. Anne figürünü, ev hayatını ve güvenlik ihtiyacımızı yansıtır. Duyguların, sezgilerin ve içgüdülerin gezegenidir.",
    influence: "Duygular, sezgi, bilinçaltı, annelik, ev, beslenme",
    positiveEffects: ["Güçlü sezgiler", "Duygusal derinlik", "Empati", "Şefkat", "Hayal gücü"],
    negativeEffects: ["Duygu dalgalanmaları", "Aşırı hassasiyet", "Bağımlılık", "Karamsar düşünceler"],
    rulesSign: ["yengec"],
    element: "Su",
    transitDuration: "Her burçta yaklaşık 2.5 gün",
    color: "#e2e8f0",
    glow: "rgba(226, 232, 240, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1481819613568-3701cbc70156?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "merkur",
    name: "Merkür",
    symbol: "☿",
    emoji: "☿️",
    description: "Merkür, iletişimin, zekanın ve düşüncenin gezegenidir. Nasıl düşündüğümüzü, nasıl iletişim kurduğumuzu ve bilgiyi nasıl işlediğimizi gösterir. Ticaret, yazı ve seyahatle ilişkilidir.",
    influence: "İletişim, zeka, mantık, ticaret, yazma, kısa yolculuklar",
    positiveEffects: ["Keskin zeka", "İletişim becerisi", "Çabuk kavrama", "Analitik düşünce", "Uyum yeteneği"],
    negativeEffects: ["Sinirlilik", "Yüzeysellik", "Dedikodu", "Kararsızlık", "Manipülasyon"],
    rulesSign: ["ikizler", "basak"],
    element: "Hava / Toprak",
    transitDuration: "Her burçta yaklaşık 3-4 hafta",
    color: "#94a3b8",
    glow: "rgba(148, 163, 184, 0.3)",
    imageUrl: "https://images.pexels.com/photos/12498795/pexels-photo-12498795.jpeg"
  },
  {
    id: "venus",
    name: "Venüs",
    symbol: "♀",
    emoji: "♀️",
    description: "Venüs, aşkın, güzelliğin ve uyumun gezegenidir. Neyi çekici bulduğumuzu, nasıl sevdiğimizi ve estetik değerlerimizi belirler. Sanat, müzik ve maddi değerlerle ilişkilidir.",
    influence: "Aşk, güzellik, sanat, para, değerler, çekicilik",
    positiveEffects: ["Aşk ve romantizm", "Estetik duygu", "Uyum", "Diplomatik yetenek", "Sanatsal yetenek"],
    negativeEffects: ["Tembellik", "Savurganlık", "Kıskançlık", "Yüzeysel ilişkiler", "Kararsızlık"],
    rulesSign: ["boga", "terazi"],
    element: "Toprak / Hava",
    transitDuration: "Her burçta yaklaşık 3-4 hafta",
    color: "#f472b6",
    glow: "rgba(244, 114, 182, 0.3)",
    imageUrl: "https://cdn.mos.cms.futurecdn.net/RifjtkFLBEFgzkZqWEh69P-650-80.jpg.webp"
  },
  {
    id: "mars",
    name: "Mars",
    symbol: "♂",
    emoji: "♂️",
    description: "Mars, enerji, eylem ve tutku gezegenidir. Nasıl harekete geçtiğimizi, ne için savaştığımızı ve arzularımızı gösterir. Fiziksel güç, cesaret ve rekabeti temsil eder.",
    influence: "Enerji, cesaret, savaş, tutku, fiziksel güç, eylem",
    positiveEffects: ["Cesaret", "Kararlılık", "Fiziksel enerji", "Girişimcilik", "Liderlik"],
    negativeEffects: ["Agresiflik", "Sabırsızlık", "Dürtüsellik", "Çatışma eğilimi", "Öfke"],
    rulesSign: ["koc"],
    element: "Ateş",
    transitDuration: "Her burçta yaklaşık 6-7 hafta",
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "jupiter",
    name: "Jüpiter",
    symbol: "♃",
    emoji: "🪐",
    description: "Jüpiter, büyümenin, şansın ve genişlemenin gezegenidir. Hayatta nereye genişlediğimizi, nerede şanslı olduğumuzu ve felsefi bakış açımızı belirler. Eğitim, seyahat ve inanç sistemleriyle ilişkilidir.",
    influence: "Şans, genişleme, bilgelik, felsefe, eğitim, seyahat",
    positiveEffects: ["Şans", "İyimserlik", "Cömertlik", "Bilgelik", "Büyüme fırsatları"],
    negativeEffects: ["Aşırılık", "Abartı", "Tembellik", "Sorumsuzluk", "Savurganlık"],
    rulesSign: ["yay"],
    element: "Ateş",
    transitDuration: "Her burçta yaklaşık 1 yıl",
    color: "#fb923c",
    glow: "rgba(251, 146, 60, 0.3)",
    imageUrl: "https://cdn.britannica.com/66/155966-050-F18467EA/Jupiter.jpg"
  },
  {
    id: "saturn",
    name: "Satürn",
    symbol: "♄",
    emoji: "🪐",
    description: "Satürn, disiplinin, sorumluluğun ve yapının gezegenidir. Kısıtlamalar, dersler ve olgunlaşma süreciyle ilişkilidir. Zaman, yaşlanma ve otoriteyi temsil eder.",
    influence: "Disiplin, sorumluluk, yapı, kısıtlama, zaman, otorite",
    positiveEffects: ["Disiplin", "Sorumluluk", "Dayanıklılık", "Pratik zeka", "Uzun vadeli başarı"],
    negativeEffects: ["Katılık", "Karamsarlık", "Korku", "Aşırı muhafazakarlık", "Yalnızlık"],
    rulesSign: ["oglak"],
    element: "Toprak",
    transitDuration: "Her burçta yaklaşık 2.5 yıl",
    color: "#94a3b8",
    glow: "rgba(148, 163, 184, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "uranus",
    name: "Uranüs",
    symbol: "♅",
    emoji: "⚡",
    description: "Uranüs, devrimlerin, yeniliğin ve sıra dışılığın gezegenidir. Beklenmedik değişimler, teknoloji ve özgürlük arayışıyla ilişkilidir. Kolektif bilinç ve insanlığın ilerlemesini temsil eder.",
    influence: "Yenilik, devrim, özgürlük, teknoloji, sıra dışılık",
    positiveEffects: ["Yenilikçilik", "Özgür düşünce", "Deha", "İnsancılık", "Teknolojik ilerleme"],
    negativeEffects: ["İsyankarlık", "Dengesizlik", "Öngörülemezlik", "Aşırı bağımsızlık"],
    rulesSign: ["kova"],
    element: "Hava",
    transitDuration: "Her burçta yaklaşık 7 yıl",
    color: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1614732484003-ef9881555dc3?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "neptun",
    name: "Neptün",
    symbol: "♆",
    emoji: "🔱",
    description: "Neptün, hayallerin, sezgilerin ve spiritüelliğin gezegenidir. İllüzyon, yaratıcılık ve evrensel aşkla ilişkilidir. Sanat, müzik ve mistisizmi temsil eder.",
    influence: "Hayal gücü, sezgi, spiritüellik, sanat, illüzyon",
    positiveEffects: ["Yaratıcı ilham", "Spiritüel uyanış", "Şefkat", "Müzik yeteneği", "Güçlü sezgiler"],
    negativeEffects: ["Yanılsama", "Kaçış eğilimi", "Bağımlılık", "Kafa karışıklığı", "Aldanma"],
    rulesSign: ["balik"],
    element: "Su",
    transitDuration: "Her burçta yaklaşık 14 yıl",
    color: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "pluton",
    name: "Plüton",
    symbol: "♇",
    emoji: "🔮",
    description: "Plüton, dönüşümün, gücün ve yenilenmenin gezegenidir. Derinlere inme, tabu konular ve köklü değişimlerle ilişkilidir. Ölüm ve yeniden doğuşu temsil eder.",
    influence: "Dönüşüm, güç, yenilenme, bilinçaltı, tabular",
    positiveEffects: ["Dönüşüm gücü", "Araştırma yeteneği", "Dayanıklılık", "Psikolojik derinlik", "Yenilenme"],
    negativeEffects: ["Obsesyon", "Manipülasyon", "Güç mücadelesi", "Yıkıcılık", "Kıskançlık"],
    rulesSign: ["akrep"],
    element: "Su",
    transitDuration: "Her burçta yaklaşık 12-31 yıl",
    color: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.3)",
    imageUrl: "https://images.unsplash.com/photo-1614314107768-6018061b5b72?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

export const getPlanetById = (id: string): Planet | undefined => {
  return planets.find(p => p.id === id);
};