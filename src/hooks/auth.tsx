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
import { requestPasswordReset, resetPassword as resetPasswordAPI } from "../apis/reset_password";
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
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
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
    // Only check auth status once when the app loads, not on every navigation
    if (user !== null) return; // Skip if user is already set
    
    setLoading(true);
    getAPIBaseURL().then((baseURL) => {
      fetch(`${baseURL}/api/profile`, { credentials: "include" })
        .then(res => {
          if (!res.ok) throw new Error("Didn't log in yet");
          return res.json();
        })
        .then((data: User) => setUser(data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    });
  }, []); // Remove navigate dependency

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

  async function register(email: string, password: string, confirmPassword: string) {
    setLoading(true);
    setError(null);
    try {
      const { ok, data, status} = await registerApi(email, password, confirmPassword);
      if (!ok) {
        // Handle specific error cases based on the response
        if (status === 400 && data.detail && data.detail.includes("already exists")) {
          throw new Error("EMAIL_EXISTS");
          // && data.detail && data.detail.includes("not verified")
        } else if (status === 409 ) {
          navigate('/verify-email', { state: { email } });
          throw new Error("EMAIL_NOT_VERIFIED");
        } else {
          throw new Error(data.message || data.detail || "Registration failed");
        }
      }
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // new added sendPasswordResetEmail function
  async function sendPasswordResetEmail(email: string) {
    setLoading(true);
    setError(null);
    try {
      const { ok, data } = await requestPasswordReset(email);
      if (!ok) throw new Error(data.detail || "Failed to send reset link");
      // keep the message in state to show it in the UI
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // new added resetPassword function
  async function resetPassword(token: string, newPassword: string) {
    setLoading(true);
    setError(null);
    try {
      console.log("[DEBUG] calling resetPassword API with:", token, newPassword);
      const { ok, data } = await resetPasswordAPI(token, newPassword, newPassword);
      console.log("[DEBUG] resetPassword response:", ok, data);
      if (!ok) throw new Error(data.detail || "Password reset failed");
      navigate('/login', { state: { message: "Password reset successfully!" } });
    } catch (err: any) {
      console.error("[DEBUG] resetPassword error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      // Call logout API to clear server-side session
      const baseURL = await getAPIBaseURL();
      await fetch(`${baseURL}/api/logout`, { 
        method: 'POST',
        credentials: "include" 
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear client-side state regardless of API call result
      setUser(null);
      navigate("/login", { replace: true });
    }
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