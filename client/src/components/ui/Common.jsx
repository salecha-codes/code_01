import { Activity, ArrowUpRight, Inbox, LoaderCircle, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="ClubPulse home">
      <span className="brand-icon">
        <Activity size={23} />
      </span>
      <span>
        clubpulse<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state" role="status">
      <LoaderCircle className="spin" size={25} />
      <p>{label}</p>
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="state error-state" role="alert">
      <p>{message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({ title = 'Nothing here yet', message, children }) {
  return (
    <div className="state">
      <span className="empty-icon">
        <Inbox size={25} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {children}
    </div>
  );
}
export function Rating({ value }) {
  return (
    <span className={`rating-pill rating-${value}`}>
      <Star size={12} fill="currentColor" />
      {value}
      <span>/ 5</span>
    </span>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function SectionTitle({ title, subtitle, link }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {link && (
        <Link className="text-link" to={link.to}>
          {link.label}
          <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}
