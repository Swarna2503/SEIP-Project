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
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pw: string): string[] => {
    const errors = [];
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("Must contain an uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("Must contain a lowercase letter");
    if (!/\d/.test(pw)) errors.push("Must contain a digit");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setFormError(null);
    setValidationErrors([]);
    
    // Validate password strength
    const passwordErrors = validatePassword(password);
    
    // Validate password match
    const matchError = password !== confirm ? "Passwords do not match" : "";
    
    // Combine errors
    const allErrors = [...passwordErrors];
    if (matchError) allErrors.push(matchError);
    
    // Set errors and return if any
    setValidationErrors(allErrors);
    if (allErrors.length > 0) return;

    try {
      await register(email, password, confirm);
      // If successful, the auth hook will navigate to verify-email
    } catch(err: any) {
      console.error("Registration error:", err.message);
      
      // Handle specific error cases
      if (err.message === "EMAIL_EXISTS") {
        setFormError('An account with this email already exists. Please log in or use a different email.');
      } 
      else if (err.message === "EMAIL_NOT_VERIFIED") {
        setFormError("This email is already registered but not verified. Redirecting to verification...");
        setTimeout(() => {
          navigate('/verify-email', { state: { email } });
        }, 2000);
      } 
      // Handle other common error patterns
      else if (err.message.toLowerCase().includes("already exists") || 
               err.message.toLowerCase().includes("already registered")) {
        setFormError('An account with this email already exists. Please log in or use a different email.');
      }
      else if (err.message.toLowerCase().includes("email") && 
               err.message.toLowerCase().includes("taken")) {
        setFormError('This email address is already taken. Please use a different email.');
      }
      // Generic error fallback
      else {
        setFormError(err.message || 'Registration failed. Please try again.');
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
          required
        />

        <label>Password</label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            title="Password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👀"}
          </button>
        </div>

        <label>Confirm Password</label>
        <div className="password-input-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm your password"
            title="Confirm Password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? "🙈" : "👀"}
          </button>
        </div>

        <button type="submit">
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