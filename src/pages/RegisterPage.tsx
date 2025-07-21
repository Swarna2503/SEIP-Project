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

  // const canSubmit = email.trim() !== '' && password.trim() !== '' && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/verify-email', { state: { email } });
    } catch {
      
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <p className="error-text">{error}</p>}

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