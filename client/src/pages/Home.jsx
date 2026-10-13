import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Par from '../components/Par.jsx';
import Builder from '../components/Builder.jsx';
import CtaBand from '../components/CtaBand.jsx';
import HashLink from '../components/HashLink.jsx';

const SERVICES = [
  { to: '/hire#diy', tag: 'Free to try', title: 'DIY website', text: 'Create a basic website draft with AI, then edit the text and colours yourself.',
    icon: <><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" /></> },
  { to: '/hire#custom', tag: 'From ₹2,999', title: 'Custom website + AI', text: 'A website designed around your brand, built and finished by our team.',
    icon: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></> },
  { to: '/hire#chatbot', tag: 'From ₹1,499', title: 'AI chatbot integration', text: 'Add an assistant to your existing website that answers questions and collects enquiries.',
    icon: <><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1.1-4.5A8 8 0 1121 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></> },
  { to: '/hire#maintenance', tag: '₹499 per month', title: 'Website maintenance', text: 'Small updates and regular care so your site stays fresh without the hassle.',
    icon: <><path d="M14.7 6.3a4 4 0 005 5L21 13l-8 8-4-4 8-8z" transform="translate(-2 -2)" /><path d="M5 19l4-4" /></> },
];

const STEPS = [
  ['Tell us your idea', 'Share your business name, what you sell and the look you like. It takes about a minute.'],
  ['Let AI shape a start', 'Get a headline, intro and call to action written for your business, shown in a live preview.'],
  ['Make it yours', 'Tweak the text and colours yourself, or ask our team to build and polish the full site.'],
];

export default function Home() {
  const mockRef = useRef(null);
  const onMove = (e) => {
    if (!window.matchMedia('(pointer:fine)').matches || !mockRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    mockRef.current.style.setProperty('--ry', `${(-8 + x * 12).toFixed(1)}deg`);
    mockRef.current.style.setProperty('--rx', `${(4 - y * 10).toFixed(1)}deg`);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-24 pt-[72px]" onMouseMove={onMove}>
        <Par depth={0.04} className="gridlines" />
        <Par depth={0.06} className="orb right-[-60px] top-[-80px] h-[420px] w-[420px]" style={{ background: 'radial-gradient(circle,rgba(108,77,255,.55),transparent 70%)' }} />
        <Par depth={0.1} className="orb bottom-[-60px] left-[30%] h-[320px] w-[320px]" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.35),transparent 70%)' }} />
        <div className="wrap grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="kicker">AI-powered websites for small businesses in India</p>
            <h1 style={{ background: 'linear-gradient(120deg,var(--text) 30%,var(--glow) 95%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Your next website starts with a better idea.
            </h1>
            <p className="lead">Describe your business and get a first draft of your website in seconds. Want it built properly? Our team designs it for you, from ₹2,999.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <HashLink className="btn btn-primary" to="/#builder">Build with AI</HashLink>
              <Link className="btn btn-ghost" to="/hire">Explore services</Link>
            </div>
          </div>
          <div className="relative h-[420px] lg:h-[480px]" aria-hidden="true">
            <Par depth={0.12} className="absolute left-[6%] top-[30px] w-[88%] max-w-[380px]">
              <div className="float">
                <div className="mock" ref={mockRef}>
                  <div className="bar"><i /><i /><i /><span /></div>
                  <div className="p-5">
                    <div className="font-head text-[1.3rem] font-bold">Maison Aarav</div>
                    <div className="mb-3.5 text-sm text-muted">Handcrafted jewellery from Jaipur</div>
                    <span className="btn btn-primary btn-sm pointer-events-none">View collection</span>
                    <div className="row"><div /><div /><div /></div>
                  </div>
                </div>
              </div>
            </Par>
            <Par depth={0.22} className="absolute right-0 top-1.5"><div className="float d2"><div className="chip"><b className="h-2 w-2 rounded-full bg-[#7CE7B0] shadow-[0_0_10px_#7CE7B0]" />AI-powered</div></div></Par>
            <Par depth={0.3} className="absolute bottom-[78px] left-0"><div className="float d3"><div className="chip">Live preview</div></div></Par>
            <Par depth={0.18} className="absolute bottom-[18px] right-[2%]">
              <div className="float d2"><div className="bubble"><small className="mb-0.5 block font-bold text-glow">TheBytely Assistant</small>Hi! Want a quick price for your website?</div></div>
            </Par>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-y border-line bg-panel py-7">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-7 gap-y-3.5">
          <span className="text-muted">Made for people starting and growing online</span>
          <ul className="flex flex-wrap gap-2.5">
            {['Creators', 'Small businesses', 'New ventures', 'Growing brands'].map((t) => (
              <li key={t} className="rounded-full border border-line px-4 py-1.5 text-[0.94rem] font-medium">{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* How it works */}
      <section className="sec" id="how">
        <div className="wrap">
          <h2>From idea to website in three steps</h2>
          <p className="lead">Start on your own with the free AI builder, or hand it to us at any point.</p>
          <div className="mt-11 grid gap-6 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <div key={title} className="rounded-[22px] border border-line bg-panel p-7">
                <div className="mb-[18px] grid h-[42px] w-[42px] place-items-center rounded-full font-head font-bold text-white" style={{ background: 'linear-gradient(135deg,var(--primary),var(--lav))' }}>{i + 1}</div>
                <h3>{title}</h3>
                <p className="mb-0 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="sec !pt-10" id="services">
        <div className="wrap">
          <h2>Four ways we can help</h2>
          <p className="lead">Pick one, or combine them as your business grows.</p>
          <div className="mt-11 grid gap-[22px] md:grid-cols-2">
            {SERVICES.map((s) => (
              <Link key={s.title} to={s.to} className="card">
                <div className="ic">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <span className="text-sm font-medium text-glow">{s.tag}</span>
                <h3>{s.title}</h3>
                <p className="mb-2.5 text-muted">{s.text}</p>
                <span className="mt-auto font-semibold text-glow">See details</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI builder */}
      <section className="sec" id="builder" style={{ background: 'linear-gradient(180deg,transparent,var(--panel) 12%,var(--panel) 88%,transparent)' }}>
        <div className="wrap">
          <h2>Try the AI website builder</h2>
          <p className="lead">Fill in a few details and see a basic website with Home, About and Contact pages. Edit the text and colours right here.</p>
          <Builder />
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="sec">
        <div className="wrap">
          <h2>Simple pricing, no surprises</h2>
          <p className="lead">Prices start low so a small business can get online without a big budget.</p>
          <div className="mt-11 grid gap-[22px] lg:grid-cols-3">
            <div className="price">
              <h3>Free Studio</h3>
              <div className="amt">₹0<small> / month</small></div>
              <div className="mb-1.5 text-muted">Try the AI builder at no cost</div>
              <ul className="ticks"><li>AI-written basic website</li><li>Live preview of 3 pages</li><li>Edit text and colours</li></ul>
              <HashLink className="btn btn-ghost" to="/#builder">Try it free</HashLink>
            </div>
            <div className="price pop">
              <span className="badge">Most popular</span>
              <h3>Custom website</h3>
              <div className="amt"><small>from </small>₹2,999</div>
              <div className="mb-1.5 text-muted">Designed and built by our team</div>
              <ul className="ticks"><li>Mobile-friendly design</li><li>WhatsApp and contact buttons</li><li>Revision rounds included</li></ul>
              <Link className="btn btn-primary" to="/pricing">See all packages</Link>
            </div>
            <div className="price">
              <h3>AI chatbot</h3>
              <div className="amt"><small>from </small>₹1,499</div>
              <div className="mb-1.5 text-muted">Works on your existing website</div>
              <ul className="ticks"><li>Answers common questions</li><li>Collects visitor enquiries</li><li>Trained on your business info</li></ul>
              <Link className="btn btn-ghost" to="/hire#chatbot">Learn more</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="wrap">
          <CtaBand
            title="Good ideas deserve a better place online."
            text="Tell us about your project and get a confirmed quote."
            primary={{ to: '/enquiry', label: 'Start a conversation' }}
            secondary={{ to: '/hire', label: 'How we work' }}
          />
        </div>
      </section>
    </>
  );
}
