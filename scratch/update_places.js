const fs = require('fs');
const path = require('path');

const placesFilePath = path.join(__dirname, '../data/places.json');
const places = JSON.parse(fs.readFileSync(placesFilePath, 'utf8'));

const coordsMap = {
  "colosseum": { lat: 41.8902, lng: 12.4922 },
  "vatican": { lat: 41.9029, lng: 12.4534 },
  "pantheon": { lat: 41.8986, lng: 12.4769 },
  "trevi-fountain": { lat: 41.9009, lng: 12.4833 },
  "spanish-steps": { lat: 41.9060, lng: 12.4828 },
  "altare-della-patria": { lat: 41.8946, lng: 12.4828 },
  "villa-borghese": { lat: 41.9142, lng: 12.4921 },
  "rome-rose-garden": { lat: 41.8833, lng: 12.4828 },
  "parco-di-caracalla": { lat: 41.8792, lng: 12.4925 },
  "swiss-institute": { lat: 41.9080, lng: 12.4870 },
  "lovers-fountain": { lat: 41.9010, lng: 12.4835 },
  "monti": { lat: 41.8950, lng: 12.4910 },
  "tiber-river": { lat: 41.8890, lng: 12.4720 },
  "the-oddity-patch-bar": { lat: 41.8955, lng: 12.4918 },
  "rega-bijoux": { lat: 41.9002, lng: 12.4715 },
  "paolina-roma": { lat: 41.8980, lng: 12.4740 },
  "pifebo-vintage": { lat: 41.8958, lng: 12.4920 },
  "via-del-corso-venezia": { lat: 41.8970, lng: 12.4810 },
  "mercato-di-porta-portese": { lat: 41.8820, lng: 12.4720 },
  "campo-de-fiori-market": { lat: 41.8956, lng: 12.4722 },
  "porta-di-roma-euroma2": { lat: 41.9700, lng: 12.5400 },
  "the-one-boutique-spa": { lat: 41.9015, lng: 12.4840 },
  "gigi-rigolatto": { lat: 41.8982, lng: 12.4775 },
  "mimi-e-coco": { lat: 41.8981, lng: 12.4705 },
  "da-enzo-al-29": { lat: 41.8885, lng: 12.4776 },
  "fiaschetteria-beltramme": { lat: 41.9052, lng: 12.4808 },
  "la-tavernetta-48": { lat: 41.8975, lng: 12.4760 },
  "santi-40": { lat: 41.8895, lng: 12.4710 },
  "deroma-farine-romane": { lat: 41.9042, lng: 12.4805 },
  "interno-92": { lat: 41.9085, lng: 12.4510 },
  "felice-a-testaccio": { lat: 41.8785, lng: 12.4782 },
  "da-pancrazio-dal-1922": { lat: 41.8953, lng: 12.4731 },
  "caligola": { lat: 41.8860, lng: 12.4700 },
  "baccano": { lat: 41.9007, lng: 12.4825 },
  "la-piccola-cuccagna": { lat: 41.8980, lng: 12.4733 },
  "antico-forno-roscioli": { lat: 41.8951, lng: 12.4738 },
  "forno-campo-de-fiori": { lat: 41.8957, lng: 12.4725 },
  "all-antico-vinaio": { lat: 41.8998, lng: 12.4765 },
  "saporizzo": { lat: 41.8962, lng: 12.4960 },
  "panino-incognito": { lat: 41.8970, lng: 12.4695 },
  "magnifico-food-store": { lat: 41.8960, lng: 12.4715 },
  "i-pizzicaroli": { lat: 41.8983, lng: 12.4708 },
  "lantica-pizzeria-di-trevi": { lat: 41.9012, lng: 12.4842 },
  "il-primo-bacio": { lat: 41.9020, lng: 12.4838 },
  "pizza-trilussa": { lat: 41.8898, lng: 12.4708 },
  "pastaciutta": { lat: 41.9062, lng: 12.4578 },
  "amerina": { lat: 41.9000, lng: 12.4660 },
  "giselda": { lat: 41.8880, lng: 12.4740 },
  "regoli-pasticceria": { lat: 41.8955, lng: 12.5020 },
  "la-menagere-roma": { lat: 41.9030, lng: 12.4790 },
  "two-sizes": { lat: 41.8980, lng: 12.4702 },
  "pompi": { lat: 41.9055, lng: 12.4800 },
  "venchi": { lat: 41.9018, lng: 12.4795 },
  "la-romana": { lat: 41.9070, lng: 12.4680 },
  "limone": { lat: 41.8995, lng: 12.4808 },
  "slow-specialty-coffee": { lat: 41.8942, lng: 12.4928 },
  "said-dal-1923": { lat: 41.8972, lng: 12.5150 },
  "le-levain": { lat: 41.8892, lng: 12.4700 },
  "lantico-forno-trevi": { lat: 41.9008, lng: 12.4820 },
  "ginger-sapori-e-salute": { lat: 41.9048, lng: 12.4812 },
  "panfuwa": { lat: 41.8968, lng: 12.4690 },
  "the-coffee": { lat: 41.8962, lng: 12.4718 },
  "belvi": { lat: 41.8945, lng: 12.4750 },
  "il-bar-della-musa": { lat: 41.9135, lng: 12.4915 },
  "drink-kong": { lat: 41.8950, lng: 12.4975 },
  "loratorio-trastevere": { lat: 41.8875, lng: 12.4720 },
  "blackmarket-hall": { lat: 41.8960, lng: 12.4930 },
  "divinity-rooftop": { lat: 41.8983, lng: 12.4770 },
  "hotel-fontana-rooftop": { lat: 41.9008, lng: 12.4831 },
  "flor-de-maga": { lat: 41.8965, lng: 12.4710 },
  "chiosco-vittorio": { lat: 41.8950, lng: 12.5050 },
  "langolo-trieste": { lat: 41.9180, lng: 12.5080 },
  "daruma": { lat: 41.8960, lng: 12.4825 }
};

let updatedCount = 0;
places.forEach(item => {
  if (coordsMap[item.id]) {
    item.coordinates = coordsMap[item.id];
    updatedCount++;
  }
});

fs.writeFileSync(placesFilePath, JSON.stringify(places, null, 2), 'utf8');
console.log(`Successfully updated coordinates for ${updatedCount} / ${places.length} places in places.json.`);
