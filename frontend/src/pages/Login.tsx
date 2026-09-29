import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '../auth';

interface LoginLocationState {
  from?: Location;
  expired?: boolean;
}

export default function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LoginLocationState;
  const redirectTo = state.from ? `${state.from.pathname}${state.from.search}` : '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (token) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <section className="login">
      <h1>Sign in</h1>
      {state.expired && !error && (
        <div className="alert error" role="status">Your session has expired. Please sign in again.</div>
      )}
      <form className="edit-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
        {error && <div className="alert error" role="alert">{error}</div>}
      </form>
    </section>
  );
}
