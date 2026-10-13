import { randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HttpError } from './errors.js';
import { clean, cleanMultiline } from './validate.js';
import { ADDONS, PACKAGES, calcTotals } from './pricing.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = () => process.env.DATA_DIR || path.join(here, '..', 'data');
const file = () => path.join(dataDir(), 'enquiries.jsonl');

export function validateEnquiry(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new HttpError(400, 'invalid_enquiry', 'Send your enquiry details as an object called "enquiry".');
  }
  const name = clean(raw.name, 80);
  if (!name) throw new HttpError(400, 'invalid_enquiry', 'Enter your name so we know who to reply to.');
  const email = clean(raw.email, 120);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new HttpError(400, 'invalid_enquiry', 'Enter a valid email address, like name@example.com.');
  }
  const phone = clean(raw.phone, 20);
  if (phone && !/^[0-9+()\-\s]{6,20}$/.test(phone)) {
    throw new HttpError(400, 'invalid_enquiry', 'Enter a valid phone number or leave it blank.');
  }
  if (!Object.hasOwn(PACKAGES, raw.pkg)) throw new HttpError(400, 'invalid_enquiry', 'Choose a package.');
  const addons = Array.isArray(raw.addons) ? [...new Set(raw.addons)] : [];
  for (const a of addons) {
    if (!Object.hasOwn(ADDONS, a)) throw new HttpError(400, 'invalid_enquiry', 'One of the selected extras is not recognised.');
  }
  const qty = (v) => Math.max(1, Math.min(20, parseInt(v, 10) || 1));
  const enquiry = {
    name, email, phone,
    business: clean(raw.business, 80),
    pkg: raw.pkg,
    addons,
    pages: qty(raw.pages),
    revisions: qty(raw.revisions),
    requirements: cleanMultiline(raw.requirements, 1500),
  };
  const totals = calcTotals(enquiry);
  if (!totals.lines.length) throw new HttpError(400, 'invalid_enquiry', 'Choose a package or at least one extra.');
  return { enquiry, totals };
}

export async function saveEnquiry(payload) {
  const { enquiry, totals } = validateEnquiry(payload && payload.enquiry);
  const record = { id: randomUUID(), receivedAt: new Date().toISOString(), ...enquiry, totals };
  await mkdir(dataDir(), { recursive: true });
  await appendFile(file(), JSON.stringify(record) + '\n', 'utf8');
  return { ok: true, id: record.id, totals };
}

export async function listEnquiries() {
  try {
    const text = await readFile(file(), 'utf8');
    return text.split('\n').filter(Boolean).map((l) => JSON.parse(l)).reverse();
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}
