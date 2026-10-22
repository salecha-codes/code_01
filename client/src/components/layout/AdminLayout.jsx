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
} from 'lucide-react';
import { toast } from 'sonner';
import { Brand, Dialog } from '../ui/Common';
import { useAuth } from '../../context/AuthContext';
const items = [
  [LayoutDashboard, 'Overview', '/admin'],
  [MessageSquare, 'Feedback', '/admin/feedback'],
  [CalendarDays, 'Events', '/admin/events'],
];
function WorkspaceNavigation({ admin, busy, onSignOut, onNavigate }) {
  return (
    <>
      <div className="workspace-identity">
        <span className="workspace-avatar">C</span>
        <div>
          <strong>Club workspace</strong>
          <span>Organizer workspace</span>
        </div>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Admin navigation">
        {items.map(([Icon, label, to]) => (
          <NavLink end={to === '/admin'} key={to} to={to} onClick={onNavigate}>
            <Icon size={18} />
            <span>{label}</span>
            <span className="nav-active-dot" />
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link className="portal-link" to="/feedback" onClick={onNavigate}>
          <ArrowUpRight size={17} />
          <span>Open feedback portal</span>
        </Link>
        <div className="sidebar-note">
          <ShieldCheck size={17} />
          <p>
            Feedback stays anonymous.
            <br />
            Insights stay in your hands.
          </p>
        </div>
        <div className="admin-profile">
          <span className="profile-avatar">{admin.email[0].toUpperCase()}</span>
          <div>
            <strong>Administrator</strong>
            <span title={admin.email}>{admin.email}</span>
          </div>
          <button className="icon-button" onClick={onSignOut} disabled={busy} aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
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
  const navProps = { admin, busy, onSignOut: signOut, onNavigate: () => setOpen(false) };
  return (
    <div className="admin-shell">
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-brand">
          <Brand />
        </div>
        <WorkspaceNavigation {...navProps} />
      </aside>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="ClubPulse workspace"
        className="navigation-dialog"
        closeLabel="Close navigation"
      >
        <WorkspaceNavigation {...navProps} />
      </Dialog>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="breadcrumbs">
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
          <div className="topbar-right">
            <span className="private-workspace">
              <ShieldCheck size={14} />
              Private workspace
            </span>
            <Link className="text-link" to="/feedback">
              Public portal
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </header>
        <main id="main-content" className="admin-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="admin-footer">
          <span>ClubPulse</span>
          <span>Thoughtful feedback. Better experiences.</span>
        </footer>
      </div>
    </div>
  );
}
