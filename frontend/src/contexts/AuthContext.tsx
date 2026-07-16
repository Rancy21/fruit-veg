import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { getMe, login as loginApi, register as registerApi } from "../api/auth";
import { getAuthToken, setAuthToken } from "../api/axios";
import type { User, UserCreate } from "../types/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (username: string, password: string) => {
    await loginApi(username, password);
    const me = await getMe();
    setUser(me);
    toast.success(`Welcome back, ${me.full_name || me.username}!`);
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    await registerApi(data);
    await login(data.username, data.password);
  }, [login]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const isAdmin = useMemo(
    () => user?.roles?.some((role) => role.name === "admin") ?? false,
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
    }),
    [user, isLoading, isAuthenticated, isAdmin, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
