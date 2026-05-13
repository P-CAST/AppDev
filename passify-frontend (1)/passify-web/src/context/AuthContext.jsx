import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]                   = useState(() => sessionStorage.getItem('passify_token') || null);
  const [username, setUsername]             = useState(() => sessionStorage.getItem('passify_user') || null);
  const [masterPassword, setMasterPassword] = useState(null);

  const _persist = (token, username, master) => {
    setToken(token);
    setUsername(username);
    setMasterPassword(master);
    sessionStorage.setItem('passify_token', token);
    sessionStorage.setItem('passify_user', username);
  };

  const login = useCallback(async (user, password, master) => {
    const data = await apiLogin(user, password, master);
    _persist(data.token, data.username, master);
    return data;
  }, []);

  const register = useCallback(async (user, password, master) => {
    const data = await apiRegister(user, password, master);
    _persist(data.token, data.username, master);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null); setUsername(null); setMasterPassword(null);
    sessionStorage.clear();
  }, []);

  return (
    <AuthContext.Provider value={{ token, username, masterPassword, login, register, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
