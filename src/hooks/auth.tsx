// src/hooks/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../apis/login";

interface User {
  user_id: string;
  email:   string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  // change to fetch user profile
  useEffect(() => {
    fetch("http://127.0.0.1:8000/profile", {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Did not login yet");
        return res.json();
      })
      .then((data: User) => {
        setUser(data);
      })
      .catch(() => {
        // if you want to jump to login page when first load, can call navigate("/login")
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // login method, call loginApi
  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { ok, data } = await loginApi(email, password);
      if (!ok) throw new Error(data.error || "Login failed");
      setUser(data as User);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    // optional: call backend /logout to clear session
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
