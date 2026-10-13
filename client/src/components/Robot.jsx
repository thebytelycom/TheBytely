import { useEffect, useRef, useState } from 'react';
import { askAssistant } from '../lib/api.js';

const GREETING = 'Hi, I\u2019m the TheBytely Assistant. Ask me about our services, prices or how a project works.';
const QUICK = ['What does it cost?', 'What is free?', 'Tell me about the chatbot'];

// Used when the server's AI assistant is not available.
function localReply(q) {
  q = q.toLowerCase();
  const has = (...w) => w.some((x) => q.includes(x));
  if (has('free', 'trial', 'no cost')) return 'The Free Studio costs \u20B90 per month. You get an AI-written basic website draft (Home, About and Contact), a live preview, and basic text and colour editing. It is a draft, not a published website.';
  if (has('source', 'export', 'code')) return 'Source-code export is \u20B9999 per project. It is coming soon, so it is not available yet.';
  if (has('chatbot', 'chat bot', 'assistant', 'bot')) return 'AI chatbot integration starts at \u20B91,499 and can go up to \u20B94,999 or more depending on what it needs to do. It works on an existing website, answers common questions and collects enquiries. AI usage fees from the model provider may apply separately.';
  if (has('maintenance', 'update', 'support')) return 'Basic website maintenance is \u20B9499 per month and covers a set number of small content updates, agreed in your quote. New pages and redesigns are priced separately.';
  if (has('3d', 'parallax', 'animation')) return 'Parallax effects are \u20B9999 as an add-on and are included in the Premium package. A basic 3D element is \u20B91,499. Advanced 3D work is quoted separately.';
  if (has('premium')) return 'The Premium website is \u20B97,999: up to 5 pages, premium visual design, parallax effects, advanced interactions, basic SEO and 2 revision rounds.';
  if (has('business website', 'business package')) return 'The Business website is \u20B94,999: up to 5 pages, custom colours and branding, a contact form with WhatsApp, basic SEO, simple animations and 2 revision rounds.';
  if (has('starter')) return 'The Starter website is \u20B92,999: up to 3 pages, mobile-friendly design, a contact or WhatsApp button, basic customisation and 1 revision round.';
  if (has('hosting', 'domain')) return 'Domain registration and hosting are not included in our prices. They are usually a small yearly cost and stay in your name. We can help you choose.';
  if (has('revision', 'extra page')) return 'An extra page is \u20B9400 and an extra revision round is \u20B9300. You can add them in the enquiry form.';
  if (has('price', 'cost', 'how much', 'pricing', 'package', 'plan', 'rate', 'charge')) return 'Custom websites start at \u20B92,999 (Starter), \u20B94,999 (Business) and \u20B97,999 (Premium). An AI chatbot starts at \u20B91,499 and maintenance is \u20B9499 per month. These are starting prices; we confirm the final quote after your enquiry.';
  if (has('contact', 'enquiry', 'enquire', 'quote', 'hire', 'talk', 'start')) return 'The easiest way is the Start a conversation page. Choose a package and extras, see your estimate, and send us your details. We reply with a confirmed quote.';
  if (has('service', 'offer', 'what do you', 'do you do', 'help')) return 'We offer four things: a free AI basic website draft, custom websites, AI chatbot integration for existing sites, and website maintenance. Which one are you interested in?';
  return 'I can help with our services and pricing. Try asking about the free plan, website packages, the chatbot, or maintenance. For anything specific to your project, the enquiry page is the best place to start.';
}

export default function Robot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]); // {role: 'user' | 'assistant', content}
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launchRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) { setOpen(false); launchRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(q) {
    q = q.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: 'user', content: q }];
    setMsgs(next);
    setText('');
    setBusy(true);
    let answer;
    try {
      const out = await askAssistant(next);
      answer = out.reply;
    } catch {
      answer = localReply(q);
    }
    setMsgs([...next, { role: 'assistant', content: answer }]);
    setBusy(false);
  }

  return (
    <div className="fixed z-[80]" style={{ right: 'max(20px, env(safe-area-inset-right, 0px))', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B6CFF" /><stop offset="1" stopColor="#6C4DFF" />
          </linearGradient>
          <g id="robot">
            <line x1="32" y1="12" x2="32" y2="5" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="4.5" r="3" fill="#C4B5FD" />
            <rect x="5" y="26" width="6" height="12" rx="3" fill="#A78BFA" />
            <rect x="53" y="26" width="6" height="12" rx="3" fill="#A78BFA" />
            <rect x="10" y="12" width="44" height="35" rx="15" fill="url(#hg)" />
            <rect x="15" y="18" width="34" height="23" rx="10" fill="#130F26" />
            <ellipse className="eye" cx="25.5" cy="28" rx="3.4" ry="4.4" fill="#C4B5FD" />
            <ellipse className="eye" cx="38.5" cy="28" rx="3.4" ry="4.4" fill="#C4B5FD" />
            <path d="M27 35.5q5 3 10 0" fill="none" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="28" y="47" width="8" height="4" rx="1.5" fill="#6C4DFF" />
            <rect x="20" y="51" width="24" height="11" rx="5.5" fill="#8B6CFF" />
            <circle cx="32" cy="56.5" r="2.6" fill="#C4B5FD" />
          </g>
        </defs>
      </svg>

      {open && (
        <div
          className="chatbox absolute bottom-[88px] right-0 flex flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_24px_70px_rgba(0,0,0,.45)]"
          style={{ width: 'min(380px, calc(100vw - 40px))', height: 'min(540px, calc(100vh - 150px))' }}
          role="dialog"
          aria-label="TheBytely Assistant"
        >
          <div className="flex items-center gap-3 px-4 py-3.5 text-white" style={{ background: 'linear-gradient(135deg,#3b2a8f,#6C4DFF)' }}>
            <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true"><use href="#robot" /></svg>
            <div>
              <b className="block font-head">TheBytely Assistant</b>
              <small className="flex items-center gap-1.5 opacity-90"><i className="h-2 w-2 rounded-full bg-[#7CE7B0]" />Online, here to help</small>
            </div>
          </div>
          <div ref={listRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4" aria-live="polite">
            <div className="m b">{GREETING}</div>
            {msgs.map((m, i) => (
              <div key={i} className={`m ${m.role === 'user' ? 'u' : 'b'}`}>{m.content}</div>
            ))}
            {busy && <div className="m b" aria-label="The assistant is typing">&hellip;</div>}
          </div>
          {msgs.length === 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2.5">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-line bg-transparent px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-panel2">{q}</button>
              ))}
            </div>
          )}
          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={(e) => { e.preventDefault(); send(text); }}
          >
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about services or pricing"
              aria-label="Your message"
              autoComplete="off"
              maxLength={300}
              className="!min-h-[44px] !rounded-full !px-4 !py-2.5"
            />
            <button type="submit" disabled={busy} aria-label="Send" className="grid h-[46px] w-[46px] flex-none place-items-center rounded-full bg-primary text-white disabled:opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
            </button>
          </form>
        </div>
      )}

      <button
        ref={launchRef}
        type="button"
        className={`launch ${open ? 'open' : ''}`}
        aria-label={open ? 'Close TheBytely Assistant' : 'Open TheBytely Assistant'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="st" />
        {open ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg width="46" height="46" viewBox="0 0 64 64" aria-hidden="true"><use href="#robot" /></svg>
        )}
      </button>
    </div>
  );
}
