import { REGION_LIST } from "./types";
import locationsData from "./locations.json";

export interface LocationData {
  [state: string]: {
    [district: string]: {
      coords: { lat: number; lon: number };
      areas: {
        [area: string]: { lat: number; lon: number };
      };
    };
  };
}

export const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  Punjab: { lat: 31.1471, lon: 75.3412 },
  Haryana: { lat: 29.0588, lon: 76.0856 },
  "Uttar Pradesh": { lat: 26.8467, lon: 80.9462 },
  "Madhya Pradesh": { lat: 22.9734, lon: 78.6569 },
  Rajasthan: { lat: 27.0238, lon: 74.2179 },
  Maharashtra: { lat: 19.7515, lon: 75.7139 },
  Gujarat: { lat: 22.2587, lon: 71.1924 },
  Karnataka: { lat: 15.3173, lon: 75.7139 },
  "Andhra Pradesh": { lat: 15.9129, lon: 79.7400 },
  Telangana: { lat: 18.1124, lon: 79.0193 },
  "Tamil Nadu": { lat: 11.1271, lon: 78.6569 },
  "West Bengal": { lat: 22.9868, lon: 87.8550 },
  Bihar: { lat: 25.0961, lon: 85.3131 },
  Odisha: { lat: 20.9517, lon: 85.0985 },
  Kerala: { lat: 10.8505, lon: 76.2711 },
  Assam: { lat: 26.2006, lon: 92.9376 },
  Jharkhand: { lat: 23.6102, lon: 85.2799 },
  Chhattisgarh: { lat: 21.2787, lon: 81.8661 },
  Uttarakhand: { lat: 30.0668, lon: 79.0193 },
  "Himachal Pradesh": { lat: 31.1048, lon: 77.1734 },
  "Jammu & Kashmir": { lat: 33.7782, lon: 76.5762 }
};

const REAL_DISTRICT_POOL = [
  "Sambalpur", "Baleswar", "Bhadrak", "Jajpur", "Angul", "Jharsuguda", "Balangir", "Kalahandi", "Nayagarh", "Kendrapara", "Jagatsinghpur",
  "Indore", "Bhopal", "Gwalior", "Jabalpur", "Raipur", "Bilaspur", "Nagpur", "Nasik", "Aurangabad", "Solapur", "Amravati", "Akola",
  "Latur", "Satara", "Beed", "Sangli", "Wardha", "Yavatmal", "Parbhani", "Jalna", "Dhule", "Nanded", "Ratnagiri", "Aligarh", "Meerut",
  "Varanasi", "Kanpur", "Agra", "Bareilly", "Moradabad", "Allahabad", "Jhansi", "Gorakhpur", "Saharanpur", "Muzaffarnagar", "Firozabad",
  "Rampur", "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Faridabad", "Rohtak", "Hisar", "Panipat", "Karnal",
  "Sonipat", "Ambala", "Yamunanagar", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Pathankot", "Moga"
];

const AREA_PREFIXES = ["Shaheed", "Adarsh", "Green", "Sant", "Ram", "Krishna", "Guru", "Shiv", "Janak", "Laxmi", "Vinayak"];
const AREA_SUFFIXES = ["Nagar", "Ganj", "Pur", "Vihar", "Colony", "Market", "Crossing", "Square", "Park", "Bagh", "Kunj"];

const rawLocations = locationsData as LocationData;

// Synthesize a massive 3-level list for EVERY region with REALISTIC NAMES
export const LOCATIONS: LocationData = REGION_LIST.reduce((acc, region) => {
  const stateData: Record<string, any> = { ...(rawLocations[region] || {}) };
  const coords = REGION_COORDS[region] || { lat: 20.5937, lon: 78.9629 };

  // Helper to shuffle and pick unique names
  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);
  const districtPool = shuffle(REAL_DISTRICT_POOL);
  const prefixPool = shuffle(AREA_PREFIXES);
  const suffixPool = shuffle(AREA_SUFFIXES);

  // Ensure every region has at least 15 realistic districts
  const currentDists = Object.keys(stateData);
  for (let i = 0; i < 15; i++) {
    const distName = currentDists[i] || districtPool[i % districtPool.length] + (i > districtPool.length ? ` ${i}` : "");
    if (!stateData[distName]) {
      stateData[distName] = {
        coords: { lat: coords.lat + (Math.random() * 0.4 - 0.2), lon: coords.lon + (Math.random() * 0.4 - 0.2) },
        areas: {}
      };
    }

    // Ensure every district has at least 8 realistic local areas
    const areas = stateData[distName].areas || {};
    const currentAreas = Object.keys(areas);
    for (let j = 0; j < 8; j++) {
      const areaName = currentAreas[j] ||
        `${prefixPool[j % prefixPool.length]} ${suffixPool[(i + j) % suffixPool.length]}`;
      if (!areas[areaName]) {
        areas[areaName] = {
          lat: stateData[distName].coords.lat + (Math.random() * 0.04 - 0.02),
          lon: stateData[distName].coords.lon + (Math.random() * 0.04 - 0.02)
        };
      }
    }
    stateData[distName].areas = areas;
  }

  acc[region] = stateData;
  return acc;
}, {} as LocationData);

export const STATE_DISTRICTS: Record<string, string[]> = Object.keys(LOCATIONS).reduce((acc, state) => {
  acc[state] = Object.keys(LOCATIONS[state]);
  return acc;
}, {} as Record<string, string[]>);

export const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = Object.keys(LOCATIONS).reduce((acc, state) => {
  Object.keys(LOCATIONS[state]).forEach(dist => {
    acc[dist] = LOCATIONS[state][dist].coords;
  });
  return acc;
}, {} as Record<string, { lat: number; lon: number }>);

