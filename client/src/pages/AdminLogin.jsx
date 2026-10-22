import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Field, Input } from '../components/ui/Common';
export default function AdminLogin() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (admin) return <Navigate to="/admin" replace />;
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <aside className="login-story">
        <p className="eyebrow">FOR THE PEOPLE BEHIND THE EVENTS</p>
        <h1>
          Listen closely.
          <br />
          Make it <span>matter.</span>
        </h1>
        <p>
          The best ideas for your next event are already in the room. Your workspace helps you find
          them.
        </p>
        <div className="login-capabilities">
          {[
            [
              MessageSquare,
              'Every perspective, together',
              'One place for your community’s honest feedback.',
            ],
            [
              ChartNoAxesCombined,
              'A clearer picture',
              'Real ratings and trends across your events.',
            ],
            [
              SlidersHorizontal,
              'Less searching. More learning.',
              'Find the responses that help you move forward.',
            ],
          ].map(([Icon, title, description]) => (
            <div key={title}>
              <span>
                <Icon size={19} />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="login-story-footer">
          <ShieldCheck size={17} />
          <span>Anonymous for participants. Private for organizers.</span>
        </div>
      </aside>
      <section className="login-form-area" aria-labelledby="login-title">
        <span className="login-icon">
          <LockKeyhole size={23} />
        </span>
        <h2 id="login-title">Welcome back.</h2>
        <p>Sign in to your ClubPulse workspace.</p>
        <form className="login-form" onSubmit={submit} aria-busy={busy}>
          <Field id="email" label="Email address">
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@yourclub.edu"
              maxLength={254}
              required
            />
          </Field>
          <Field id="password" label="Password">
            <div className="password-input">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                maxLength={128}
                required
              />
              <button
                className="icon-button"
                type="button"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="full-width" loading={busy}>
            {busy ? 'Signing in…' : 'Sign in to workspace'}
            {!busy && <ArrowRight size={17} />}
          </Button>
          <div className="login-help">
            <ShieldCheck size={15} />
            <p>
              Access is managed by your club administrator.
              <br />
              There is no public account registration.
            </p>
          </div>
        </form>
        <div className="login-participant">
          <span>Here to share your experience?</span>
          <Button variant="ghost" size="small" to="/feedback">
            Give feedback
            <ArrowUpRight size={15} />
          </Button>
        </div>
      </section>
    </div>
  );
}
