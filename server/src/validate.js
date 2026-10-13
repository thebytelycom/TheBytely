import { HttpError } from './errors.js';
import {
  BRIEF_FIELDS, BUSINESS_TYPES, STYLE_NAMES, describeUnsupportedKey,
} from './policy.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function cleanMultiline(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r/g, '')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

function rejectUnknownKeys(obj, allowed) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      throw new HttpError(400, 'unsupported_option', describeUnsupportedKey(key));
    }
  }
}

export function validateBrief(raw) {
  if (!isObject(raw)) throw new HttpError(400, 'invalid_brief', 'Send your business details as an object called "brief".');
  rejectUnknownKeys(raw, BRIEF_FIELDS);

  const name = clean(raw.name, 60);
  if (!name) throw new HttpError(400, 'invalid_brief', 'Add your business name.');
  if (!BUSINESS_TYPES.includes(raw.type)) {
    throw new HttpError(400, 'invalid_brief', `Business type must be one of: ${BUSINESS_TYPES.join(', ')}.`);
  }
  if (!STYLE_NAMES.includes(raw.style)) {
    throw new HttpError(400, 'invalid_brief', `Visual style must be one of: ${STYLE_NAMES.join(', ')}.`);
  }
  return {
    name,
    type: raw.type,
    style: raw.style,
    location: clean(raw.location, 40),
    products: clean(raw.products, 240),
  };
}
/* ---------- Product photos ---------- */
export const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 110 * 1024;
const MAX_TOTAL_BYTES = 600 * 1024;
const IMG_RE = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

function magicOk(kind, buf) {
  if (kind === 'jpeg') return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (kind === 'png') return buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (kind === 'webp') return buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

export function validateImages(raw) {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new HttpError(400, 'invalid_images', 'Photos must be sent as a list.');
  if (raw.length > MAX_IMAGES) throw new HttpError(400, 'invalid_images', `You can add up to ${MAX_IMAGES} photos.`);
  let total = 0;
  return raw.map((item, i) => {
    const n = i + 1;
    if (!isObject(item)) throw new HttpError(400, 'invalid_images', `Photo ${n} is not valid.`);
    for (const key of Object.keys(item)) {
      if (key !== 'src' && key !== 'name') {
        throw new HttpError(400, 'invalid_images', `"${key}" is not allowed on a photo.`);
      }
    }
    const src = item.src;
    if (typeof src !== 'string' || src.length > 160000) {
      throw new HttpError(400, 'invalid_images', `Photo ${n} is too large. Try a smaller photo.`);
    }
    const m = IMG_RE.exec(src);
    if (!m) throw new HttpError(400, 'invalid_images', `Photo ${n} must be a JPG, PNG or WebP image.`);
    const buf = Buffer.from(m[2], 'base64');
    if (!magicOk(m[1], buf)) throw new HttpError(400, 'invalid_images', `Photo ${n} is not a valid ${m[1].toUpperCase()} image.`);
    if (buf.length > MAX_IMAGE_BYTES) throw new HttpError(400, 'invalid_images', `Photo ${n} is too large. Try a smaller photo.`);
    total += buf.length;
    if (total > MAX_TOTAL_BYTES) {
      throw new HttpError(400, 'invalid_images', 'Your photos are too large together. Remove one or use smaller photos.');
    }
    return { src, name: clean(item.name, 40) };
  });
}
export function validateTheme(raw) {
  const t = isObject(raw) ? raw : {};
  return {
    style: STYLE_NAMES.includes(t.style) ? t.style : 'Minimal',
    accent: /^#[0-9a-fA-F]{6}$/.test(t.accent || '') ? t.accent : '#6C4DFF',
  };
}

function need(text, label) {
  if (!text) throw new HttpError(400, 'invalid_content', `${label} cannot be empty.`);
  return text;
}

export function validateContent(raw) {
  if (!isObject(raw) || !isObject(raw.home) || !isObject(raw.about) || !isObject(raw.contact)) {
    throw new HttpError(400, 'invalid_content', 'Website content is incomplete.');
  }
  const hl = raw.home.highlights;
  if (!Array.isArray(hl) || hl.length !== 3) {
    throw new HttpError(400, 'invalid_content', 'The Home page needs exactly 3 highlights.');
  }

  const phone = clean(raw.contact.phone, 20);
  if (phone && !/^[0-9+()\-\s]{6,20}$/.test(phone)) {
    throw new HttpError(400, 'invalid_content', 'Enter a valid phone number, for example +91 98765 43210.');
  }
  const email = clean(raw.contact.email, 80);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new HttpError(400, 'invalid_content', 'Enter a valid email address, like name@example.com.');
  }
  const whatsapp = clean(raw.contact.whatsapp, 20).replace(/\D/g, '');
  if (whatsapp && (whatsapp.length < 8 || whatsapp.length > 15)) {
    throw new HttpError(400, 'invalid_content', 'Enter the WhatsApp number with country code, for example 919876543210.');
  }

  return {
    businessName: need(clean(raw.businessName, 60), 'Business name'),
    home: {
      headline: need(clean(raw.home.headline, 100), 'The headline'),
      intro: need(clean(raw.home.intro, 320), 'The introduction'),
      ctaLabel: need(clean(raw.home.ctaLabel, 28), 'The button text'),
            galleryHeading: clean(raw.home.galleryHeading, 40) || 'Our products',
      highlights: hl.map((h, i) => ({
        title: need(clean(isObject(h) ? h.title : '', 44), `Highlight ${i + 1} title`),
        text: need(clean(isObject(h) ? h.text : '', 160), `Highlight ${i + 1} text`),
      })),
    },
    about: {
      heading: need(clean(raw.about.heading, 80), 'The About heading'),
      body: need(cleanMultiline(raw.about.body, 700), 'The About text'),
    },
    contact: {
      heading: need(clean(raw.contact.heading, 80), 'The Contact heading'),
      text: need(clean(raw.contact.text, 240), 'The Contact text'),
      address: clean(raw.contact.address, 60),
      phone,
      email,
      whatsapp,
    },
        images: validateImages(raw.images),
  };
}
