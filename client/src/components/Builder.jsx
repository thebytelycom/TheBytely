import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { createWebsite, renderWebsite } from '../lib/api.js';
import { ACCENTS, BUSINESS_TYPES, STYLES } from '../lib/data.js';
import { MAX_IMAGES, MAX_TOTAL_BYTES, compressImage, dataUrlBytes, totalBytes, uid } from '../lib/images.js';

const EMPTY = { name: '', type: 'Jewellery', location: '', style: 'Luxury', products: '' };
const TABS = [['index', 'Home'], ['about', 'About'], ['contact', 'Contact']];

function Field({ label, children }) {
  return <label>{label}{children}</label>;
}
function PhotoManager({ images, onChange }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const inputRef = useRef(null);
  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) { setMsg(`You can add up to ${MAX_IMAGES} photos.`); return; }
    setBusy(true);
    setMsg('');
    const next = [...images];
    const problems = [];
    for (const file of files.slice(0, room)) {
      try {
        const src = await compressImage(file);
        if (totalBytes(next) + dataUrlBytes(src) > MAX_TOTAL_BYTES) {
          problems.push('Photo limit reached. Remove a photo to add another.');
          break;
        }
        next.push({ id: uid(), src, name: '' });
      } catch (err) {
        problems.push(`${file.name}: ${err.message}`);
      }
    }
    if (files.length > room) problems.push(`Only ${room} more photo${room === 1 ? '' : 's'} could be added.`);
    onChange(next);
    setMsg(problems.join(' '));
    setBusy(false);
  }

  const rename = (id, name) => onChange(images.map((i) => (i.id === id ? { ...i, name } : i)));
  const remove = (id) => { setMsg(''); onChange(images.filter((i) => i.id !== id)); };
  const makeMain = (id) => onChange([images.find((i) => i.id === id), ...images.filter((i) => i.id !== id)]);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[0.94rem] font-medium">Product photos <span className="font-normal text-muted">(optional, {images.length} of {MAX_IMAGES})</span></span>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || images.length >= MAX_IMAGES} onClick={() => inputRef.current?.click()}>
          {busy ? 'Adding photos' : 'Add photos'}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" aria-label="Choose product photos" onChange={onFiles} tabIndex={-1} />
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className="grid gap-1.5 rounded-2xl border border-line bg-bg p-2">
              <div className="relative">
                <img src={img.src} alt={img.name || `Photo ${i + 1}`} className="aspect-square w-full rounded-xl object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">Main photo</span>}
              </div>
              <input
                value={img.name} onChange={(e) => rename(img.id, e.target.value)} maxLength={40}
                placeholder="Name (optional)" aria-label={`Name for photo ${i + 1}`}
                className="!min-h-[38px] !rounded-lg !px-2.5 !py-1.5 !text-sm"
              />
              <div className="flex justify-between gap-2 text-sm">
                {i > 0 ? <button type="button" className="font-medium text-glow underline" onClick={() => makeMain(img.id)}>Make main</button> : <span />}
                <button type="button" className="font-medium text-muted underline hover:text-ink" onClick={() => remove(img.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="note !mb-0">JPG, PNG or WebP. The main photo is shown at the top of your Home page and the rest become a gallery. Photos are shrunk on your device before they are used.</p>
      <div className="err" role="alert">{msg}</div>
    </div>
  );
}
export default function Builder() {
  const [form, setForm] = useState(EMPTY);
    const [images, setImages] = useState([]); // {id, src, name}
  const [status, setStatus] = useState('idle'); // idle | loading
  const [error, setError] = useState('');
  const [site, setSite] = useState(null); // { content, theme, pages, source, notice }
  const [tab, setTab] = useState('index');
  const [dirty, setDirty] = useState(false);
  const [editError, setEditError] = useState('');
  const editSeq = useRef(0);
  const previewRef = useRef(null);
  const [full, setFull] = useState(false);
  const [device, setDevice] = useState('desktop');
  const expandRef = useRef(null);
  const closeRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Add your business name to generate a draft.'); return; }
    setStatus('loading');
    try {
      const data = await createWebsite({
        name: form.name.trim(), type: form.type, location: form.location.trim(),
        style: form.style, products: form.products.trim(),
      },images);
      editSeq.current += 1;
      setSite(data);
      setTab('index');
      setDirty(false);
      setEditError('');
      if (window.innerWidth < 1024) {
        setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus('idle');
    }
  }

  // Edits are shown instantly in the fields, then the preview is re-rendered by the server.
  function edit(updateContent, themePatch) {
    editSeq.current += 1;
    setSite((s) => ({
      ...s,
      content: updateContent ? updateContent(s.content) : s.content,
      theme: themePatch ? { ...s.theme, ...themePatch } : s.theme,
    }));
    setDirty(true);
  }

  useEffect(() => {
    if (!dirty || !site) return undefined;
    const t = setTimeout(async () => {
      const seq = editSeq.current;
      try {
        const data = await renderWebsite(site.content, site.theme);
        if (seq !== editSeq.current) return;
        setSite((s) => ({ ...s, pages: data.pages }));
        setDirty(false);
        setEditError('');
      } catch (err) {
        if (seq === editSeq.current) setEditError(err.message);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [dirty, site?.content, site?.theme]); // eslint-disable-line react-hooks/exhaustive-deps
  function changeImages(next) {
    setImages(next);
    if (site) edit((x) => ({ ...x, images: next.map(({ src, name }) => ({ src, name })) }));
  }
    // Full screen preview: Esc closes it, page scroll is locked while it is open.
  useEffect(() => {
    if (!full) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setFull(false); };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const opener = expandRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [full]);
  const c = site?.content;
  const setHome = (k) => (e) => edit((x) => ({ ...x, home: { ...x.home, [k]: e.target.value } }));
  const setContact = (k) => (e) => edit((x) => ({ ...x, contact: { ...x.contact, [k]: e.target.value } }));

  return (
    <div className="mt-10 grid items-start gap-9 lg:grid-cols-[1fr_1.15fr]">
      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        <Field label="Business name">
          <input value={form.name} onChange={set('name')} placeholder="e.g. Maison Aarav" maxLength={60} required />
        </Field>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Business type">
            <select value={form.type} onChange={set('type')}>{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </Field>
          <Field label="Location">
            <input value={form.location} onChange={set('location')} placeholder="e.g. Bhopal" maxLength={40} />
          </Field>
        </div>
        <Field label="Visual style">
          <select value={form.style} onChange={set('style')}>{STYLES.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Products or services">
          <textarea value={form.products} onChange={set('products')} placeholder="e.g. Handmade silver jewellery, gift sets" maxLength={240} />
        </Field>
                <PhotoManager images={images} onChange={changeImages} />
        <div className="err" role="alert">{error}</div>
        <div className="flex flex-wrap items-center gap-3.5">
          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Writing your draft' : site ? 'Write a new draft' : 'Generate my website'}
          </button>
          {status === 'loading' && (
            <span className="loadingdots flex items-center gap-2.5 text-sm text-glow" role="status"><span><i /><i /><i /></span>This takes a few seconds</span>
          )}
        </div>
        <p className="note !mb-0">
          The AI builder makes a basic website: Home, About and Contact. Extras such as animations, a chatbot or online payments are paid services. See <Link className="text-glow underline" to="/hire">Hire us</Link>.
        </p>
      </form>

      <div ref={previewRef}>
        <div className="frame">
          <div className="bar">
            <i /><i /><i />
            <span className="note ml-2.5">
              {site ? `${site.content.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'yourbusiness'}.com` : 'yourbusiness.com'}
            </span>
                        {site && (
              <button
                ref={expandRef} type="button" onClick={() => setFull(true)}
                aria-label="View website full screen"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm font-medium text-ink hover:bg-panel2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                Full screen
              </button>
            )}
          </div>
          {site ? (
            <>
              <div className="flex gap-1.5 border-b border-line px-3 py-2" role="tablist" aria-label="Pages">
                {TABS.map(([id, label]) => (
                  <button
                    key={id} type="button" role="tab" aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${tab === id ? 'bg-panel2 text-ink' : 'text-muted hover:text-ink'}`}
                  >{label}</button>
                ))}
                {dirty && <span className="note ml-auto self-center">Updating preview&hellip;</span>}
              </div>
              <iframe
                title={`Website preview: ${TABS.find((t) => t[0] === tab)[1]} page`}
                sandbox=""
                srcDoc={site.pages[tab]}
                className="block h-[640px] w-full border-0 bg-white"
              />
            </>
          ) : (
            <div className="grid min-h-[360px] place-items-center p-8 text-center">
              <div>
                <h3>Your website preview will appear here</h3>
                <p className="mx-auto text-muted">Fill in the form and choose Generate my website. You can then edit the text and colours.</p>
              </div>
            </div>
          )}
        </div>

        {site && (
          <div className="panel mt-5 !p-6">
            {site.notice && <p className="note mb-4 rounded-xl bg-panel2 p-3">{site.notice}</p>}
            <h3 className="!mb-4">Edit your draft</h3>
            <div className="grid gap-3.5">
              <Field label="Headline"><input value={c.home.headline} onChange={setHome('headline')} maxLength={100} /></Field>
              <Field label="Introduction"><textarea className="!min-h-[84px]" value={c.home.intro} onChange={setHome('intro')} maxLength={320} /></Field>
              <Field label="Button text"><input value={c.home.ctaLabel} onChange={setHome('ctaLabel')} maxLength={28} /></Field>
              <Field label="About text">
                <textarea className="!min-h-[110px]" value={c.about.body} onChange={(e) => edit((x) => ({ ...x, about: { ...x.about, body: e.target.value } }))} maxLength={700} />
              </Field>
              <div className="grid gap-3.5 sm:grid-cols-3">
                <Field label="Phone"><input type="tel" value={c.contact.phone} onChange={setContact('phone')} placeholder="+91 98765 43210" /></Field>
                <Field label="Email"><input type="email" value={c.contact.email} onChange={setContact('email')} placeholder="hello@yourshop.in" /></Field>
                <Field label="WhatsApp"><input value={c.contact.whatsapp} onChange={setContact('whatsapp')} placeholder="919876543210" /></Field>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-medium">Colour</span>
                {ACCENTS.map((col) => (
                  <button
                    key={col} type="button" aria-label={`Accent colour ${col}`} aria-pressed={site.theme.accent === col}
                    onClick={() => edit(null, { accent: col })}
                    className="h-7 w-7 rounded-full border-2 border-line p-0 aria-pressed:outline aria-pressed:outline-[3px] aria-pressed:outline-offset-2 aria-pressed:outline-ink"
                    style={{ background: col }}
                  />
                ))}
              </div>
              <div className="err" role="alert">{editError}</div>
            </div>
            <p className="note !mb-0 mt-3">This is a content draft, not a published website. For a full site with your branding, see our <Link className="text-glow underline" to="/pricing">website packages</Link>.</p>
          </div>
        )}
      </div>
            {full && site && createPortal(
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-bg"
          role="dialog" aria-modal="true" aria-label="Full screen website preview"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel px-3 py-2.5">
            <div className="flex gap-1.5" role="tablist" aria-label="Pages">
              {TABS.map(([id, label]) => (
                <button
                  key={id} type="button" role="tab" aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${tab === id ? 'bg-panel2 text-ink' : 'text-muted hover:text-ink'}`}
                >{label}</button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden rounded-full border border-line p-0.5 sm:flex" role="group" aria-label="Screen size">
                {[['desktop', 'Desktop'], ['phone', 'Phone']].map(([id, label]) => (
                  <button
                    key={id} type="button" aria-pressed={device === id} onClick={() => setDevice(id)}
                    className={`rounded-full px-3.5 py-1 text-sm font-medium ${device === id ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}
                  >{label}</button>
                ))}
              </div>
              <button ref={closeRef} type="button" className="btn btn-primary btn-sm" onClick={() => setFull(false)}>Close</button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-panel2 sm:p-4">
            <iframe
              title={`Full screen preview: ${TABS.find((t) => t[0] === tab)[1]} page`}
              sandbox=""
              srcDoc={site.pages[tab]}
              className={`self-stretch border-0 bg-white ${device === 'phone' ? 'w-[390px] max-w-full rounded-[28px] !border-[10px] border-solid !border-[#1a1a1a]' : 'w-full'}`}
              style={{ minHeight: 0 }}
            />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
