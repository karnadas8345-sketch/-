import { Body, Observer, Ecliptic, GeoVector } from 'astronomy-engine';

export const SIGNS_BN = [
  "মেষ", "বৃষ", "মিথুন", "কর্কট", "সিংহ", "কন্যা",
  "তুলা", "বৃশ্চিক", "ধনু", "মকর", "কুম্ভ", "মীন"
];

export const SIGNS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const PLANETS_BN: Record<string, string> = {
  "Sun": "সূর্য",
  "Moon": "চন্দ্র",
  "Mercury": "বুধ",
  "Venus": "শুক্র",
  "Mars": "মঙ্গল",
  "Jupiter": "বৃহস্পতি",
  "Saturn": "শনি",
  "Rahu": "রাহু",
  "Ketu": "কেতু",
  "Ascendant": "লগ্ন"
};

export const SIGNS_HI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"
];

export const SIGNS_MR = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तूळ", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"
];

export const SIGNS_GU = [
  "મેષ", "વૃષભ", "મિથુન", "કર્ક", "સિંહ", "કન્યા",
  "તુલા", "વૃશ્ચિક", "ધનુ", "મકર", "કુંભ", "મીન"
];

export const SIGNS_NE = [
  "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

export const SIGNS_OR = [
  "ମେଷ", "ବୃଷ", "ମିଥୁନ", "କର୍କଟ", "ସିଂହ", "କନ୍ୟା",
  "ତୁଳା", "ବିଛା", "ଧନୁ", "ମକର", "କୁମ୍ଭ", "ମୀନ"
];

export const PLANETS_HI: Record<string, string> = {
  "Sun": "सूर्य",
  "Moon": "चंद्र",
  "Mercury": "बुध",
  "Venus": "शुक्र",
  "Mars": "मंगल",
  "Jupiter": "बृहस्पति",
  "Saturn": "शनि",
  "Rahu": "राहु",
  "Ketu": "केतु",
  "Ascendant": "लग्न"
};

export const PLANETS_MR: Record<string, string> = {
  "Sun": "सूर्य",
  "Moon": "चंद्र",
  "Mercury": "बुध",
  "Venus": "शुक्र",
  "Mars": "मंगळ",
  "Jupiter": "गुरु",
  "Saturn": "शनी",
  "Rahu": "राहू",
  "Ketu": "केतू",
  "Ascendant": "लग्न"
};

export const PLANETS_GU: Record<string, string> = {
  "Sun": "સૂર્ય",
  "Moon": "ચંદ્ર",
  "Mercury": "બુધ",
  "Venus": "શુક્ર",
  "Mars": "મંગળ",
  "Jupiter": "ગુરુ",
  "Saturn": "શનિ",
  "Rahu": "રાહુ",
  "Ketu": "કેતુ",
  "Ascendant": "લગ્ન"
};

export const PLANETS_NE: Record<string, string> = {
  "Sun": "सूर्य",
  "Moon": "चन्द्र",
  "Mercury": "बुध",
  "Venus": "शुक्र",
  "Mars": "मंगल",
  "Jupiter": "बृहस्पति",
  "Saturn": "शनि",
  "Rahu": "राहु",
  "Ketu": "केतु",
  "Ascendant": "लग्न"
};

export const PLANETS_OR: Record<string, string> = {
  "Sun": "ସୂର୍ଯ୍ୟ",
  "Moon": "ଚନ୍ଦ୍ର",
  "Mercury": "ବୁଧ",
  "Venus": "ଶୁକ୍ର",
  "Mars": "ମଙ୍ଗଳ",
  "Jupiter": "ବୃହସ୍ପତି",
  "Saturn": "ଶନି",
  "Rahu": "ରାହୁ",
  "Ketu": "କେତୁ",
  "Ascendant": "ଲଗ୍ନ"
};

export const NAKSHATRAS_HI = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा",
  "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"
];

export const NAKSHATRAS_MR = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसू", "पुष्य", "आश्लेषा",
  "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूळ", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शततारका", "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती"
];

export const NAKSHATRAS_GU = [
  "અશ્વિની", "ભરણી", "કૃતિકા", "રોહિણી", "મૃગશીર્ષ", "આદ્રા", "પુનર્વસુ", "પુષ્ય", "આશ્લેષા",
  "મઘા", "પૂર્વા ફાલ્ગુની", "ઉત્તરા ફાલ્ગુની", "હસ્ત", "ચિત્રા", "સ્વાતિ", "વિશાખા", "અનુરાધા", "જ્યેષ્ઠા",
  "મૂળ", "પૂર્વાષાઢા", "ઉત્તરાષાઢા", "શ્રવણ", "ધનિષ્ઠા", "શતભિષા", "પૂર્વાભાદ્રપદ", "ઉત્તરાભાદ્રપદ", "રેવતી"
];

