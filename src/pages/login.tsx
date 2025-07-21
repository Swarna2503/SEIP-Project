// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import "../styles/login.css";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  useEffect(() => {
    setErrors({
      email: validateEmail(email),
      password: validatePassword(password),
    });
  }, [email, password]);

  const canSubmit =
    email.trim() !== "" &&
    password.trim() !== "" &&
    !errors.email &&
    !errors.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await login(email, password);
    } catch {
      // errors handled in useAuth
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <p className="error-text">{error}</p>}

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={errors.email ? "input-error" : ""}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={errors.password ? "input-error" : ""}
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <div className="forgot-password-container">
          <button 
            type="button"
            className="forgot-password"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" disabled={!canSubmit || loading}>
          Continue →
        </button>

        <p className="form-toggle-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="toggle-button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
}