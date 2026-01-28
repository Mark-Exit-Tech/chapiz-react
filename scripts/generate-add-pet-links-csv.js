#!/usr/bin/env node
/**
 * Generates a CSV file with 1000 tag links for writing into NFC tags.
 * Columns: Tag found link (scan → "tag found" page), Pet link (view pet profile).
 * Open the output CSV in Excel (or any spreadsheet app).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COUNT = 1000;
const BASE_URL = process.env.BASE_URL || 'https://tag.chapiz.co.il';
const LOCALE = process.env.LOCALE || 'he'; // he or en
const OUT_DIR = path.join(__dirname, '..');
const OUT_FILE = path.join(OUT_DIR, 'add-pet-links-1000.csv');

const rows = [];
rows.push('#,Tag ID,Pet link');

for (let i = 1; i <= COUNT; i++) {
  const tagId = `tag-${String(i).padStart(4, '0')}`;
  const petLink = `${BASE_URL}/${LOCALE}/pet/${tagId}`;
  rows.push(`${i},${tagId},"${petLink}"`);
}

const csv = rows.join('\n');
fs.writeFileSync(OUT_FILE, csv, 'utf8');
console.log(`Written ${COUNT} rows to ${OUT_FILE}`);
console.log(`Base URL: ${BASE_URL}, Locale: ${LOCALE}`);
console.log('Pet link: Shows TagFoundPage if pet not registered, PetProfilePage if registered.');
