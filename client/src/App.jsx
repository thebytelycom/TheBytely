import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Robot from './components/Robot.jsx';
import Home from './pages/Home.jsx';
import Hire from './pages/Hire.jsx';
import Pricing from './pages/Pricing.jsx';
import Enquiry from './pages/Enquiry.jsx';
import { useParallax } from './lib/useParallax.js';

const TITLES = {
  '/': 'TheBytely: AI-powered websites for small businesses',
  '/hire': 'Hire us | TheBytely',
  '/pricing': 'Pricing | TheBytely',
  '/enquiry': 'Start a conversation | TheBytely',
};

export default function App() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = TITLES[pathname] || TITLES['/'];
    const t = setTimeout(() => {
      const el = hash ? document.getElementById(hash.slice(1)) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    }, 40);
    return () => clearTimeout(t);
  }, [pathname, hash]);

  useParallax(pathname);

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hire" element={<Hire />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <Robot />
    </>
  );
}
