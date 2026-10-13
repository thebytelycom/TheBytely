import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  const link = 'text-muted no-underline hover:text-ink';
  return (
    <footer className="border-t border-line bg-panel py-11 pb-14">
      <div className="wrap flex flex-wrap items-start justify-between gap-7">
        <div>
          <Logo />
          <p className="mt-3 text-muted">Good ideas deserve a better place online.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-1.5">
          <li><Link className={link} to="/hire">Services</Link></li>
          <li><Link className={link} to="/pricing">Pricing</Link></li>
          <li><Link className={link} to="/enquiry">Contact</Link></li>
        </ul>
        <div className="w-full border-t border-line pt-5 text-sm text-muted">
          &copy; {new Date().getFullYear()} TheBytely. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
