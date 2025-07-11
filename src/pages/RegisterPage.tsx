// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const canSubmit = email.trim() !== '' && password.trim() !== '' && password === confirm;

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
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <label>Confirm Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />

        <button type="submit" disabled={!canSubmit || loading}>
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
