import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Par from '../components/Par.jsx';
import { submitEnquiry } from '../lib/api.js';
import { ADDONS, PKGS, calcTotals, inr } from '../lib/data.js';

function summaryText(form, sel, totals) {
  return [
    'New enquiry for TheBytely', '',
    `Name: ${form.name}`, `Email: ${form.email}`, `Phone: ${form.phone || '-'}`, `Business: ${form.business || '-'}`, '',
    `Package: ${totals.pkg.name}`,
    `Selected extras: ${totals.lines.length ? totals.lines.map((l) => l[0]).join(', ') : 'none'}`,
    `Estimated one-time: ${inr(totals.one)}`, `Estimated monthly: ${inr(totals.mon)}`, '',
    'Requirements:', form.requirements || '-',
  ].join('\n');
}

export default function Enquiry() {
  const [params] = useSearchParams();
  const initialPkg = PKGS.some((p) => p.id === params.get('pkg')) ? params.get('pkg') : 'business';
  const initialAddon = ADDONS.some((a) => a.id === params.get('addon')) ? params.get('addon') : null;

  const [sel, setSel] = useState({ pkg: initialPkg, on: initialAddon ? { [initialAddon]: true } : {}, qty: { pages: 1, revisions: 1 } });
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', requirements: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [copied, setCopied] = useState(false);

  const totals = useMemo(() => calcTotals(sel), [sel]);
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (id) => (e) => setSel((s) => ({ ...s, on: { ...s.on, [id]: e.target.checked } }));
  const bump = (id, d) => setSel((s) => ({ ...s, qty: { ...s.qty, [id]: Math.max(1, Math.min(20, s.qty[id] + d)) } }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Enter your name so we know who to reply to.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) { setError('Enter a valid email address, like name@example.com.'); return; }
    if (!totals.lines.length) { setError('Choose a package or at least one extra before continuing.'); return; }
    setStatus('sending');
    try {
      await submitEnquiry({
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), business: form.business.trim(),
        requirements: form.requirements.trim(),
        pkg: sel.pkg,
        addons: ADDONS.filter((a) => sel.on[a.id]).map((a) => a.id),
        pages: sel.qty.pages, revisions: sel.qty.revisions,
      });
      setStatus('sent');
    } catch (err) {
      setError(err.message);
      setStatus('failed');
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(summaryText(form, sel, totals));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  }

  if (status === 'sent') {
    return (
      <div className="wrap py-24">
        <div className="panel mx-auto max-w-[640px] !border-primary text-center" role="status">
          <h1 className="!text-[2rem]">Thanks, {form.name.split(' ')[0]}. We have your enquiry.</h1>
          <p className="mx-auto text-muted">We will reply to {form.email} with a confirmed quote. Your estimate was {inr(totals.one)} one-time{totals.mon ? ` and ${inr(totals.mon)} a month` : ''}. Final prices are confirmed in writing.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a className="btn btn-primary" href="/">Back to home</a>
            <button className="btn btn-ghost" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy summary'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden pb-7 pt-[72px]">
        <Par depth={0.08} className="orb right-[10%] top-[-160px] h-[420px] w-[420px]" style={{ background: 'radial-gradient(circle,rgba(108,77,255,.5),transparent 70%)' }} />
        <Par depth={0.05} className="gridlines" />
        <div className="wrap relative">
          <p className="kicker">Project enquiry</p>
          <h1 className="!text-[clamp(2rem,4.4vw,3.2rem)]">Start a conversation</h1>
          <p className="lead">Choose a package, add what you need, and tell us about your project. You will see an estimate as you go; the final price is confirmed in your quote.</p>
        </div>
      </div>

      <div className="wrap grid items-start gap-9 pb-24 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={onSubmit} noValidate className="grid gap-[22px]">
          <div className="panel">
            <h3 className="!mb-4">1. Choose a package</h3>
            <div className="grid gap-3" role="radiogroup" aria-label="Website package">
              {PKGS.map((p) => (
                <label key={p.id} className="opt">
                  <input type="radio" name="pkg" value={p.id} checked={sel.pkg === p.id} onChange={() => setSel((s) => ({ ...s, pkg: p.id }))} />
                  <span className="flex-1"><b className="block">{p.name}</b><span className="text-[0.9rem] text-muted">{p.desc}</span></span>
                  <span className="whitespace-nowrap font-bold">{inr(p.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="!mb-4">2. Add extras</h3>
            <div className="grid gap-3">
              {ADDONS.map((a) => {
                const included = a.id === 'parallax' && sel.pkg === 'premium';
                const checked = included || !!sel.on[a.id];
                return (
                  <label key={a.id} className="opt">
                    <input type="checkbox" checked={checked} disabled={included} onChange={toggle(a.id)} />
                    <span className="flex-1">
                      <b className="block">{a.name}</b>
                      <span className="text-[0.9rem] text-muted">{a.desc}</span>
                      {a.mode === 'qty' && checked && (
                        <span className="mt-2 flex items-center gap-2">
                          <button type="button" aria-label={`Fewer ${a.name}`} onClick={(e) => { e.preventDefault(); bump(a.id, -1); }} className="h-[34px] w-[34px] rounded-full border border-line bg-panel text-lg text-ink">{'\u2212'}</button>
                          <output className="min-w-[22px] text-center font-bold">{sel.qty[a.id]}</output>
                          <button type="button" aria-label={`More ${a.name}`} onClick={(e) => { e.preventDefault(); bump(a.id, 1); }} className="h-[34px] w-[34px] rounded-full border border-line bg-panel text-lg text-ink">+</button>
                        </span>
                      )}
                    </span>
                    <span className="whitespace-nowrap font-bold">{inr(a.price)}{a.mode === 'mon' ? '/mo' : ''}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <h3 className="!mb-4">3. About you and the project</h3>
            <div className="grid gap-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label>Your name<input value={form.name} onChange={setField('name')} autoComplete="name" maxLength={80} required /></label>
                <label>Email<input type="email" value={form.email} onChange={setField('email')} autoComplete="email" maxLength={120} required /></label>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label>Phone or WhatsApp (optional)<input type="tel" value={form.phone} onChange={setField('phone')} autoComplete="tel" maxLength={20} /></label>
                <label>Business name<input value={form.business} onChange={setField('business')} autoComplete="organization" maxLength={80} /></label>
              </div>
              <label>What do you need?
                <textarea value={form.requirements} onChange={setField('requirements')} maxLength={1500} placeholder="Tell us about your business, the pages you want, and any websites you like." />
              </label>
              <div className="err" role="alert">{error}</div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending' : 'Send my enquiry'}</button>
                {status === 'failed' && <button className="btn btn-ghost" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy summary instead'}</button>}
              </div>
            </div>
          </div>
        </form>

        <aside className="lg:sticky" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 88px)' }}>
          <div className="panel">
            <h3 className="!mb-4">Your estimate</h3>
            <ul className="mb-3.5">
              {totals.lines.length === 0 && <li className="py-2 text-muted">Nothing selected yet</li>}
              {totals.lines.map(([name, amt]) => (
                <li key={name} className="flex justify-between gap-3 border-b border-dashed border-line py-2 text-[0.95rem]"><span>{name}</span><b>{inr(amt)}</b></li>
              ))}
              {sel.pkg === 'premium' && (
                <li className="flex justify-between gap-3 border-b border-dashed border-line py-2 text-[0.95rem] text-muted"><span>Parallax effects</span><span>Included</span></li>
              )}
            </ul>
            <div className="flex items-baseline justify-between pt-1.5 font-semibold"><span>One-time</span><strong className="font-head text-[1.7rem]">{inr(totals.one)}</strong></div>
            <div className="flex items-baseline justify-between pt-1.5 font-semibold"><span>Monthly</span><strong className="font-head text-xl">{inr(totals.mon)}</strong></div>
            <p className="note mb-0 mt-3.5">Starting estimate only. Excludes domain, hosting, paid AI usage and taxes. We confirm everything in writing.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
