export interface ProductPrice {
  name: string;
  price: number;
  category: string;
}

export const priceList: ProductPrice[] = [
  // Amina
  { name: "AMINA 1 - 7.4kW (nincs kilógó kábel)", price: 248000, category: "töltő" },
  { name: "Amina S 13kW 20A", price: 253000, category: "töltő" },
  { name: "Amina S 22kW 32A", price: 295000, category: "töltő" },
  { name: "Amina C 22kW", price: 378000, category: "töltő" },
  { name: "Amina Type2 20A 6m", price: 54000, category: "kábel" },
  { name: "Amina Type2 20A 7,5m", price: 70000, category: "kábel" },
  { name: "Amina Type2 32A 6m", price: 107000, category: "kábel" },
  
  // Enegic mérők
  { name: "Enegic Powerlink 3x16 evMérő", price: 139000, category: "mérő" },
  { name: "Enegic Powerlink 4x16 evMérő", price: 149000, category: "mérő" },
  { name: "Enegic Powerlink P1 evMérő", price: 119000, category: "mérő" },
  
  // Easee
  { name: "Easee Charge Up 22kW", price: 359000, category: "töltő" },
  { name: "Easee Charge Core 22kW", price: 412000, category: "töltő" },
  { name: "Easee Charge Max 22kW", price: 487000, category: "töltő" },
  { name: "Easee Charge Pro 22kW", price: 609000, category: "töltő" },
  { name: "Easee Front Cover", price: 18000, category: "kiegészítő" },
  { name: "Easee Equalizer", price: 57000, category: "mérő" },
  { name: "Easee Equalizer P1", price: 57000, category: "mérő" },
  { name: "Easee Equalizer Solar", price: 157000, category: "mérő" },
  { name: "Easee U-Hook Prémium", price: 50000, category: "kiegészítő" },
  { name: "Easee U-Hook Standard", price: 24000, category: "kiegészítő" },
  { name: "Easee RFID Tag", price: 3000, category: "kiegészítő" },
  { name: "Easee AC Type2 4m 32A", price: 123000, category: "kábel" },
  { name: "Easee AC Type 2 Cable 7,5m 32A", price: 167000, category: "kábel" },
  { name: "Easee S-Line Base 1-Way", price: 144000, category: "kiegészítő" },
  { name: "Easee S-Line Base 2-Way", price: 168000, category: "kiegészítő" },
  { name: "Easee Mounting Plate", price: 43000, category: "kiegészítő" },
  { name: "Easee Socket Caps", price: 5000, category: "kiegészítő" },
  
  // Zaptec
  { name: "Zaptec Go 22kW", price: 353000, category: "töltő" },
  { name: "Zaptec Solar MID", price: 505000, category: "töltő" },
  { name: "Zaptec Pro MID", price: 589000, category: "töltő" },
  { name: "Zaptec Front Cover", price: 19000, category: "kiegészítő" },
  { name: "Zaptec Backplate Pro", price: 51000, category: "kiegészítő" },
  { name: "Zaptec Charging cable T2-T1", price: 112000, category: "kábel" },
  { name: "Zaptec Charging cable T2-T2 (5m)", price: 133000, category: "kábel" },
  { name: "Zaptec Charging cable T2-T2 (7m)", price: 126000, category: "kábel" },
  { name: "Zaptec Sense", price: 210000, category: "mérő" },
  { name: "Zaptec Chill", price: 16000, category: "kiegészítő" },
  { name: "Zaptec Cliff", price: 41000, category: "kiegészítő" },
  { name: "Zaptec Sense HAN", price: 48000, category: "mérő" },
  { name: "Zaptec Sense Gen", price: 48000, category: "mérő" },
  { name: "Zaptec Single Column", price: 140000, category: "kiegészítő" },
  { name: "Zaptec Twin Column", price: 157000, category: "kiegészítő" },
  { name: "Zaptec RFID-TAG", price: 5000, category: "kiegészítő" },
  
  // Charge Amps
  { name: "Charge Amps Luna 22kW", price: 365000, category: "töltő" },
  { name: "Charge Amps Dawn 22kW", price: 503000, category: "töltő" },
  { name: "Charge Amps Halo 11kW", price: 333000, category: "töltő" },
  { name: "Charge Amps Aura 2x22kW", price: 1306000, category: "töltő" },
  { name: "Charge Amps Aura 2x22kW 4G", price: 1502000, category: "töltő" },
  { name: "Charge Amps Amp Guard - 63A", price: 132000, category: "mérő" },
  { name: "Charge Amps Luna Előlap", price: 38000, category: "kiegészítő" },
  { name: "Charge Amps RFID Tag", price: 4000, category: "kiegészítő" },
  
  // S-Line kábelek
  { name: "S-Line Type2 32A 22kW 3M", price: 64000, category: "kábel" },
  { name: "S-Line Type2 16A 11kW 3M", price: 66000, category: "kábel" },
  { name: "S-Line Type2 32A 22kW 5M", price: 80000, category: "kábel" },
  { name: "S-Line Type2 32A 22kW 7M", price: 94000, category: "kábel" },
  { name: "S-Line Type2 32A 22kW 10M", price: 113000, category: "kábel" },
  { name: "S-Line Type2 16A 11kW 5M", price: 66000, category: "kábel" },
  { name: "S-Line Type2 16A 11kW 7M", price: 75000, category: "kábel" },
  { name: "S-Line Type2 16A 11kW 10M", price: 90000, category: "kábel" },
  { name: "S-Line Type2 32A 22kW 15M", price: 159000, category: "kábel" },
  { name: "S-Line Type2 32A 22kW 20M", price: 182000, category: "kábel" },
  { name: "S-Line Type2 16A 11kW 15M", price: 159000, category: "kábel" },
  { name: "S-Line Type1 16A 3,7kW 5M", price: 79000, category: "kábel" },
  { name: "S-Line Type1 16A 3,7kW 7M", price: 62000, category: "kábel" },
  { name: "S-Line Type1 16A 3,7kW 10M", price: 70000, category: "kábel" },
  { name: "S-Line Cable Holder Black", price: 9000, category: "kiegészítő" },
  
  // Egyéb kábelek
  { name: "Töltőkábel Táska Fekete", price: 10000, category: "kiegészítő" },
  { name: "DEFA eConnect Red 32A 22kW 5M", price: 137000, category: "kábel" },
  { name: "DEFA eConnect Red 32A 22kW 7,5M", price: 158000, category: "kábel" },
  { name: "DEFA eConnect 20A Red 13.8kW 5M", price: 114000, category: "kábel" },
  { name: "DEFA eConnect Red 20A 13.8kW 7,5M", price: 122000, category: "kábel" },
  { name: "Metron Type2 20A 13,8 kW 5M Tesla Vezérléssel", price: 139000, category: "kábel" },
  { name: "Hordozható Schuko-Type2 5m 6A-16A Töltőkábel Kijelzővel", price: 136000, category: "kábel" },
  { name: "DEFA eConnect Docking Type 2", price: 23000, category: "kiegészítő" },
  
  // Mérők
  { name: "Perific Powerlink DIN - Amina", price: 176000, category: "mérő" },
  { name: "Perific Max 5010+310 DIN License EVI Current Sensor 16", price: 182000, category: "mérő" },
  { name: "Perific Max 5010+310 DIN License EVI Current Sensor 36", price: 198000, category: "mérő" },
  { name: "Perific Max 5010+310 DIN License EVI Current Sensor 100", price: 238000, category: "mérő" },
  { name: "Zaptec Sense GEN CT Clamp Csomag", price: 127000, category: "mérő" },
  { name: "Easee Equalizer Amp Csomag", price: 143000, category: "mérő" },
  
  // Kiegészítők
  { name: "Wall mount for cable Type 2, straight, black", price: 6000, category: "kiegészítő" },
  { name: "Wall mount for cable Type 2, with angle, black", price: 8000, category: "kiegészítő" },
  { name: "Wall mount with cable holder Type 2 - black", price: 14000, category: "kiegészítő" },
  { name: "RFID Tag", price: 2000, category: "kiegészítő" },
];

// Kiegészítők árai az EmailGenerator számára
export const additionalItemPrices: Record<string, number> = {
  "RFID Tag": 3000,
  "Terhelésmenedzsment rendszer": 130000,
  "Szabadon álló oszlop": 140000,
  "Fali hátlap kábeltartóval": 50000,
  "Töltőkábel (3m / 5m / 7m / 10m)": 80000, // átlag ár
  "Kábel akasztó": 9000,
  "Type 2-es fejtartó": 14000,
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
