import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login as apiLogin, setAuthToken, setUnauthorizedHandler } from './api';

interface AuthContextValue {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Keeps the JWT in React state only (not browser storage). Must be rendered inside the router. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearToken = useCallback(() => {
    setAuthToken(null);
    setToken(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    // Update the API client synchronously so requests fired right after redirect carry the token
    setAuthToken(res.token);
    setToken(res.token);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    navigate('/login', { replace: true });
  }, [clearToken, navigate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      navigate('/login', { replace: true, state: { expired: true } });
    });
    return () => setUnauthorizedHandler(null);
  }, [clearToken, navigate]);

  const value = useMemo(() => ({ token, login, logout }), [token, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Redirects to /login, remembering the requested location so login can return there. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
