#!/usr/bin/env node
/**
 * Generates a CSV file with 3000 links, each with a random 24-symbol ID (alphanumeric).
 * Columns: #, Random ID, Pet link.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COUNT = 3000;
const ID_LENGTH = 24;
const BASE_URL = process.env.BASE_URL || 'https://tag.chapiz.co.il';
const LOCALE = process.env.LOCALE || 'he';
const OUT_DIR = path.join(__dirname, '..');
const OUT_FILE = path.join(OUT_DIR, 'random-links-3000.csv');

// Alphanumeric (0-9, a-z, A-Z) for URL-safe random IDs
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomId() {
  const bytes = crypto.randomBytes(ID_LENGTH);
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += CHARS[bytes[i] % CHARS.length];
  }
  return id;
}

const seen = new Set();
const rows = [];
rows.push('#,Random ID,Pet link');

let attempts = 0;
const maxAttempts = COUNT * 20;

while (rows.length - 1 < COUNT && attempts < maxAttempts) {
  attempts++;
  const id = randomId();
  if (seen.has(id)) continue;
  seen.add(id);
  const index = rows.length;
  const petLink = `${BASE_URL}/${LOCALE}/pet/${id}`;
  rows.push(`${index},${id},"${petLink}"`);
}

if (rows.length - 1 < COUNT) {
  console.error(`Warning: only generated ${rows.length - 1} unique IDs after ${maxAttempts} attempts.`);
}

const csv = rows.join('\n');
fs.writeFileSync(OUT_FILE, csv, 'utf8');
console.log(`Written ${rows.length - 1} rows to ${OUT_FILE}`);
console.log(`Base URL: ${BASE_URL}, Locale: ${LOCALE}`);
console.log(`Each link uses a random ${ID_LENGTH}-symbol alphanumeric ID.`);
