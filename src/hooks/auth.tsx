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
  email: string;
  name?: string; // Add name for registration
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>; // Add register function
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing session or local user
  useEffect(() => {
    // First try to get backend session
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
        // If backend session fails, check localStorage for simulated user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Login method
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

  // Basic registration simulation
  async function register(email: string, _password: string, name: string) {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a simulated user object
      const newUser: User = {
        user_id: `simulated_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Set user in context
      setUser(newUser);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    // Clear both backend session and simulated user
    localStorage.removeItem('user');
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, // Add to provider
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}