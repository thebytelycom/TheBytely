// Authoritative prices (in rupees). The server recalculates totals so a saved
// enquiry never relies on numbers sent by the browser.
export const PACKAGES = {
  starter:  { name: 'Starter website',  price: 2999 },
  business: { name: 'Business website', price: 4999 },
  premium:  { name: 'Premium website',  price: 7999 },
  none:     { name: 'Add-ons only',     price: 0 },
};

export const ADDONS = {
  chatbot:     { name: 'AI chatbot integration',   price: 1499, mode: 'one' },
  parallax:    { name: 'Parallax effects',         price: 999,  mode: 'one' },
  threed:      { name: 'Basic 3D element',         price: 1499, mode: 'one' },
  pages:       { name: 'Extra website pages',      price: 400,  mode: 'qty' },
  revisions:   { name: 'Extra revision rounds',    price: 300,  mode: 'qty' },
  maintenance: { name: 'Basic website maintenance', price: 499, mode: 'monthly' },
};

export function calcTotals({ pkg, addons, pages, revisions }) {
  let oneTime = PACKAGES[pkg].price;
  let monthly = 0;
  const lines = [];
  if (PACKAGES[pkg].price) lines.push(PACKAGES[pkg].name);
  for (const id of addons) {
    const a = ADDONS[id];
    if (id === 'parallax' && pkg === 'premium') continue; // included in Premium
    if (a.mode === 'monthly') { monthly += a.price; lines.push(`${a.name} (monthly)`); continue; }
    const qty = id === 'pages' ? pages : id === 'revisions' ? revisions : 1;
    oneTime += a.price * qty;
    lines.push(qty > 1 ? `${a.name} x ${qty}` : a.name);
  }
  return { oneTime, monthly, lines };
}
