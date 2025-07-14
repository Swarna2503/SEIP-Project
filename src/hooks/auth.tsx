// src/hooks/auth.tsx (AuthProvider 调整)
import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../apis/login";
import { register as registerApi } from "../apis/register";

interface User {
  user_id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // initially check if user is logged in
    setLoading(true);
    fetch("http://127.0.0.1:8000/profile", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("未登录");
        return res.json();
      })
      .then((data: User) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { ok, data } = await loginApi(email, password);
      if (!ok) throw new Error(data.error || "Login failed");
      setUser(data);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { ok, data } = await registerApi(email, password, password);
      if (!ok) throw new Error(data.message || "Registration failed");
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
