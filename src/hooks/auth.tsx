// src/hooks/auth.tsx
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
import { getAPIBaseURL } from "../apis/config"; 

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
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAPIBaseURL().then((baseURL) => {
      fetch(`${baseURL}/profile`, { credentials: "include" })
        .then(res => {
          if (!res.ok) throw new Error("未登录");
          return res.json();
        })
        .then((data: User) => setUser(data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    });
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

  // Mock password reset email function
  async function sendPasswordResetEmail(email: string) {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Mock validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }
      
      console.log(`[MOCK] Password reset email sent to: ${email}`);
      // In a real app, we would navigate to a confirmation page
      // For mock purposes, we'll just show a success message
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Mock password reset function
  async function resetPassword(token: string, newPassword: string) {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Mock validation
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      
      console.log(`[MOCK] Password reset for token: ${token}`);
      console.log(`[MOCK] New password set: ${newPassword}`);
      
      // Simulate successful reset
      navigate('/login', { state: { message: "Password reset successfully!" } });
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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout,
      sendPasswordResetEmail,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}