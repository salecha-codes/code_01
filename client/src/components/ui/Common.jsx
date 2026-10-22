import { useEffect, useId, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Info,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Star,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="ClubPulse home">
      <span className="brand-icon">
        <Activity size={22} strokeWidth={2} />
      </span>
      <span>
        ClubPulse<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Button({
  to,
  href,
  variant = 'primary',
  size,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const classes = `button ${variant} ${size || ''} ${className}`;
  if (to)
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="spin" />}
      {children}
    </button>
  );
}
export function Card({ as: Component = 'section', className = '', children, ...props }) {
  return (
    <Component className={`panel ${className}`} {...props}>
      {children}
    </Component>
  );
}
export function Badge({ children, tone = 'neutral', dot = false }) {
  return (
    <span className={`badge ${tone}`}>
      {dot && <span className="status-dot" />}
      {children}
    </span>
  );
}
export function Field({ id, label, required, optional, hint, children }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
        {optional && <span className="optional">Optional</span>}
      </label>
      {children}
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
export function Select({ children, className = '', ...props }) {
  return (
    <div className={`select-wrap ${className}`}>
      <select {...props}>{children}</select>
      <ChevronDown size={16} aria-hidden="true" />
    </div>
  );
}
export function Input({ icon: Icon, ...props }) {
  return Icon ? (
    <div className="input-with-icon">
      <Icon size={17} aria-hidden="true" />
      <input {...props} />
    </div>
  ) : (
    <input {...props} />
  );
}
export function Textarea(props) {
  return <textarea {...props} />;
}
export function Table({ caption, children, ...props }) {
  return (
    <table {...props}>
      <caption className="sr-only">{caption}</caption>
      {children}
    </table>
  );
}
export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state loading-state" role="status">
      <LoaderCircle className="spin" size={23} />
      <p>{label}</p>
    </div>
  );
}
export function Skeleton({ kind = 'rows', label = 'Loading…', count = 3 }) {
  return (
    <div className={`skeleton-group skeleton-${kind}`} role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-item" aria-hidden="true" key={index}>
          <span className="skeleton-line short" />
          <span className="skeleton-line" />
          <span className="skeleton-line medium" />
        </div>
      ))}
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="state error-state" role="alert">
      <span className="state-icon">
        <CircleAlert size={24} />
      </span>
      <h3>Something didn’t load</h3>
      <p>{message}</p>
      {retry && (
        <Button variant="secondary" size="small" onClick={retry}>
          <RefreshCw size={15} />
          Try again
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  title = 'Nothing here yet',
  message,
  children,
  compact = false,
  icon: Icon = Inbox,
}) {
  return (
    <div className={`state empty-state ${compact ? 'compact' : ''}`}>
      <span className="state-icon">
        <Icon size={24} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {children}
    </div>
  );
}
export function Rating({ value }) {
  return (
    <span className={`rating-pill rating-${value}`} aria-label={`${value} out of 5 stars`}>
      <Star size={13} fill="currentColor" aria-hidden="true" />
      {value}
      <span>/ 5</span>
    </span>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-actions">{action}</div>}
    </div>
  );
}
export function SectionTitle({ title, subtitle, link, children }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {link ? (
        <Link className="text-link" to={link.to}>
          {link.label}
          <ArrowUpRight size={15} />
        </Link>
      ) : (
        children
      )}
    </div>
  );
}
export function Tooltip({ label, children }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span
      className="tooltip-root"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="tooltip-trigger"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <Info size={14} />
      </button>
      {open && (
        <span className="tooltip-bubble" role="tooltip" id={id}>
          {children}
        </span>
      )}
    </span>
  );
}
export function StatCard({ icon: Icon, label, value, suffix, description, explanation }) {
  return (
    <article className="stat-card">
      <div className="stat-label">
        <span>{label}</span>
        <Icon size={17} aria-hidden="true" />
      </div>
      <strong>
        {value}
        {suffix && <small>{suffix}</small>}
      </strong>
      <div className="stat-description">
        <p>{description}</p>
        {explanation && <Tooltip label={`About ${label.toLowerCase()}`}>{explanation}</Tooltip>}
      </div>
    </article>
  );
}
// Native radio inputs supply keyboard selection without custom ARIA tab behavior.
export function Tabs({ label, options, value, onChange }) {
  const name = useId();
  return (
    <fieldset className="tabs">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label className={value === option.value ? 'selected' : ''} key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
          {option.count !== undefined && <span>{option.count}</span>}
        </label>
      ))}
    </fieldset>
  );
}
// Native dialog supplies an inert background; explicitly wrap Tab within its controls.
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  busy = false,
  className = '',
  closeLabel = 'Close dialog',
}) {
  const dialog = useRef(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    if (!element.open) element.showModal();
    element.querySelector('[data-dialog-autofocus]')?.focus();
    return () => {
      if (element.open) element.close();
      document.documentElement.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  function containTab(event) {
    if (event.key !== 'Tab') return;
    const controls = [
      ...event.currentTarget.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      ),
    ].filter((element) => element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) {
      event.preventDefault();
      return;
    }
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialog.current)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <dialog
      ref={dialog}
      className={`dialog ${className}`}
      aria-labelledby={`${id}-title`}
      aria-modal="true"
      onKeyDown={containTab}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.target === event.currentTarget &&
          (event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom) &&
          !busy
        )
          onClose();
      }}
    >
      <header className="dialog-header">
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          {description && <p id={`${id}-description`}>{description}</p>}
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label={closeLabel}
          onClick={onClose}
          disabled={busy}
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function StepLabel({ number, title, complete }) {
  return (
    <span className={`step-label ${complete ? 'complete' : ''}`}>
      <span>{complete ? <Check size={13} /> : number}</span>
      {title}
    </span>
  );
}
