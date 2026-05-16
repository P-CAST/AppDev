import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. Initialize state from sessionStorage to persist through refreshes
  const [mysqlUser, setMysqlUser] = useState(() => sessionStorage.getItem('passify_user') || null);
  const [mysqlPassword, setMysqlPassword] = useState(() => sessionStorage.getItem('passify_pwd') || null);
  const [masterPassword, setMasterPassword] = useState(() => sessionStorage.getItem('passify_master') || null);

  // 2. Updated persistence logic to store all required credentials
  const _persist = (user, pwd, master) => {
    setMysqlUser(user);
    setMysqlPassword(pwd);
    setMasterPassword(master);
    sessionStorage.setItem('passify_user', user);
    sessionStorage.setItem('passify_pwd', pwd);
    sessionStorage.setItem('passify_master', master);
  };

  const login = useCallback(async (user, password, master) => {
    const data = await apiLogin(user, password, master);
    // Use the form's password as the "session" credential 
    _persist(user, password, master); 
    return data;
  }, []);

  const register = useCallback(async (user, password, master) => {
    const data = await apiRegister(user, password, master);
    _persist(user, password, master);
    return data;
  }, []);

  const logout = useCallback(() => {
    setMysqlUser(null);
    setMysqlPassword(null);
    setMasterPassword(null);
    sessionStorage.clear();
  }, []);

  // 3. Provide all credentials to the rest of the app 
  return (
    <AuthContext.Provider value={{ 
      mysqlUser, 
      mysqlPassword, 
      masterPassword, 
      login, 
      register, 
      logout, 
      isLoggedIn: !!mysqlPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};