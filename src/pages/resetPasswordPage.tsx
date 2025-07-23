// src/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import '../styles/register.css';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  // State for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token') || '';
  
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const passwordError = validatePassword(newPassword);
  const confirmError = newPassword !== confirmPassword ? "Passwords don't match" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordError || confirmError) return;
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setMessage('Password reset successfully! Redirecting to login...');
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Set New Password</h2>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <label htmlFor="new-password">New Password</label>
        <div className="password-input-container">
          <input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            placeholder="Enter new password"
            className={passwordError ? "input-error" : ""}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowNewPassword(!showNewPassword)}
            disabled={loading}
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword ? "🙈" : "👀"}
          </button>
        </div>
        {passwordError && <p className="error-text">{passwordError}</p>}

        <label htmlFor="confirm-password">Confirm Password</label>
        <div className="password-input-container">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="Confirm new password"
            className={confirmError ? "input-error" : ""}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? "🙈" : "👀"}
          </button>
        </div>
        {confirmError && <p className="error-text">{confirmError}</p>}

        <button 
          type="submit" 
          disabled={
            !newPassword || 
            !confirmPassword || 
            !!passwordError || 
            !!confirmError || 
            loading
          }
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}