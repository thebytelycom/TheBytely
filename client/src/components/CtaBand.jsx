import { Link } from 'react-router-dom';

export default function CtaBand({ title, text, primary, secondary }) {
  return (
    <div className="band">
      <div><h2>{title}</h2><p>{text}</p></div>
      <div className="flex flex-wrap gap-3">
        <Link className="btn btn-primary" to={primary.to}>{primary.label}</Link>
        {secondary && <Link className="btn btn-ghost" to={secondary.to}>{secondary.label}</Link>}
      </div>
    </div>
  );
}
