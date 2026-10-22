import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Brand } from '../ui/Common';
import { useAuth } from '../../context/AuthContext';
export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname.endsWith('/feedback')
    ? 'Feedback'
    : location.pathname.endsWith('/events')
      ? 'Events'
      : 'Overview';
  async function signOut() {
    setBusy(true);
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-shell">
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-only"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-avatar">C</span>
          <div>
            <strong>Club workspace</strong>
            <span>Administrator</span>
          </div>
          <ShieldCheck size={16} />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {[
            [LayoutDashboard, 'Overview', '/admin'],
            [MessageSquare, 'Feedback', '/admin/feedback'],
            [CalendarDays, 'Events', '/admin/events'],
          ].map(([Icon, label, to]) => (
            <NavLink end={to === '/admin'} key={to} to={to} onClick={() => setOpen(false)}>
              <Icon size={18} />
              {label}
              <ChevronRight className="nav-chevron" size={14} />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <ShieldCheck size={19} />
            <strong>Honest by design.</strong>
            <p>No student accounts. No names attached. Just feedback that matters.</p>
            <Link to="/feedback">
              Open feedback portal
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="admin-profile">
            <span className="profile-avatar">{admin.email[0].toUpperCase()}</span>
            <div>
              <strong>Club administrator</strong>
              <span title={admin.email}>{admin.email}</span>
            </div>
            <button className="icon-button" onClick={signOut} disabled={busy} aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="icon-button mobile-only"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{current}</strong>
          </div>
          <Link to="/feedback">
            View public portal
            <ArrowUpRight size={15} />
          </Link>
        </header>
        <main id="main-content" className="admin-content">
          <Outlet />
        </main>
        <footer className="admin-footer">
          ClubPulse <span>Built for communities that listen.</span>
        </footer>
      </div>
    </div>
  );
}
