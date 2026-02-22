import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import api, { setOnUnauthorized, setTokenHandlers } from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tokenRef = useRef(null);

  const setAccessToken = useCallback((token) => {
    tokenRef.current = token;
    setAccessTokenState(token);
  }, []);

  const getAccessToken = useCallback(() => tokenRef.current, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, [setAccessToken]);

  useEffect(() => {
    setOnUnauthorized(clearAuth);
    setTokenHandlers(getAccessToken, setAccessToken);
    return () => {
      setOnUnauthorized(null);
      setTokenHandlers(null, null);
    };
  }, [clearAuth, getAccessToken, setAccessToken]);

  const loadUser = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.post('/auth/refresh');
      const token = data.data?.accessToken || data.accessToken;
      if (token) setAccessToken(token);
      const meRes = await api.get('/auth/me');
      const userFromMe = meRes.data?.data?.user ?? meRes.data?.user;
      setUser(userFromMe ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setAccessToken]);

  // Debug: ensure role is present (remove after verifying Admin panel works)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && user) {
      console.log('AuthContext user:', { id: user._id, name: user.name, role: user.role });
    }
  }, [user]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.data?.accessToken || data.accessToken;
      const u = data.data?.user || data.user;
      setAccessToken(token);
      setUser(u);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      if (status === 403 && message?.toLowerCase().includes('banned')) {
        setError('🚫 Your account has been banned. Please contact support.');
      } else {
        setError(message);
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      const token = data.data?.accessToken || data.accessToken;
      const u = data.data?.user || data.user;
      setAccessToken(token);
      setUser(u);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
