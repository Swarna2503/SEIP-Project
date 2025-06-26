// src/pages/login.tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/auth";
import "../styles/login.css";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const canContinue = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call your auth API here...
    console.log("email:", email, "password:", password);
    try {
      await login(email, password);
    } catch {
      // error was already handled in the useAuth hook
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {/* show error message */}
        {error && <p className="error-text">{error}</p>}

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
          autoComplete="current-password"
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading} 
        />

        <button type="submit" disabled={!canContinue || loading}>
          Continue →
        </button>
      </form>
    </div>
  );
}
