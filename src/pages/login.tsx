import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/auth";
import "../styles/login.css";

export default function LoginPage() {
  const { login, register, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: ""
  });

  // Validation functions
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

  const validateName = (name: string) => {
    if (isRegistering) {
      if (!name.trim()) return "Name is required";
      if (name.trim().length < 2) return "Name must be at least 2 characters";
    }
    return "";
  };

  // Validate fields on change
  useEffect(() => {
    setErrors({
      email: validateEmail(email),
      password: validatePassword(password),
      name: validateName(name)
    });
  }, [email, password, name, isRegistering]);

  // Check if form is valid
  const isFormValid = () => {
    const emailValid = !validateEmail(email);
    const passwordValid = !validatePassword(password);
    const nameValid = isRegistering ? !validateName(name) : true;
    
    return emailValid && passwordValid && nameValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

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
    setErrors({ email: "", password: "", name: "" });
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
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
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
          className={errors.email ? "input-error" : ""}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          autoComplete={isRegistering ? "new-password" : "current-password"}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={errors.password ? "input-error" : ""}
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <button 
          type="submit" 
          disabled={!isFormValid() || loading}
        >
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