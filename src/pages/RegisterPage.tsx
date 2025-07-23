// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

export default function RegisterPage() {
  const { register, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);


  const validatePassword = (pw: string): string[] => {
    const errors = [];
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("Must contain an uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("Must contain a lowercase letter");
    if (!/\d/.test(pw)) errors.push("Must contain a digit");
    return errors;
  };
  // const canSubmit = email.trim() !== '' && password.trim() !== '' && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePassword(password);
    if(password !== confirm) {
      errors.push("Passwords do not match");
    }
    setValidationErrors(errors);
    if (errors.length > 0) return;

    try {
      await register(email, password, confirm);
      alert('Registration successful! Please verify your email.');
      navigate('/verify-email', { state: { email } });
    } catch(err) {
      if (err instanceof Error) {
        if (err.message.includes("not verified")) {
          alert("This email is already registered but not verified. You can verify it now.");
          navigate('/verify-email', { state: { email } });
        } else {
          alert("Registration failed: " + err.message);
          setFormError(err.message);
        }
      } else {
        alert("Unexpected error");
        console.error(err);
      }
    } 
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <p className="error-text">{error}</p>}
        {formError && <p className="error-text">{formError}</p>}
        {/* Display validation errors */}
        {validationErrors.map((msg, idx) => (
          <p key={idx} className="error-text">{msg}</p>
        ))}

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email address"
          title="Email Address"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          title="Password"
        />

        <label>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm your password"
          title="Confirm Password"
        />
        {/* disabled={!canSubmit || loading} */}
        <button type="submit" >
          Register
        </button>

        <p className="form-toggle-text">
          Already have an account?{' '}
          <button type="button" className="toggle-button" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}