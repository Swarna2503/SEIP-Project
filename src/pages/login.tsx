import React, { useState } from "react";
import { useAuth } from "../hooks/auth";
import "../styles/login.css";

export default function LoginPage() {
  const { login, register, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const canContinue = 
    email.trim() !== "" && 
    password.trim() !== "" &&
    (!isRegistering || name.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch {
      // error handled in useAuth hook
    }
  };

  const toggleFormMode = () => {
    setIsRegistering(!isRegistering);
    setEmail("");
    setPassword("");
    setName("");
    if (error) {
      // Clear error when toggling (if your useAuth hook supports it)
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>{isRegistering ? "Create Account" : "Sign In"}</h2>
        
        {error && <p className="error-text">{error}</p>}

        {isRegistering && (
          <>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              autoComplete="name"
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
              disabled={loading} 
            />
          </>
        )}

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          autoComplete="username"
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} 
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          autoComplete={isRegistering ? "new-password" : "current-password"}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading} 
        />

        <button type="submit" disabled={!canContinue || loading}>
          {isRegistering ? "Create Account" : "Continue →"}
        </button>

        <div className="form-toggle">
          <span>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button 
            type="button" 
            onClick={toggleFormMode}
            className="toggle-button"
          >
            {isRegistering ? "Sign In" : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}