import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [masterPassword, setMasterPassword] = useState(null);

  const _persist = (user, pwd, master) => {
    setUsername(user);
    setPassword(pwd);
    setMasterPassword(master);
  };

  const login = useCallback(async (user, pwd, master) => {
    const data = await apiLogin(user, pwd, master);
    _persist(user, pwd, master);
    return data;
  }, []);

  const register = useCallback(async (user, pwd, master) => {
    const data = await apiRegister(user, pwd, master);
    _persist(user, pwd, master);
    return data;
  }, []);

  const logout = useCallback(() => {
    setUsername(null);
    setPassword(null);
    setMasterPassword(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        username,
        password,
        masterPassword,
        login,
        register,
        logout,
        isLoggedIn: password !== null && username !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};