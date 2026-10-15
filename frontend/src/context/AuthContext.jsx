import { createContext, useContext, useState } from "react";
import { AUTH_KEY } from "../services/api";

const AuthContext = createContext(null);

const loadSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  // auth = { token, user } or null when logged out
  const [auth, setAuth] = useState(loadSaved);

  const saveLogin = (data) => {
    const next = { token: data.token, user: data.user };
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setAuth(next);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, user: auth?.user ?? null, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
