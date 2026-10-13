// Turns validated content into plain, mobile-friendly HTML + CSS.
// There is deliberately no JavaScript, animation, chat widget or third-party
// code in the output, so a basic site cannot contain paid add-ons.
// Free drafts carry a small "Made with TheBytely" badge. Set to false to remove it.
const SHOW_WATERMARK = true;
const PRESETS = {
  'Luxury':            { bg: '#14101f', text: '#f4eefc', font: 'Georgia,"Times New Roman",serif', r: '2px' },
  'Minimal':           { bg: '#ffffff', text: '#161616', font: 'system-ui,"Segoe UI",Roboto,sans-serif', r: '4px' },
  'Bold and modern':   { bg: '#0f0f14', text: '#ffffff', font: 'system-ui,"Segoe UI",Roboto,sans-serif', r: '10px' },
  'Warm and friendly': { bg: '#fff6ec', text: '#3a2415', font: 'system-ui,"Segoe UI",Roboto,sans-serif', r: '999px' },
  'Elegant':           { bg: '#f7f3ee', text: '#2a2230', font: 'Georgia,"Times New Roman",serif', r: '999px' },
  'Playful':           { bg: '#fff4fb', text: '#2b1850', font: 'system-ui,"Segoe UI",Roboto,sans-serif', r: '16px' },
};

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function onColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 165 ? '#1a1a1a' : '#ffffff';
}

export function buildCss(theme) {
  const p = PRESETS[theme.style] || PRESETS.Minimal;
  return `:root{--bg:${p.bg};--text:${p.text};--accent:${theme.accent};--on:${onColor(theme.accent)};--r:${p.r};--line:color-mix(in srgb,var(--text) 18%,transparent)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:${p.font};font-size:17px;line-height:1.65}
.wrap{max-width:960px;margin:0 auto;padding:0 22px}
a{color:inherit}
.site-header{border-bottom:1px solid var(--line)}
.site-header .wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 24px;padding-top:18px;padding-bottom:18px}
.logo{font-weight:700;font-size:1.2rem;text-decoration:none}
nav a{margin-left:20px;text-decoration:none;opacity:.8;padding:4px 0;border-bottom:2px solid transparent}
nav a[aria-current]{opacity:1;border-color:var(--accent)}
.hero{padding:72px 0 48px}
.hero-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center}
.hero-img{margin:0}
.hero-img img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:min(var(--r),22px);border:1px solid var(--line)}
.sec-title{font-size:1.6rem;margin:0 0 18px}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;margin-bottom:56px}
.gallery figure{margin:0}
.gallery img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:min(var(--r),16px);border:1px solid var(--line)}
.gallery figcaption{margin-top:8px;font-size:.95rem;opacity:.85}
@media(max-width:760px){.hero-grid{grid-template-columns:1fr}.hero-img{order:-1}}
h1{font-size:clamp(2rem,5vw,3.1rem);line-height:1.15;margin:0 0 18px}
h2{font-size:1.25rem;margin:0 0 6px}
p{margin:0 0 1em;max-width:62ch}
.lead{font-size:1.15rem;opacity:.85}
.btn{display:inline-block;padding:13px 26px;border-radius:var(--r);background:var(--accent);color:var(--on);font-weight:700;text-decoration:none;margin:6px 10px 6px 0}
.btn.alt{background:transparent;color:var(--text);border:1px solid var(--line)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;padding-bottom:64px}
.card{padding:22px;border:1px solid var(--line);border-radius:min(var(--r),18px)}
.card p{margin:0;opacity:.85}
.page{padding:56px 0 72px}
.list{list-style:none;margin:24px 0;padding:0;display:grid;gap:12px}
.list li{padding:16px 18px;border:1px solid var(--line);border-radius:min(var(--r),14px)}
.muted{opacity:.7}
.wm{position:fixed;right:14px;bottom:14px;z-index:50;padding:7px 14px;border-radius:999px;background:#111;color:#fff;font:600 12px system-ui,sans-serif;opacity:.9;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.wm-diag{position:fixed;inset:0;z-index:40;display:grid;place-items:center;overflow:hidden;pointer-events:none}
.wm-diag span{transform:rotate(-30deg);font:800 clamp(48px,12vw,120px) system-ui,sans-serif;color:var(--text);opacity:.07;letter-spacing:.1em;white-space:nowrap}
footer{border-top:1px solid var(--line);padding:26px 0;font-size:.92rem;opacity:.8}`;
}

