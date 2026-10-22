import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Brand } from '../ui/Common';
export default function PublicLayout() {
  return (
    <div className="public-shell">
      <header className="public-nav">
        <Brand />
        <nav aria-label="Main navigation">
          <NavLink to="/feedback" className="nav-feedback">
            Share feedback
          </NavLink>
          <Link className="button secondary small" to="/admin/login">
            Admin login
            <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="public-footer">
        <Brand />
        <span>Better events start with honest conversations.</span>
        <span>
          <ShieldCheck size={14} />
          Your voice. Your privacy.
        </span>
      </footer>
    </div>
  );
}
