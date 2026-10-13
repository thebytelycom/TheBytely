// Built-in writer used when the AI is not configured or is unavailable.
// It only ever produces basic website text.

const CATS = {
  'Jewellery': {
    label: 'jewellery brand', def: 'jewellery and gifts',
    headline: (n) => `${n}: jewellery made to be remembered`,
    line: 'Every piece is chosen with care, so you can buy with confidence.',
    cta: 'Get in touch',
    hl: [['Carefully chosen pieces', 'Each item is selected for quality and lasting beauty.'],
         ['Gifts for every occasion', 'Find something thoughtful for birthdays, weddings and festivals.'],
         ['Friendly guidance', 'Ask us about sizes, care and special requests.']],
  },
  'Fashion': {
    label: 'fashion label', def: 'clothing and accessories',
    headline: (n) => `Wear it your way with ${n}`,
    line: 'Fresh styles, honest quality and a fit that feels like you.',
    cta: 'Contact us',
    hl: [['Styles you will love', 'A thoughtful range that is easy to dress up or down.'],
         ['Quality you can feel', 'Good fabrics and careful finishing in every piece.'],
         ['Help with sizing', 'Message us and we will help you find the right fit.']],
  },
  'Beauty and wellness': {
    label: 'beauty and wellness studio', def: 'beauty and wellness services',
    headline: (n) => `Feel your best at ${n}`,
    line: 'Come in, relax and leave feeling refreshed and cared for.',
    cta: 'Contact us',
    hl: [['Treatments for you', 'Services chosen to suit your skin, hair and routine.'],
         ['A calm space', 'A welcoming place to unwind and take time for yourself.'],
         ['Honest advice', 'We recommend what works, not what is most expensive.']],
  },
  'Restaurant or café': {
    label: 'restaurant', def: 'fresh food and drinks',
    headline: (n) => `Good food and good company at ${n}`,
    line: 'Come hungry. Find our location and get in touch in a tap.',
    cta: 'Find us',
    hl: [['Made fresh', 'Dishes prepared with care from quality ingredients.'],
         ['Something for everyone', 'A menu that works for families, friends and quick bites.'],
         ['Easy to find', 'Visit us or call ahead to ask about timings.']],
  },
  'Technology': {
    label: 'technology company', def: 'practical technology solutions',
    headline: (n) => `${n} builds technology that works for you`,
    line: 'Clear communication, reliable delivery and support when you need it.',
    cta: 'Talk to us',
    hl: [['Built around your needs', 'We start by understanding the problem you want solved.'],
         ['Clear and honest', 'Plain-language updates, without the jargon.'],
         ['Support that stays', 'We are here after launch, not just before it.']],
  },
  'Consulting': {
    label: 'consultancy', def: 'expert consulting',
    headline: (n) => `Clear advice from ${n}`,
    line: 'Practical guidance that helps you make decisions and move forward.',
    cta: 'Book a conversation',
    hl: [['Practical advice', 'Recommendations you can act on straight away.'],
         ['Experience that helps', 'Guidance shaped by real work with real businesses.'],
         ['A simple start', 'Get in touch and tell us what you are working on.']],
  },
  'Education': {
    label: 'learning centre', def: 'courses and coaching',
    headline: (n) => `Learn with confidence at ${n}`,
    line: 'Supportive teaching and a clear path from where you are to where you want to be.',
    cta: 'Ask about courses',
    hl: [['Clear teaching', 'Lessons explained step by step, at a pace that works.'],
         ['Supportive guidance', 'Questions are welcome and help is always close by.'],
         ['Built for progress', 'Learn skills you can use straight away.']],
  },
  'Other business': {
    label: 'business', def: 'products and services',
    headline: (n) => `Meet ${n}`,
    line: 'Simple to understand, easy to reach and built around what you need.',
    cta: 'Get in touch',
    hl: [['What we offer', 'Products and services made with care for our customers.'],
         ['Easy to work with', 'Clear answers and friendly, prompt replies.'],
         ['Local and personal', 'A team that knows its customers and listens.']],
  },
};

const TONES = {
  'Luxury': 'refined, unhurried and made to last',
  'Minimal': 'clean, calm and easy to use',
  'Bold and modern': 'confident, sharp and impossible to miss',
  'Warm and friendly': 'warm, welcoming and personal',
  'Elegant': 'graceful, polished and quietly confident',
  'Playful': 'fun, colourful and full of energy',
};
const GALLERY = {
  'Jewellery': 'Our collection', 'Fashion': 'Our collection', 'Beauty and wellness': 'Our work',
  'Restaurant or café': 'From our kitchen', 'Technology': 'Our work', 'Consulting': 'Our work',
  'Education': 'Gallery', 'Other business': 'Our products',
};
export const galleryHeading = (type) => GALLERY[type] || 'Our products';
export function fallbackContent(brief) {
  const cat = CATS[brief.type] || CATS['Other business'];
  const prod = (brief.products || cat.def).replace(/\.+$/, '');
  const prodLower = prod.charAt(0).toLowerCase() + prod.slice(1);
  const where = brief.location ? ` in ${brief.location}` : '';
  return {
    businessName: brief.name,
    home: {
      headline: cat.headline(brief.name),
      intro: `${brief.name} offers ${prodLower}${where}, with a look that is ${TONES[brief.style]}. ${cat.line}`,
      ctaLabel: cat.cta,
            galleryHeading: galleryHeading(brief.type),
      highlights: cat.hl.map(([title, text]) => ({ title, text })),
    },
    about: {
      heading: `About ${brief.name}`,
      body: `${brief.name} is a ${cat.label}${brief.location ? ` based in ${brief.location}` : ''}. We offer ${prodLower}.\n\n${cat.line} Get in touch and tell us what you are looking for.`,
    },
    contact: {
      heading: 'Get in touch',
      text: 'Tell us what you need and we will get back to you.',
      address: brief.location || '',
      phone: '', email: '', whatsapp: '',
    },
  };
}
