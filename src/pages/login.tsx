// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import "../styles/login.css";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // check if the email and password are valid
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

  // every time email or password changes, validate them
  // useEffect(() => {
  //   setErrors({
  //     email: validateEmail(email),
  //     password: validatePassword(password),
  //   });
  // }, [email, password]);

  const canSubmit =
    email.trim() !== "" &&
    password.trim() !== "" &&
    !errors.email &&
    !errors.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitted(true); 
    
    // generate new validation results
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    // write the new errors to state
    setErrors(newErrors);
    // if there are errors, do not submit
    if (newErrors.email || newErrors.password) {
      console.log("Validation errors:", newErrors);
      return;
    }
    
    if (!canSubmit) return;
    try {
      await login(email, password);

      // print the cookies to console after login
      console.log("🍪 document.cookie after login:", document.cookie);
    } catch {
      // errors handled in useAuth
    }
  };
  console.log("canSubmit:", canSubmit, email, password, errors);

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
          className={submitted && errors.email ? "input-error" : ""}
        />
        {/* only show the error message after submission */}
        {submitted && errors.email && <p className="error-text">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={submitted && errors.password ? "input-error" : ""}
        />
        {submitted && errors.password && <p className="error-text">{errors.password}</p>}
        {/* disabled={!canSubmit || loading} */}
        <button type="submit" >
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
