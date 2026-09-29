import { Link, Route, Routes } from 'react-router-dom';
import { RequireAuth, useAuth } from './auth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import VulnerabilityDetail from './pages/VulnerabilityDetail';

export default function App() {
  const { token, logout } = useAuth();
  return (
    <>
      <header className="app-header">
        <Link to="/">VulnTrack</Link>
        {token && (
          <button type="button" className="secondary" onClick={logout}>
            Log out
          </button>
        )}
      </header>
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/vulnerabilities/:id" element={<RequireAuth><VulnerabilityDetail /></RequireAuth>} />
          <Route path="*" element={<p>Page not found. <Link to="/">Back to dashboard</Link></p>} />
        </Routes>
      </main>
    </>
  );
}
