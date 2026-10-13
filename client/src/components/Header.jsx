import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import HashLink from './HashLink.jsx';
import Logo from './Logo.jsx';

const base = 'rounded-full px-3.5 py-2 text-[0.96rem] font-medium no-underline transition-colors hover:bg-panel2 hover:text-ink max-md:py-3.5';
const idle = 'text-muted';
const active = 'bg-panel2 text-ink';

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const cls = ({ isActive }) => `${base} ${isActive ? active : idle}`;

  return (
    <header
      className="sticky z-50 border-b border-line backdrop-blur-[14px]"
      style={{ top: 'env(safe-area-inset-top, 0px)', background: 'color-mix(in srgb, var(--bg) 78%, transparent)' }}
    >
      <div className="wrap flex h-[68px] items-center justify-between gap-4">
        <Logo />
        <button
          type="button"
          className="hidden h-11 w-11 place-items-center rounded-xl border border-line text-ink max-md:grid"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mainnav"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <nav
          id="mainnav"
          aria-label="Main"
          className={`items-center gap-1.5 md:flex max-md:absolute max-md:left-0 max-md:right-0 max-md:top-[68px] max-md:flex-col max-md:items-stretch max-md:border-b max-md:border-line max-md:bg-bg max-md:px-6 max-md:pb-5 max-md:pt-3 ${open ? 'max-md:flex' : 'max-md:hidden'}`}
        >
          <HashLink to="/#how" className={`${base} ${idle}`} onClick={close}>How it works</HashLink>
          <HashLink to="/#services" className={`${base} ${idle}`} onClick={close}>Services</HashLink>
          <NavLink to="/pricing" className={cls} onClick={close}>Pricing</NavLink>
          <NavLink to="/hire" className={cls} onClick={close}>Hire us</NavLink>
          <HashLink to="/#builder" className="btn btn-primary btn-sm md:ml-1.5 max-md:mt-2" onClick={close}>Start free</HashLink>
        </nav>
      </div>
    </header>
  );
}