const FILES = { index: 'index.html', about: 'about.html', contact: 'contact.html' };

function layout({ content, theme, active, body, preview }) {
  const href = (k) => (preview ? '#' : FILES[k]);
  const nav = [['index', 'Home'], ['about', 'About'], ['contact', 'Contact']]
    .map(([k, label]) => `<a href="${href(k)}"${k === active ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');
  const css = buildCss(theme);
  const style = preview ? `<style>${css}</style>` : '<link rel="stylesheet" href="styles.css">';
  const desc = esc(content.home.intro.slice(0, 150));
    const watermark = SHOW_WATERMARK
    ? `${preview ? '<div class="wm-diag" aria-hidden="true"><span>PREVIEW</span></div>' : ''}<div class="wm">Made with TheBytely</div>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(content.businessName)}</title>
<meta name="description" content="${desc}">
${style}
</head>
<body>
<header class="site-header"><div class="wrap"><a class="logo" href="${href('index')}">${esc(content.businessName)}</a><nav aria-label="Main">${nav}</nav></div></header>
<main class="wrap">${body}</main>
<footer><div class="wrap">&copy; ${new Date().getFullYear()} ${esc(content.businessName)}</div></footer>
${watermark}
</body>
</html>`;
}

const paras = (text) => text.split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');

export function renderSite(content, theme, { preview = false } = {}) {
  const c = content;
  const href = (k) => (preview ? '#' : FILES[k]);

   const imgs = c.images || [];
  const alt = (img, i) => esc(img.name || `Photo ${i + 1}`);
  const heroText = `<h1>${esc(c.home.headline)}</h1><p class="lead">${esc(c.home.intro)}</p><a class="btn" href="${href('contact')}">${esc(c.home.ctaLabel)}</a>`;
  const hero = imgs.length
    ? `<section class="hero hero-grid"><div>${heroText}</div><figure class="hero-img"><img src="${imgs[0].src}" alt="${alt(imgs[0], 0)}"></figure></section>`
    : `<section class="hero">${heroText}</section>`;
  const rest = imgs.slice(1);
  const gallery = rest.length
    ? `<section><h2 class="sec-title">${esc(c.home.galleryHeading || 'Our products')}</h2><div class="gallery">${rest.map((img, i) => `<figure><img src="${img.src}" alt="${alt(img, i + 1)}" loading="lazy">${img.name ? `<figcaption>${esc(img.name)}</figcaption>` : ''}</figure>`).join('')}</div></section>`
    : '';
  const home = `${hero}${gallery}
<section class="cards">${c.home.highlights.map((h) => `<div class="card"><h2>${esc(h.title)}</h2><p>${esc(h.text)}</p></div>`).join('')}</section>`;

  const about = `<section class="page"><h1>${esc(c.about.heading)}</h1>${paras(c.about.body)}</section>`;

  const k = c.contact;
  const items = [];
  if (k.phone) items.push(`<li>Phone: <a href="tel:${esc(k.phone.replace(/[^0-9+]/g, ''))}">${esc(k.phone)}</a></li>`);
  if (k.email) items.push(`<li>Email: <a href="mailto:${esc(k.email)}">${esc(k.email)}</a></li>`);
  if (k.address) items.push(`<li>Location: ${esc(k.address)}</li>`);
  if (!items.length) items.push('<li class="muted">Contact details will appear here.</li>');
  const wa = k.whatsapp ? `<a class="btn" href="https://wa.me/${esc(k.whatsapp)}">Message on WhatsApp</a>` : '';
  const contact = `<section class="page"><h1>${esc(k.heading)}</h1><p class="lead">${esc(k.text)}</p><ul class="list">${items.join('')}</ul>${wa}</section>`;

  const pages = {
    index: layout({ content: c, theme, active: 'index', body: home, preview }),
    about: layout({ content: c, theme, active: 'about', body: about, preview }),
    contact: layout({ content: c, theme, active: 'contact', body: contact, preview }),
  };
  return { pages, css: buildCss(theme), files: FILES };
}
