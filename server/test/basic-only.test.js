import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtempSync, readFileSync } from 'node:fs';

process.env.DATA_DIR = mkdtempSync(path.join(os.tmpdir(), 'bytely-'));
delete process.env.ANTHROPIC_API_KEY;

const { runCommand } = await import('../src/commands.js');
const { resetRateLimits } = await import('../src/rateLimit.js');
const { findPremiumClaims } = await import('../src/policy.js');
const { renderSite } = await import('../src/render.js');
const { fallbackContent } = await import('../src/fallback.js');
const { BUSINESS_TYPES, STYLE_NAMES } = await import('../src/policy.js');

beforeEach(() => resetRateLimits());

const brief = { name: 'Maison Aarav', type: 'Jewellery', location: 'Bhopal', style: 'Luxury', products: 'Silver jewellery' };

test('creates a basic 3-page website from a brief (template path)', async () => {
  const out = await runCommand('create_website', { brief }, '1.1.1.1');
  assert.equal(out.source, 'template');
  assert.deepEqual(Object.keys(out.pages).sort(), ['about', 'contact', 'index']);
  assert.match(out.pages.index, /Maison Aarav/);
  assert.equal(out.content.home.highlights.length, 3);
});

test('rendered sites have no scripts, animation or third-party code', async () => {
  const out = await runCommand('create_website', { brief }, '1.1.1.2');
  for (const html of Object.values(out.pages)) {
    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /@keyframes|animation|transition|perspective/i);
    assert.doesNotMatch(html, /https?:\/\/(?!wa\.me)/i);
  }
});

test('every business type and style produces valid content with no premium claims', async () => {
  for (const type of BUSINESS_TYPES) for (const style of STYLE_NAMES) {
    const out = await runCommand('create_website', { brief: { ...brief, type, style } }, `2.2.${type.length}.${style.length}`);
    assert.deepEqual(findPremiumClaims(out.content, JSON.stringify(brief)), []);
    resetRateLimits();
  }
});

test('premium options in the brief are rejected with a paid-service message', async () => {
  for (const key of ['parallax', 'chatbot', 'animations', 'extraPages', 'seo', 'payments']) {
    resetRateLimits();
    await assert.rejects(
      runCommand('create_website', { brief: { ...brief, [key]: true } }, '3.3.3.3'),
      (e) => e.status === 400 && e.code === 'unsupported_option' && /paid services/.test(e.message),
    );
  }
  resetRateLimits();
  await assert.rejects(
    runCommand('create_website', { brief: { ...brief, whatever: 1 } }, '3.3.3.3'),
    (e) => e.code === 'unsupported_option' && /not a supported field/.test(e.message),
  );
});

test('paid-sounding or unknown commands are refused', async () => {
  await assert.rejects(runCommand('add_chatbot', {}, '4.4.4.4'), (e) => e.status === 403 && e.code === 'paid_service');
  await assert.rejects(runCommand('create_premium_website', {}, '4.4.4.4'), (e) => e.status === 403);
  await assert.rejects(runCommand('format_disk', {}, '4.4.4.4'), (e) => e.status === 400 && e.code === 'unknown_command');
  await assert.rejects(runCommand('toString', {}, '4.4.4.4'), (e) => e.code === 'unknown_command');
});

test('invalid briefs are rejected', async () => {
  await assert.rejects(runCommand('create_website', { brief: { ...brief, name: '   ' } }, '5.5.5.5'), (e) => e.code === 'invalid_brief');
  await assert.rejects(runCommand('create_website', { brief: { ...brief, type: 'Casino' } }, '5.5.5.5'), (e) => e.code === 'invalid_brief');
  await assert.rejects(runCommand('create_website', {}, '5.5.5.5'), (e) => e.code === 'invalid_brief');
});

test('HTML and script injection in text is neutralised', async () => {
  const out = await runCommand('create_website', {
    brief: { ...brief, name: 'Bad <script>alert(1)</script> Co', products: '"><img src=x onerror=alert(1)>' },
  }, '6.6.6.6');
  for (const html of Object.values(out.pages)) {
    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /<img/i);
  }
  const edited = await runCommand('render_website', {
    content: { ...out.content, home: { ...out.content.home, headline: '<b onclick=1>Hi</b> & "you"' } },
    theme: out.theme,
  }, '6.6.6.6');
  assert.doesNotMatch(edited.pages.index, /<b onclick/);
});

test('render_website applies edits, validates contact details and colour', async () => {
  const base = await runCommand('create_website', { brief }, '7.7.7.7');
  const edited = await runCommand('render_website', {
    content: { ...base.content, contact: { ...base.content.contact, phone: '+91 98765 43210', email: 'hi@maison.in', whatsapp: '919876543210' } },
    theme: { style: 'Luxury', accent: '#E0457B' },
  }, '7.7.7.7');
  assert.match(edited.pages.contact, /tel:\+919876543210/);
  assert.match(edited.pages.contact, /wa\.me\/919876543210/);
  assert.match(edited.pages.index, /#E0457B/);

  await assert.rejects(runCommand('render_website', {
    content: { ...base.content, contact: { ...base.content.contact, email: 'nope' } }, theme: base.theme,
  }, '7.7.7.7'), (e) => e.code === 'invalid_content');

  const badColour = await runCommand('render_website', { content: base.content, theme: { style: 'Luxury', accent: 'red;}</style>' } }, '7.7.7.7');
  assert.doesNotMatch(badColour.pages.index, /red;\}/);
});

