import { Link, useLocation } from 'react-router-dom';

// A Link that also scrolls when you are already on the target page.
export default function HashLink({ to, onClick, children, ...rest }) {
  const loc = useLocation();
  const handle = (e) => {
    const [path, hash] = to.split('#');
    if (hash && (path || '/') === loc.pathname) {
      const el = document.getElementById(hash);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', to);
      }
    }
    if (onClick) onClick(e);
  };
  return <Link to={to} onClick={handle} {...rest}>{children}</Link>;
}
