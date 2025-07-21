// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import '../styles/login.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sendPasswordResetEmail } = useAuth();

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const emailError = validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) return;
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setMessage('Password reset email sent. Check your inbox.');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="instruction-text">
          Enter your email to receive a password reset link
        </p>
        
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <label htmlFor="reset-email">Email Address</label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="Enter your registered email"
          className={emailError ? "input-error" : ""}
        />
        {emailError && <p className="error-text">{emailError}</p>}

        <button 
          type="submit" 
          disabled={!email.trim() || !!emailError || loading}
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>

        <p className="form-toggle-text">
          Remember your password?{' '}
          <button 
            type="button" 
            className="toggle-button"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}