export const NAKSHATRAS_NE = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा",
  "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"
];

export const NAKSHATRAS_OR = [
  "ଅଶ୍ୱିନୀ", "ଭରଣୀ", "କୃତ୍ତିକା", "ରୋହିଣୀ", "ମୃଗଶିରା", "ଆର୍ଦ୍ରା", "ପୁନର୍ବସୁ", "ପୁଷ୍ୟା", "ଅଶ୍ଳେଷା",
  "ମଘା", "ପୂର୍ବାଫାଲ୍ଗୁନୀ", "ଉତ୍ତରାଫାଲ୍ଗୁନୀ", "ହସ୍ତା", "ଚିତ୍ରା", "ସ୍ୱାତୀ", "ବିଶାଖା", "ଅନୁରାଧା", "ଜ୍ୟେଷ୍ଠା",
  "ମୂଳା", "ପୂର୍ବାଷାଢ଼ା", "ଉତ୍ତରାଷାଢ଼ା", "ଶ୍ରବଣା", "ଧନିଷ୍ଠା", "ଶତଭିଷା", "ପୂର୍ବଭାଦ୍ରପଦ", "ଉତ୍ତରଭାଦ୍ରପଦ", "ରେବତୀ"
];

export const NAKSHATRAS_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  lat: number;
  lon: number;
}

export function calculateLahiriAyanamsa(date: Date): number {
  const j2000 = new Date('2000-01-01T12:00:00Z');
  const diffYears = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return 23.85 + (diffYears * 50.27 / 3600);
}

export function getZodiacSign(longitude: number): number {
  return Math.floor((longitude + 360) % 360 / 30);
}

export const NAKSHATRAS_BN = [
  "অশ্বিনী", "ভরণী", "কৃত্তিকা", "রোহিণী", "মৃগশিরা", "আর্দ্রা", "পুনর্বসু", "পুষ্যা", "অশ্লেষা",
  "মঘা", "পূর্ব ফাল্গুনী", "উত্তর ফাল্গুনী", "হস্ত", "চিত্রা", "স্বাতী", "বিশাখা", "অনুরাধা", "জ্যেষ্ঠা",
  "মূল", "পূর্ব আষাঢ়া", "উত্তর আষাঢ়া", "শ্রবণা", "ধনিষ্ঠা", "শতভিষা", "পূর্ব ভাদ্রপদ", "উত্তর ভাদ্রপদ", "রেবতী"
];

export function getNakshatra(longitude: number): { bn: string, en: string, hi: string, ne: string, or: string, mr: string, gu: string } {
  const index = Math.floor(((longitude + 360) % 360) / (360 / 27));
  return {
    bn: NAKSHATRAS_BN[index],
    en: NAKSHATRAS_EN[index],
    hi: NAKSHATRAS_HI[index],
    ne: NAKSHATRAS_NE[index],
    or: NAKSHATRAS_OR[index],
    mr: NAKSHATRAS_MR[index],
    gu: NAKSHATRAS_GU[index]
  };
}

