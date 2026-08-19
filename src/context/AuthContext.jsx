import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setUser(authService.getUser());
    }
    setLoading(false);
  }, []);

  // Si api.js detecta un 401, la sesión murió: reflejarlo acá
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener('prodhab:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('prodhab:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: Boolean(user),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
