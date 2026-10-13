import { Link } from 'react-router-dom';
import Par from '../components/Par.jsx';
import CtaBand from '../components/CtaBand.jsx';
import HashLink from '../components/HashLink.jsx';

function Service({ id, title, lead, body, from, actions, boxes }) {
  return (
    <div id={id} className="grid items-start gap-6 border-t border-line py-[60px] first:border-t-0 md:grid-cols-2 md:gap-12">
      <div>
        <h2>{title}</h2>
        <p className="lead">{lead}</p>
        <p className="text-muted">{body}</p>
        <div className="my-4 font-head text-xl font-bold">{from}</div>
        <div className="flex flex-wrap gap-3">{actions}</div>
      </div>
      <div className="panel !rounded-[22px]">
        {boxes.map(([heading, items]) => (
          <div key={heading}>
            <h4 className="!mb-3 !text-base text-glow">{heading}</h4>
            <ul className="ticks">{items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  ['Send an enquiry', 'Pick a package and any add-ons, and tell us about your business.'],
  ['Get a confirmed quote', 'We reply with scope, timeline, revision limits and payment terms in writing.'],
  ['We design and build', 'You see the work, share feedback, and we refine it within your revision rounds.'],
  ['Launch and support', 'We help you go live, and you can add maintenance if you want ongoing help.'],
];

const FAQ = [
  ['Are domain and hosting included?', 'No. You buy a domain name and hosting yourself, or we can help you choose. These are usually a modest yearly cost and stay in your name.'],
  ['Are the prices final?', 'They are starting prices. After you send an enquiry, we confirm the exact price once we understand what you need. Taxes, where they apply, are shown clearly in the quote.'],
  ['What if I need more than the package includes?', 'Extra pages (₹400 each) and extra revisions (₹300 each) can be added anytime. Bigger requests are quoted separately.'],
  ['Can I add a chatbot to a site you did not build?', 'Yes. The chatbot is a separate service and works with most existing websites.'],
  ['Does the free AI builder make a full website?', 'It makes a basic three-page draft: Home, About and Contact. Animations, a chatbot, online payments and extra pages are paid services built by our team.'],
];

export default function Hire() {
  return (
    <>
      <div className="relative overflow-hidden pb-7 pt-[72px]">
        <Par depth={0.08} className="orb right-[10%] top-[-160px] h-[420px] w-[420px]" style={{ background: 'radial-gradient(circle,rgba(108,77,255,.5),transparent 70%)' }} />
        <Par depth={0.05} className="gridlines" />
        <div className="wrap relative">
          <p className="kicker">Hire us</p>
          <h1 className="!text-[clamp(2rem,4.4vw,3.2rem)]">Everything we do, explained plainly</h1>
          <p className="lead">Here is what each service includes, who it suits, and what is not covered, so you know exactly what you are paying for.</p>
        </div>
      </div>

      <div className="wrap">
        <Service
          id="diy" title="DIY website"
          lead="For when you want to start on your own. Describe your business and the AI writes your first draft."
          body="It works best as a starting point: you get the words and a preview, then adjust the text and colours to suit you. When you are ready for something more complete, our team can pick up from there."
          from="Free Studio: ₹0 / month"
          actions={<HashLink className="btn btn-primary" to="/#builder">Try the AI builder</HashLink>}
          boxes={[
            ['What you get', ['A basic website with Home, About and Contact pages', 'AI-written headline, intro and text', 'Live preview and basic text and colour editing']],
            ['Good to know', ['The AI builder only makes basic websites', 'It is a draft, not a published website', 'Source-code export (₹999 per project) is coming soon']],
          ]}
        />
        <Service
          id="custom" title="Custom website + AI"
          lead="A real website, designed around your brand and built by our team."
          body="We use AI to move faster on structure and copy, and people to make sure it looks right and works well on a phone, where most of your customers will see it. Choose a package that fits your size and add only what you need."
          from="From ₹2,999"
          actions={<><Link className="btn btn-primary" to="/enquiry?pkg=business">Get a quote</Link><Link className="btn btn-ghost" to="/pricing">Compare packages</Link></>}
          boxes={[
            ['What you get', ['Responsive design that works on every screen', 'Layout and content written for your business', 'Contact form and WhatsApp button', 'Your brand colours and fonts', 'Basic SEO setup (Business and Premium)', 'Revision rounds within your package']],
            ['Quoted separately', ['Advanced 3D experiences', 'Complex integrations and custom features']],
          ]}
        />
        <Service
          id="chatbot" title="AI chatbot integration"
          lead="Add a friendly assistant to your website, even if we did not build it."
          body="The chatbot answers common questions, explains your products and prices, and collects enquiries so you do not miss customers outside working hours. It only answers from information you approve, so it will not make things up about your business."
          from="From ₹1,499 (up to ₹4,999+ for complex setups)"
          actions={<Link className="btn btn-primary" to="/enquiry?pkg=none&addon=chatbot">Ask about a chatbot</Link>}
          boxes={[
            ['Works well for', ['Jewellery and retail store FAQs', 'Salon service and appointment questions', 'Restaurant menu and opening hours', 'Coaching and education enquiries']],
            ['Good to know', ['AI usage fees from the model provider can apply separately', 'Final price depends on how much it needs to do']],
          ]}
        />
        <Service
          id="maintenance" title="Website maintenance"
          lead="Keep your site fresh without having to learn how to update it."
          body="Send us changes like new prices, photos or opening hours and we update your site each month. The exact number of small updates is agreed with you up front so expectations are clear on both sides."
          from="₹499 per month"
          actions={<Link className="btn btn-primary" to="/enquiry?pkg=none&addon=maintenance">Add maintenance</Link>}
          boxes={[
            ['What you get', ['A set number of small content updates each month', 'Help with changes to text, images and contact details', 'One person to ask when something looks off']],
            ['Not included', ['New pages and large redesigns (priced separately)', 'Hosting and domain renewal']],
          ]}
        />

        <h2 className="mt-10">How a project works</h2>
        <div className="tl mt-9 max-w-[720px]">
          {STEPS.map(([t, d], i) => (
            <div key={t} data-n={i + 1}><h4>{t}</h4><p>{d}</p></div>
          ))}
        </div>

        <h2 className="mt-14">Common questions</h2>
        <div className="mt-5 max-w-[760px]">
          {FAQ.map(([q, a]) => (
            <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>

        <div className="pb-24 pt-[70px]">
          <CtaBand title="Ready to talk about your project?" text="It takes two minutes and you get a quote, not a sales call." primary={{ to: '/enquiry', label: 'Start an enquiry' }} />
        </div>
      </div>
    </>
  );
}
