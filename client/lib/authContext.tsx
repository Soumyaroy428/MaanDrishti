import React, { createContext, useContext, useEffect, useState } from "react";
import { api, appParams } from "./api-client";

type AuthContextValue = {
  user: Record<string, unknown> | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: { type: string; message: string } | null;
  appPublicSettings: unknown;
  authChecked: boolean;
  logout: (redirect?: boolean) => void;
  navigateToLogin: () => void;
  checkUserAuth: () => Promise<void>;
  checkAppState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState<AuthContextValue["authError"]>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState<unknown>(null);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const userData = await api.auth.me();
      setUser(userData);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };
  
  const checkAppState = async () => {
    setIsLoadingPublicSettings(true);
    setAuthError(null);
    try {
      setAppPublicSettings(await api.app.getPublicSettings());
      if (appParams.token) await checkUserAuth();
      else { setIsLoadingAuth(false); setAuthChecked(true); }
    } catch (error: any) {
      setAuthError({ type: "unknown", message: error?.message || "Failed to load app" });
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } finally {
      setIsLoadingPublicSettings(false);
    }
  };
  
  useEffect(() => { void checkAppState(); }, []);
  
  const logout = (redirect = true) => {
    setUser(null); setIsAuthenticated(false);
    api.auth.logout(redirect ? window.location.href : undefined);
  };
  
  const navigateToLogin = () => api.auth.redirectToLogin(window.location.href);
  
  return <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, appPublicSettings, authChecked, logout, navigateToLogin, checkUserAuth, checkAppState }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
