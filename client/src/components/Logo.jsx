import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-head text-xl font-bold no-underline" aria-label="TheBytely home">
      <span
        className="grid h-[34px] w-[34px] place-items-center rounded-[11px] shadow-[0_6px_18px_rgba(108,77,255,.45)]"
        style={{ background: 'linear-gradient(135deg,var(--primary),var(--lav))' }}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />
        </svg>
      </span>
      TheBytely
    </Link>
  );
}
