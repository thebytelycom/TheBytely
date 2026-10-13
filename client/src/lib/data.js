export const inr = (n) => '\u20B9' + Number(n).toLocaleString('en-IN');

export const BUSINESS_TYPES = [
  'Jewellery', 'Fashion', 'Beauty and wellness', 'Restaurant or café',
  'Technology', 'Consulting', 'Education', 'Other business',
];
export const STYLES = ['Luxury', 'Minimal', 'Bold and modern', 'Warm and friendly', 'Elegant', 'Playful'];
export const ACCENTS = ['#6C4DFF', '#E0457B', '#0E9F8E', '#E8A317', '#2F6BFF'];

export const PKGS = [
  { id: 'starter',  name: 'Starter website',  price: 2999, desc: 'Up to 3 pages, mobile-friendly, WhatsApp button, 1 revision round' },
  { id: 'business', name: 'Business website', price: 4999, desc: 'Up to 5 pages, custom branding, contact form, basic SEO, 2 revision rounds' },
  { id: 'premium',  name: 'Premium website',  price: 7999, desc: 'Up to 5 pages, premium design, parallax effects, advanced interactions, 2 revisions' },
  { id: 'none',     name: 'No website, add-ons only', price: 0, desc: 'For a chatbot or maintenance on a website you already have' },
];

export const ADDONS = [
  { id: 'chatbot',     name: 'AI chatbot integration',    price: 1499, desc: 'Starting price, depends on complexity', mode: 'one' },
  { id: 'parallax',    name: 'Parallax effects',          price: 999,  desc: 'Included in the Premium package',       mode: 'one' },
  { id: 'threed',      name: 'Basic 3D element',          price: 1499, desc: 'Advanced 3D is quoted separately',      mode: 'one' },
  { id: 'pages',       name: 'Extra website pages',       price: 400,  desc: 'Per page',                              mode: 'qty' },
  { id: 'revisions',   name: 'Extra revision rounds',     price: 300,  desc: 'Per revision',                          mode: 'qty' },
  { id: 'maintenance', name: 'Basic website maintenance', price: 499,  desc: 'Per month, small updates included',     mode: 'mon' },
];

export function calcTotals(sel) {
  const pkg = PKGS.find((p) => p.id === sel.pkg);
  const lines = [];
  let one = 0, mon = 0;
  if (pkg.price) { lines.push([pkg.name, pkg.price]); one += pkg.price; }
  for (const a of ADDONS) {
    if (!sel.on[a.id]) continue;
    if (a.id === 'parallax' && sel.pkg === 'premium') continue;
    if (a.mode === 'mon') { mon += a.price; lines.push([`${a.name} (monthly)`, a.price]); continue; }
    const q = a.mode === 'qty' ? sel.qty[a.id] : 1;
    one += a.price * q;
    lines.push([q > 1 ? `${a.name} \u00D7 ${q}` : a.name, a.price * q]);
  }
  return { pkg, lines, one, mon };
}