test('premium claims are detected unless the customer used the words first', () => {
  const sneaky = { a: 'Chat with our AI chatbot', b: ['Enjoy parallax scrolling and 3D'] };
  assert.deepEqual(findPremiumClaims(sneaky, '{"name":"Acme"}').sort(), ['3d', 'ai chatbot'.replace('ai ', ''), 'parallax'].sort());
  assert.deepEqual(findPremiumClaims({ a: '3D printing studio' }, '{"name":"3D Print Hub","products":"3D printing"}'), []);
});

test('AI path: premium claims trigger a retry, then valid output is used', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key';
  const calls = [];
  const realFetch = globalThis.fetch;
  const good = {
    home: { headline: 'Silver jewellery from Bhopal', intro: 'Handmade silver pieces for everyday wear.', ctaLabel: 'Contact us',
      highlights: [{ title: 'Handmade', text: 'Each piece is made by hand.' }, { title: 'Gift ready', text: 'Lovely for any occasion.' }, { title: 'Easy to reach', text: 'Message us with questions.' }] },
    about: { heading: 'About us', body: 'We make silver jewellery.\n\nVisit us in Bhopal.' },
    contact: { heading: 'Get in touch', text: 'We would love to hear from you.' },
  };
  const bad = structuredClone(good);
  bad.home.intro = 'Chat with our AI chatbot and enjoy parallax scrolling.';
  globalThis.fetch = async (_url, opts) => {
    calls.push(JSON.parse(opts.body));
    const input = calls.length === 1 ? bad : good;
    return { ok: true, json: async () => ({ content: [{ type: 'tool_use', name: 'submit_basic_website', input }] }) };
  };
  try {
    const out = await runCommand('create_website', { brief }, '8.8.8.8');
    assert.equal(out.source, 'ai');
    assert.equal(calls.length, 2);
    assert.match(calls[1].messages[0].content, /previous answer mentioned/);
    assert.equal(calls[0].tool_choice.name, 'submit_basic_website');
    assert.match(out.content.home.intro, /Handmade silver/);
    assert.equal(out.content.businessName, 'Maison Aarav');
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.ANTHROPIC_API_KEY;
  }
});

test('AI path: repeated failure falls back to the template', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key';
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 500, text: async () => 'boom' });
  const realErr = console.error; console.error = () => {};
  try {
    const out = await runCommand('create_website', { brief }, '9.9.9.9');
    assert.equal(out.source, 'template');
    assert.match(out.notice, /template/);
  } finally {
    globalThis.fetch = realFetch; console.error = realErr; delete process.env.ANTHROPIC_API_KEY;
  }
});

test('rate limit stops repeated free drafts', async () => {
  process.env.GENERATE_PER_HOUR = '2';
  await runCommand('create_website', { brief }, '10.0.0.1');
  await runCommand('create_website', { brief }, '10.0.0.1');
  await assert.rejects(runCommand('create_website', { brief }, '10.0.0.1'), (e) => e.status === 429 && e.retryAfter > 0);
  await runCommand('create_website', { brief }, '10.0.0.2'); // other visitor unaffected
  delete process.env.GENERATE_PER_HOUR;
});

test('enquiries are validated, priced on the server and saved', async () => {
  const enquiry = { name: 'Asha', email: 'asha@example.com', pkg: 'premium', addons: ['parallax', 'chatbot', 'pages', 'maintenance'], pages: 2, revisions: 1, requirements: 'Need a site' };
  const out = await runCommand('submit_enquiry', { enquiry }, '11.0.0.1');
  assert.equal(out.totals.oneTime, 7999 + 1499 + 800); // parallax included in Premium
  assert.equal(out.totals.monthly, 499);
  const saved = readFileSync(path.join(process.env.DATA_DIR, 'enquiries.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(saved.at(-1).email, 'asha@example.com');

  await assert.rejects(runCommand('submit_enquiry', { enquiry: { ...enquiry, email: 'bad' } }, '11.0.0.1'), (e) => e.code === 'invalid_enquiry');
  await assert.rejects(runCommand('submit_enquiry', { enquiry: { ...enquiry, pkg: 'free' } }, '11.0.0.1'), (e) => e.code === 'invalid_enquiry');
  await assert.rejects(runCommand('submit_enquiry', { enquiry: { ...enquiry, pkg: 'none', addons: [] } }, '11.0.0.1'), (e) => e.code === 'invalid_enquiry');
});

test('assistant reports unavailable without an API key', async () => {
  await assert.rejects(runCommand('ask_assistant', { messages: [{ role: 'user', content: 'hi' }] }, '12.0.0.1'), (e) => e.status === 503);
});

test('static export renders linked files for download-style use', () => {
  const content = fallbackContent(brief);
  const { pages } = renderSite(content, { style: 'Minimal', accent: '#6C4DFF' }, { preview: false });
  assert.match(pages.index, /href="about\.html"/);
  assert.match(pages.index, /styles\.css/);
});
