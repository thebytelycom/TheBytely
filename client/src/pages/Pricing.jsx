import { Link } from 'react-router-dom';
import Par from '../components/Par.jsx';
import CtaBand from '../components/CtaBand.jsx';

const PACKS = [
  { id: 'starter', name: 'Starter', amt: '₹2,999', who: 'Portfolios and simple business sites', items: ['Up to 3 pages', 'Mobile-friendly design', 'Contact or WhatsApp button', 'Basic customisation', '1 revision round'] },
  { id: 'business', name: 'Business', amt: '₹4,999', who: 'Growing businesses that need a full presence', pop: true, items: ['Up to 5 pages', 'Custom colours and branding', 'Contact form and WhatsApp', 'Basic SEO setup', 'Simple animations', '2 revision rounds'] },
  { id: 'premium', name: 'Premium', amt: '₹7,999', who: 'Brands that want a polished, interactive site', items: ['Up to 5 pages', 'Premium visual design', 'Parallax effects included', 'Advanced interactions', 'Basic SEO setup', '2 revision rounds'] },
];

const ADDONS = [
  ['AI chatbot integration', 'Per project', '₹1,499'],
  ['Parallax effects', 'Per project', '₹999'],
  ['Basic 3D element', 'Per project', '₹1,499'],
  ['Extra website page', 'Per page', '₹400'],
  ['Extra revision', 'Per revision', '₹300'],
  ['Basic website maintenance', 'Per month', '₹499'],
];

export default function Pricing() {
  return (
    <>
      <div className="relative overflow-hidden pb-7 pt-[72px]">
        <Par depth={0.08} className="orb right-[10%] top-[-120px] h-[320px] w-[320px]" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.4),transparent 70%)' }} />
        <Par depth={0.05} className="gridlines" />
        <div className="wrap relative">
          <p className="kicker">Pricing</p>
          <h1 className="!text-[clamp(2rem,4.4vw,3.2rem)]">Priced for small businesses</h1>
          <p className="lead">All prices are starting prices in Indian rupees. Your final quote is confirmed in writing before any work begins.</p>
        </div>
      </div>

      <div className="wrap">
        <div className="mt-7 grid gap-[22px] lg:grid-cols-3">
          {PACKS.map((p) => (
            <div key={p.id} className={`price ${p.pop ? 'pop' : ''}`}>
              {p.pop && <span className="badge">Best value</span>}
              <h3>{p.name}</h3>
              <div className="amt">{p.amt}</div>
              <div className="mb-1.5 text-muted">{p.who}</div>
              <ul className="ticks">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <Link className={`btn ${p.pop ? 'btn-primary' : 'btn-ghost'}`} to={`/enquiry?pkg=${p.id}`}>Choose {p.name}</Link>
            </div>
          ))}
        </div>

        <h2 className="mt-20">Platform services</h2>
        <div className="tw">
          <table>
            <thead><tr><th>Service</th><th>What it covers</th><th className="r">Price</th></tr></thead>
            <tbody>
              <tr><td>Free Studio</td><td>AI-written basic website (Home, About, Contact), live preview, basic text and colour editing</td><td className="r">₹0 / month</td></tr>
              <tr><td>Source-code export <span className="soon">Coming soon</span></td><td>Per supported website project</td><td className="r">₹999 one-time</td></tr>
              <tr><td>AI chatbot integration</td><td>Depends on complexity and what it needs to connect to</td><td className="r">₹1,499 to ₹4,999+</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-16">Add-ons</h2>
        <div className="tw">
          <table>
            <thead><tr><th>Add-on</th><th>Billing</th><th className="r">From</th></tr></thead>
            <tbody>{ADDONS.map(([a, b, c]) => <tr key={a}><td>{a}</td><td>{b}</td><td className="r">{c}</td></tr>)}</tbody>
          </table>
        </div>

        <h2 className="mt-16">Before you decide</h2>
        <ul className="ticks mt-[18px] max-w-[720px]">
          <li>Domain registration and hosting are not included.</li>
          <li>Paid AI usage and third-party subscriptions may cost extra.</li>
          <li>Advanced 3D, complex automation and custom integrations are assessed and quoted separately.</li>
          <li>Maintenance covers a set number of small updates each month, agreed in your quote.</li>
          <li>Your quote lists scope, timeline, revision limits, payment terms and any applicable taxes.</li>
        </ul>

        <div className="pb-24 pt-[60px]">
          <CtaBand title="Not sure what you need?" text="Build a package in our enquiry form and see your estimated total as you go." primary={{ to: '/enquiry', label: 'Build your estimate' }} />
        </div>
      </div>
    </>
  );
}
