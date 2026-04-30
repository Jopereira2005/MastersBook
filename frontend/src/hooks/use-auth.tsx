import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { IUser } from "@/interfaces/user";

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<IUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authService.current());
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const u = await authService.login(identifier, password);
    setUser(u);
  }, []);

  const register = useCallback(async (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    const u = await authService.register(username, firstName, lastName, email, password);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<IUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      authService.update(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}