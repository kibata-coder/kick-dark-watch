// Map common country / national team names to ISO 3166-1 alpha-2 codes
// used by https://flagcdn.com to serve flag images as fallback badges.
const NAME_TO_ISO: Record<string, string> = {
  afghanistan: "af", albania: "al", algeria: "dz", andorra: "ad", angola: "ao",
  argentina: "ar", armenia: "am", australia: "au", austria: "at", azerbaijan: "az",
  bahrain: "bh", bangladesh: "bd", belarus: "by", belgium: "be", benin: "bj",
  bolivia: "bo", "bosnia and herzegovina": "ba", bosnia: "ba", botswana: "bw",
  brazil: "br", bulgaria: "bg", "burkina faso": "bf", burundi: "bi", cambodia: "kh",
  cameroon: "cm", canada: "ca", "cape verde": "cv", "cabo verde": "cv",
  "central african republic": "cf", chad: "td", chile: "cl", china: "cn",
  "china pr": "cn", colombia: "co", comoros: "km", "congo dr": "cd",
  "dr congo": "cd", "democratic republic of the congo": "cd", congo: "cg",
  "costa rica": "cr", "ivory coast": "ci", "cote d'ivoire": "ci", croatia: "hr",
  cuba: "cu", curacao: "cw", "curaçao": "cw", cyprus: "cy",
  "czech republic": "cz", czechia: "cz", denmark: "dk", djibouti: "dj",
  "dominican republic": "do", ecuador: "ec", egypt: "eg", "el salvador": "sv",
  england: "gb-eng", "equatorial guinea": "gq", eritrea: "er", estonia: "ee",
  eswatini: "sz", swaziland: "sz", ethiopia: "et", "faroe islands": "fo",
  fiji: "fj", finland: "fi", france: "fr", gabon: "ga", gambia: "gm",
  georgia: "ge", germany: "de", ghana: "gh", greece: "gr", grenada: "gd",
  guatemala: "gt", guinea: "gn", "guinea-bissau": "gw", guyana: "gy", haiti: "ht",
  honduras: "hn", "hong kong": "hk", hungary: "hu", iceland: "is", india: "in",
  indonesia: "id", iran: "ir", "ir iran": "ir", iraq: "iq", ireland: "ie",
  "republic of ireland": "ie", israel: "il", italy: "it", jamaica: "jm",
  japan: "jp", jordan: "jo", kazakhstan: "kz", kenya: "ke", "north korea": "kp",
  "korea dpr": "kp", "south korea": "kr", "korea republic": "kr", kosovo: "xk",
  kuwait: "kw", kyrgyzstan: "kg", laos: "la", latvia: "lv", lebanon: "lb",
  lesotho: "ls", liberia: "lr", libya: "ly", liechtenstein: "li", lithuania: "lt",
  luxembourg: "lu", madagascar: "mg", malawi: "mw", malaysia: "my", maldives: "mv",
  mali: "ml", malta: "mt", mauritania: "mr", mauritius: "mu", mexico: "mx",
  moldova: "md", monaco: "mc", mongolia: "mn", montenegro: "me", morocco: "ma",
  mozambique: "mz", myanmar: "mm", namibia: "na", nepal: "np", netherlands: "nl",
  holland: "nl", "new zealand": "nz", nicaragua: "ni", niger: "ne", nigeria: "ng",
  "north macedonia": "mk", macedonia: "mk", "northern ireland": "gb-nir",
  norway: "no", oman: "om", pakistan: "pk", palestine: "ps", panama: "pa",
  "papua new guinea": "pg", paraguay: "py", peru: "pe", philippines: "ph",
  poland: "pl", portugal: "pt", qatar: "qa", romania: "ro", russia: "ru",
  rwanda: "rw", "saudi arabia": "sa", scotland: "gb-sct", senegal: "sn",
  serbia: "rs", "sierra leone": "sl", singapore: "sg",
  slovakia: "sk", slovenia: "si", "south africa": "za", "south sudan": "ss",
  spain: "es", "sri lanka": "lk", sudan: "sd", suriname: "sr", sweden: "se",
  switzerland: "ch", syria: "sy", taiwan: "tw", "chinese taipei": "tw",
  tajikistan: "tj", tanzania: "tz", thailand: "th", togo: "tg", "trinidad and tobago": "tt",
  tunisia: "tn", turkey: "tr", türkiye: "tr", turkiye: "tr", turkmenistan: "tm",
  uganda: "ug", ukraine: "ua", "united arab emirates": "ae", uae: "ae",
  "united kingdom": "gb", uk: "gb", "great britain": "gb",
  "united states": "us", "united states of america": "us", usa: "us", "us": "us",
  uruguay: "uy", uzbekistan: "uz", venezuela: "ve", vietnam: "vn", wales: "gb-wls",
  yemen: "ye", zambia: "zm", zimbabwe: "zw",
};

export function countryFlagUrl(name?: string): string | undefined {
  if (!name) return undefined;
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  const iso = NAME_TO_ISO[key];
  if (!iso) return undefined;
  return `https://flagcdn.com/w80/${iso}.png`;
}