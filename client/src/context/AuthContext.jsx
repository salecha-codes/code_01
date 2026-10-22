import { createContext, useContext, useEffect, useState } from 'react';
import { api, setCsrfToken } from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api('/auth/me')
      .then((data) => {
        if (active) {
          setAdmin(data.admin);
          setCsrfToken(data.csrfToken);
        }
      })
      .catch((error) => {
        if (active && error.status !== 401) setError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  useEffect(() => {
    const clear = () => {
      setAdmin(null);
      setCsrfToken('');
    };
    window.addEventListener('clubpulse:unauthorized', clear);
    return () => window.removeEventListener('clubpulse:unauthorized', clear);
  }, []);
  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setAdmin(data.admin);
    setCsrfToken(data.csrfToken);
    setError('');
  }
  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } catch (error) {
      if (error.status !== 401) throw error;
    }
    setAdmin(null);
    setCsrfToken('');
  }
  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        error,
        login,
        logout,
        retry: () => setRevision((value) => value + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
