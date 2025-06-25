import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canContinue = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call your auth API here...
    // on success:
    sessionStorage.setItem("userEmail", email);
    navigate("/");
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          autoComplete="username"
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          autoComplete="current-password"
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={!canContinue}>
          Continue →
        </button>
      </form>
    </div>
  );
}
