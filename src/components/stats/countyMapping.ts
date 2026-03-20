import { hungarianCities } from "@/data/hungarianCitiesComplete";

// Zip prefix → county mapping (Hungarian postal code system)
const zipToCounty: Record<string, string> = {
  "10": "Budapest", "11": "Budapest", "12": "Budapest", "13": "Budapest",
  "14": "Budapest", "15": "Budapest", "16": "Budapest", "17": "Budapest",
  "18": "Budapest", "19": "Budapest",
  "20": "Pest", "21": "Pest", "22": "Pest", "23": "Pest", "24": "Pest",
  "25": "Pest", "26": "Pest", "27": "Pest", "28": "Pest", "29": "Pest",
  "30": "Heves", "31": "Heves", "32": "Heves", "33": "Heves",
  "34": "Nógrád", "35": "Borsod-Abaúj-Zemplén", "36": "Borsod-Abaúj-Zemplén",
  "37": "Borsod-Abaúj-Zemplén", "38": "Borsod-Abaúj-Zemplén",
  "39": "Borsod-Abaúj-Zemplén",
  "40": "Hajdú-Bihar", "41": "Hajdú-Bihar", "42": "Hajdú-Bihar",
  "43": "Szabolcs-Szatmár-Bereg", "44": "Szabolcs-Szatmár-Bereg",
  "45": "Szabolcs-Szatmár-Bereg", "46": "Jász-Nagykun-Szolnok",
  "47": "Békés",
  "48": "Szabolcs-Szatmár-Bereg", "49": "Szabolcs-Szatmár-Bereg",
  "50": "Jász-Nagykun-Szolnok", "51": "Jász-Nagykun-Szolnok",
  "52": "Jász-Nagykun-Szolnok", "53": "Békés", "54": "Békés",
  "55": "Békés", "56": "Békés",
  "57": "Csongrád-Csanád",
  "60": "Bács-Kiskun", "61": "Bács-Kiskun", "62": "Csongrád-Csanád",
  "63": "Csongrád-Csanád", "64": "Bács-Kiskun", "65": "Bács-Kiskun",
  "66": "Csongrád-Csanád", "67": "Bács-Kiskun", "68": "Bács-Kiskun",
  "69": "Bács-Kiskun",
  "70": "Baranya", "71": "Baranya", "72": "Baranya", "73": "Baranya",
  "74": "Somogy", "75": "Tolna", "76": "Tolna",
  "77": "Somogy", "78": "Somogy",
  "80": "Fejér", "81": "Fejér", "82": "Veszprém", "83": "Veszprém",
  "84": "Veszprém", "85": "Zala", "86": "Zala", "87": "Zala",
  "88": "Veszprém", "89": "Komárom-Esztergom",
  "90": "Győr-Moson-Sopron", "91": "Győr-Moson-Sopron",
  "92": "Győr-Moson-Sopron", "93": "Győr-Moson-Sopron",
  "94": "Győr-Moson-Sopron", "95": "Komárom-Esztergom",
  "96": "Vas", "97": "Vas", "98": "Vas", "99": "Vas",
};

// Build city → county lookup from zip data
const cityToCountyMap = new Map<string, string>();

for (const [zip, city] of Object.entries(hungarianCities)) {
  const prefix = zip.substring(0, 2);
  const county = zipToCounty[prefix];
  if (county && !cityToCountyMap.has(city.toLowerCase())) {
    cityToCountyMap.set(city.toLowerCase(), county);
  }
}

export function getCountyByCity(location: string): string {
  if (!location) return "Ismeretlen";
  const lower = location.toLowerCase().trim();
  if (lower.startsWith("budapest")) return "Budapest";
  return cityToCountyMap.get(lower) || "Ismeretlen";
}

export function isBudapestOrPest(location: string): boolean {
  const county = getCountyByCity(location);
  return county === "Budapest" || county === "Pest";
}
