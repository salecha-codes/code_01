import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Menu, ShieldCheck } from 'lucide-react';
import { Brand, Button, Dialog } from '../ui/Common';
export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="public-shell">
      <header className="public-nav">
        <Brand />
        <nav className="public-desktop-nav" aria-label="Main navigation">
          <Link to="/#how-it-works">How it works</Link>
          <NavLink to="/feedback">Give feedback</NavLink>
          <Button variant="secondary" size="small" to="/admin/login">
            Admin login
            <ArrowUpRight size={15} />
          </Button>
        </nav>
        <button
          className="icon-button public-menu-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={21} />
        </button>
      </header>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Explore ClubPulse"
        className="public-menu"
      >
        <nav aria-label="Mobile navigation">
          <Link onClick={() => setOpen(false)} to="/#how-it-works">
            How it works
          </Link>
          <Link onClick={() => setOpen(false)} to="/feedback">
            Give feedback
          </Link>
          <Link onClick={() => setOpen(false)} to="/admin/login">
            Admin login
            <ArrowUpRight size={16} />
          </Link>
        </nav>
      </Dialog>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="public-footer">
        <div>
          <Brand />
          <p>A better experience begins with a conversation.</p>
        </div>
        <div className="footer-links">
          <Link to="/feedback">Give feedback</Link>
          <Link to="/admin/login">
            For organizers
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <span className="footer-note">
          <ShieldCheck size={15} />
          Built for communities that listen.
        </span>
      </footer>
    </div>
  );
}
