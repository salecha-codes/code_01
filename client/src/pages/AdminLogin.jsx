import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
      <span className="login-icon">
        <LockKeyhole size={24} />
      </span>
      <p className="eyebrow">THE OTHER SIDE OF THE CONVERSATION</p>
      <h1>Welcome back.</h1>
      <p className="muted">Sign in to listen, learn, and make your next event better.</p>
      <form className="panel login-form" onSubmit={submit}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourclub.edu"
          maxLength={254}
          required
        />
        <label htmlFor="password">Password</label>
        <div className="password-input">
          <input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={128}
            required
          />
          <button
            type="button"
            className="icon-button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}{' '}
          {busy ? 'Signing in…' : 'Sign in to workspace'}
        </button>
        <p className="field-hint">
          Access is managed by your club administrator.
          <br />
          There is no public account registration.
        </p>
      </form>
      <p className="form-footnote">
        <ShieldCheck size={14} />
        Secure access for authorized organizers.
      </p>
    </div>
  );
}
