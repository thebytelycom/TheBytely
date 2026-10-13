// What the AI website builder is allowed to make. Everything that decides
// "basic only" lives here, so it is easy to review and change.

export const BUSINESS_TYPES = [
  'Jewellery', 'Fashion', 'Beauty and wellness', 'Restaurant or café',
  'Technology', 'Consulting', 'Education', 'Other business',
];

export const STYLE_NAMES = [
  'Luxury', 'Minimal', 'Bold and modern', 'Warm and friendly', 'Elegant', 'Playful',
];

// The only fields a client may send when creating a website.
export const BRIEF_FIELDS = ['name', 'type', 'location', 'style', 'products'];

export const SCOPE = {
  pages: ['Home', 'About', 'Contact'],
  included: [
    'Up to 3 pages: Home, About and Contact',
    'Mobile-friendly layout',
    'AI-written text for your business',
    'Basic text and colour editing',
    'Phone, email and WhatsApp links on the Contact page',
  ],
  notIncluded: [
    'Parallax effects, animations and 3D',
    'AI chatbot',
    'Online payments, shop or booking',
    'Extra pages, SEO setup or custom features',
  ],
};

const PAID_HINTS = [
  'parallax', 'animation', 'animated', '3d', 'threed', 'chat', 'bot', 'assistant',
  'ecommerce', 'shop', 'store', 'cart', 'payment', 'checkout', 'login', 'signup',
  'account', 'booking', 'blog', 'seo', 'video', 'integration', 'database',
  'premium', 'addon', 'extra', 'pages', 'revision', 'maintenance', 'export',
];

export function describeUnsupportedKey(key) {
  const k = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (PAID_HINTS.some((h) => k.includes(h))) {
    return `"${key}" is part of our paid services. The AI builder only creates basic websites (Home, About and Contact).`;
  }
  return `"${key}" is not a supported field. Allowed fields: ${BRIEF_FIELDS.join(', ')}.`;
}

// Commands that sound like paid services get a clear "paid service" answer.
export const PAID_COMMAND =
  /(premium|parallax|3d|chat|bot|ecommerce|shop|payment|booking|maintenance|export|addon|add_on|animation|seo|extra)/i;

// Words the AI must never put in a basic website's text unless the customer
// used them first.
const BANNED_OUTPUT =
  /\b(chat\s?bot|live chat|parallax|3d|webgl|three\.js|animations?|animated|e-?commerce|checkout|shopping cart|add to cart|payment gateway|log\s?in|sign[\s-]?in|sign[\s-]?up|member area|dashboard|online booking|booking system|ai assistant)\b/gi;

function collectStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

export function findPremiumClaims(content, briefText = '') {
  const brief = briefText.toLowerCase();
  const found = new Set();
  for (const text of collectStrings(content)) {
    for (const m of text.match(BANNED_OUTPUT) || []) {
      if (!brief.includes(m.toLowerCase())) found.add(m.toLowerCase());
    }
  }
  return [...found];
}