export function calculateAstrology(data: BirthData) {
  const date = new Date(`${data.date}T${data.time}:00Z`);
  const ayanamsa = calculateLahiriAyanamsa(date);

  const bodies = [
    Body.Sun,
    Body.Moon,
    Body.Mercury,
    Body.Venus,
    Body.Mars,
    Body.Jupiter,
    Body.Saturn
  ];

  const results: any = {
    planets: [],
    ayanamsa: ayanamsa,
    moonRashi: "",
    moonNakshatra: ""
  };

  bodies.forEach(body => {
    const vec = GeoVector(body, date, true);
    const ecl = Ecliptic(vec);
    const siderealLon = (ecl.elon - ayanamsa + 360) % 360;
    const signIndex = getZodiacSign(siderealLon);

    const planetData = {
      id: body,
      name: {
        bn: PLANETS_BN[body] || body,
        en: body,
        hi: PLANETS_HI[body] || body,
        ne: PLANETS_NE[body] || body,
        or: PLANETS_OR[body] || body,
        mr: PLANETS_MR[body] || body,
        gu: PLANETS_GU[body] || body
      },
      longitude: siderealLon,
      sign: {
        bn: SIGNS_BN[signIndex],
        en: SIGNS_EN[signIndex],
        hi: SIGNS_HI[signIndex],
        ne: SIGNS_NE[signIndex],
        or: SIGNS_OR[signIndex],
        mr: SIGNS_MR[signIndex],
        gu: SIGNS_GU[signIndex]
      },
      degree: siderealLon % 30,
      nakshatra: getNakshatra(siderealLon)
    };

    if (body === Body.Moon) {
      results.moonRashi = planetData.sign;
      results.moonNakshatra = planetData.nakshatra;
    }

    results.planets.push(planetData);
  });

  // Calculate Dasha
  const moon = results.planets.find((p: any) => p.id === Body.Moon);
  if (moon) {
    results.dasha = calculateVimshottariDasha(moon.longitude, date);
  }

  const t = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24 * 36525);
  let meanRahu = 125.04452 - 1934.136261 * t + 0.0020708 * t * t;
  meanRahu = (meanRahu - ayanamsa + 360) % 360;
  
  const rahuSignIdx = getZodiacSign(meanRahu);
  results.planets.push({
    id: 'Rahu',
    name: {
      bn: PLANETS_BN['Rahu'],
      en: 'Rahu',
      hi: PLANETS_HI['Rahu'],
      ne: PLANETS_NE['Rahu'],
      or: PLANETS_OR['Rahu'],
      mr: PLANETS_MR['Rahu'],
      gu: PLANETS_GU['Rahu']
    },
    longitude: meanRahu,
    sign: {
      bn: SIGNS_BN[rahuSignIdx],
      en: SIGNS_EN[rahuSignIdx],
      hi: SIGNS_HI[rahuSignIdx],
      ne: SIGNS_NE[rahuSignIdx],
      or: SIGNS_OR[rahuSignIdx],
      mr: SIGNS_MR[rahuSignIdx],
      gu: SIGNS_GU[rahuSignIdx]
    },
    degree: meanRahu % 30,
    nakshatra: getNakshatra(meanRahu)
  });

  const meanKetu = (meanRahu + 180) % 360;
  const ketuSignIdx = getZodiacSign(meanKetu);
  results.planets.push({
    id: 'Ketu',
    name: {
      bn: PLANETS_BN['Ketu'],
      en: 'Ketu',
      hi: PLANETS_HI['Ketu'],
      ne: PLANETS_NE['Ketu'],
      or: PLANETS_OR['Ketu'],
      mr: PLANETS_MR['Ketu'],
      gu: PLANETS_GU['Ketu']
    },
    longitude: meanKetu,
    sign: {
      bn: SIGNS_BN[ketuSignIdx],
      en: SIGNS_EN[ketuSignIdx],
      hi: SIGNS_HI[ketuSignIdx],
      ne: SIGNS_NE[ketuSignIdx],
      or: SIGNS_OR[ketuSignIdx],
      mr: SIGNS_MR[ketuSignIdx],
      gu: SIGNS_GU[ketuSignIdx]
    },
    degree: meanKetu % 30,
    nakshatra: getNakshatra(meanKetu)
  });

  return results;
}

export interface DashaPeriod {
  planet: string;
  start: Date;
  end: Date;
  durationYears: number;
}

export function calculateVimshottariDasha(moonLon: number, birthDate: Date) {
  const dashaOrder = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  
  const nakshatraWidth = 360 / 27;
  const nakshatraIndex = Math.floor(moonLon / nakshatraWidth);
  const startingPlanetIdx = nakshatraIndex % 9;
  
  const elapsedInNakshatra = moonLon % nakshatraWidth;
  const remainingFraction = (nakshatraWidth - elapsedInNakshatra) / nakshatraWidth;
  
  const firstDashaYears = remainingFraction * dashaYears[startingPlanetIdx];
  
  const periods: DashaPeriod[] = [];
  let currentStart = new Date(birthDate);
  
  // Calculate first partial dasha
  let currentPlanetIdx = startingPlanetIdx;
  let currentEnd = new Date(currentStart.getTime() + firstDashaYears * 365.25 * 24 * 60 * 60 * 1000);
  
  periods.push({
    planet: dashaOrder[currentPlanetIdx],
    start: new Date(currentStart),
    end: new Date(currentEnd),
    durationYears: firstDashaYears
  });
  
  // Calculate subsequent dashas for at least 120 years
  currentStart = new Date(currentEnd);
  for (let i = 1; i < 15; i++) { // 15 is enough to cover 120+ years
    currentPlanetIdx = (currentPlanetIdx + 1) % 9;
    const years = dashaYears[currentPlanetIdx];
    currentEnd = new Date(currentStart.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
    
    periods.push({
      planet: dashaOrder[currentPlanetIdx],
      start: new Date(currentStart),
      end: new Date(currentEnd),
      durationYears: years
    });
    
    currentStart = new Date(currentEnd);
    if (currentStart.getTime() > birthDate.getTime() + 120 * 365.25 * 24 * 60 * 60 * 1000) break;
  }
  
  return periods;
}
