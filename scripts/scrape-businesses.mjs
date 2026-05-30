/**
 * Scrape pet-service businesses from Google Maps (via Apify) and import them
 * into the Firestore `businesses` collection.
 *
 * Usage:
 *   1. Put your token in a gitignored .env at repo root:  APIFY_TOKEN=apify_api_xxx
 *      (optionally FB_EMAIL / FB_PASSWORD of an admin user if Firestore rules
 *       require auth to write to `businesses`).
 *   2. Dry run (default — scrapes + dedupes but writes nothing):
 *        node scripts/scrape-businesses.mjs
 *   3. Real import:
 *        node scripts/scrape-businesses.mjs --write
 *
 * Optional flags:
 *   --type=vet,petshop      only scrape these type keys (default: all)
 *   --cities="Tel Aviv"     comma-separated city override
 *   --max=50                max places per (type x city) search
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, doc, setDoc, Timestamp,
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------- tiny .env loader (avoids adding a dependency) ----------
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* no .env, rely on process.env */ }
}
loadEnv();

// ---------- args ----------
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const getArg = (k) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : undefined;
};
const MAX_PER_SEARCH = Number(getArg('max') || 40);

// ---------- Firebase (same public config as src/lib/firebase/client.ts) ----------
const firebaseConfig = {
  apiKey: 'AIzaSyDM3nU5ifIk5wF3kcdToVWpjDD6U5VP5Jk',
  authDomain: 'facepet-48b13.firebaseapp.com',
  projectId: 'facepet-48b13',
  storageBucket: 'facepet-48b13.firebasestorage.app',
  messagingSenderId: '1055059508691',
  appId: '1:1055059508691:web:f530c111ec812d4e9f4326',
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------- business types -> Hebrew tag + Google Maps search keywords ----------
// Tags MUST match src/lib/constants/hebrew-service-tags.ts so the map filters work.
const TYPES = {
  vet: {
    tag: 'מרפאה וטרינרית',
    searches: ['וטרינר', 'מרפאה וטרינרית'],
  },
  petshop: {
    tag: 'חנות לציוד ומזון לבעלי חיים',
    searches: ['חנות חיות', 'חנות לבעלי חיים'],
  },
  groomer: {
    tag: 'מספרת כלבים וחתולים',
    searches: ['מספרת כלבים', 'טיפוח כלבים'],
  },
  boarding: {
    tag: 'פנסיון כלבים/חתולים',
    searches: ['פנסיון כלבים'],
  },
  training: {
    tag: 'אילוף',
    searches: ['אילוף כלבים'],
  },
  daycare: {
    tag: 'מעון יום לכלב',
    searches: ['מעון יום לכלבים'],
  },
  walking: {
    tag: 'שירות טיולים יומי',
    searches: ['הולכת כלבים'],
  },
};

const CITIES = [
  'Tel Aviv', 'Jerusalem', 'Haifa', 'Rishon LeZion', 'Petah Tikva',
  'Ashdod', 'Netanya', "Be'er Sheva", 'Holon', 'Bnei Brak',
  'Ramat Gan', 'Ashkelon', 'Rehovot', 'Bat Yam', 'Herzliya',
  'Kfar Saba', 'Hadera', 'Modiin', 'Nazareth', "Ra'anana",
];

const typeFilter = getArg('type')?.split(',').map((s) => s.trim());
const cityFilter = getArg('cities')?.split(',').map((s) => s.trim());
const activeTypes = Object.entries(TYPES).filter(([k]) => !typeFilter || typeFilter.includes(k));
const activeCities = cityFilter?.length ? cityFilter : CITIES;

// ---------- Apify Google Maps Scraper ----------
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ACTOR = 'compass~crawler-google-places';

async function scrapeBatch(searchStrings, city) {
  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const input = {
    searchStringsArray: searchStrings,
    locationQuery: /israel/i.test(city) ? 'Israel' : `${city}, Israel`,
    maxCrawledPlacesPerSearch: MAX_PER_SEARCH,
    language: 'iw',
    skipClosedPlaces: true,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`Apify ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// ---------- dedupe helpers ----------
const norm = (s) => (s || '').toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
const keyOf = (name, lat, lng) =>
  `${norm(name)}@${(lat ?? 0).toFixed(4)},${(lng ?? 0).toFixed(4)}`;

function placeToBusiness(item, tag) {
  const lat = item.location?.lat ?? item.latitude;
  const lng = item.location?.lng ?? item.longitude;
  const now = Timestamp.now();
  return {
    name: item.title || item.name || '',
    description: item.categoryName || item.description || '',
    imageUrl: item.imageUrl || '',
    contactInfo: {
      email: '',
      phone: item.phone || item.phoneUnformatted || '',
      address: item.address || '',
      coordinates: lat != null && lng != null ? { lat, lng } : undefined,
    },
    coordinates: lat != null && lng != null ? { lat, lng } : undefined,
    tags: [tag],
    filterIds: [],
    rating: item.totalScore || 0,
    website: item.website || '',
    isActive: true,
    createdBy: 'apify-import',
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  if (!APIFY_TOKEN) {
    console.error('❌ APIFY_TOKEN missing. Add it to .env (APIFY_TOKEN=apify_api_...).');
    process.exit(1);
  }

  // optional admin sign-in so client-SDK writes pass security rules
  if (process.env.FB_EMAIL && process.env.FB_PASSWORD) {
    try {
      await signInWithEmailAndPassword(getAuth(app), process.env.FB_EMAIL, process.env.FB_PASSWORD);
      console.log('🔑 Signed in as', process.env.FB_EMAIL);
    } catch (e) {
      console.warn('⚠️  Sign-in failed, continuing unauthenticated:', e.message);
    }
  }

  // load existing businesses for dedupe
  console.log('📥 Loading existing businesses for dedupe...');
  const snap = await getDocs(collection(db, 'businesses'));
  const existing = new Set();
  snap.forEach((d) => {
    const x = d.data();
    const lat = x.coordinates?.lat ?? x.contactInfo?.coordinates?.lat;
    const lng = x.coordinates?.lng ?? x.contactInfo?.coordinates?.lng;
    existing.add(keyOf(x.name, lat, lng));
    existing.add(norm(x.name)); // also dedupe by name alone
  });
  console.log(`   ${snap.size} existing businesses loaded.`);

  const toAdd = [];
  const seenThisRun = new Set();

  for (const [typeKey, { tag, searches }] of activeTypes) {
    for (const city of activeCities) {
      process.stdout.write(`🔎 ${typeKey} @ ${city} ... `);
      let items = [];
      try {
        items = await scrapeBatch(searches, city);
      } catch (e) {
        console.log(`error: ${e.message}`);
        continue;
      }
      let added = 0;
      for (const item of items) {
        const b = placeToBusiness(item, tag);
        if (!b.name || !b.coordinates) continue;
        const k = keyOf(b.name, b.coordinates.lat, b.coordinates.lng);
        if (existing.has(k) || existing.has(norm(b.name)) || seenThisRun.has(k)) continue;
        seenThisRun.add(k);
        toAdd.push(b);
        added++;
      }
      console.log(`${items.length} found, ${added} new`);
    }
  }

  console.log(`\n📊 Total new businesses to import: ${toAdd.length}`);

  if (!WRITE) {
    console.log('🟡 DRY RUN — nothing written. Re-run with --write to import.');
    console.log('   Sample:', JSON.stringify(toAdd.slice(0, 3), null, 2));
    process.exit(0);
  }

  console.log('✍️  Writing to Firestore...');
  let ok = 0;
  for (const b of toAdd) {
    try {
      await setDoc(doc(collection(db, 'businesses')), b);
      ok++;
    } catch (e) {
      console.warn(`   failed "${b.name}": ${e.message}`);
    }
  }
  console.log(`✅ Imported ${ok}/${toAdd.length} businesses.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
