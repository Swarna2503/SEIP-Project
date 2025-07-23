// src/pages/VerifyEmailPage.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../apis/verify';
import { resendCode } from '../apis/resend';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const emailFromQuery = searchParams.get('email');           
  const codeFromQuery = searchParams.get('code');           
  const stateEmail = (location.state as { email?: string })?.email;

  const [email] = useState(emailFromQuery || stateEmail || '');
  const [code, setCode] = useState(codeFromQuery || '');

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // logic about countdown timer
  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [cooldown]);

  useEffect(() => {
    if (email && codeFromQuery) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    setError(null);
    try {
      const { ok, data } = await verifyEmail(email, code);
      if (!ok) throw new Error(data.detail || 'Verification failed');
      navigate('/login', { replace: true });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    try {
      const { ok, data } = await resendCode(email);
      if (!ok) throw new Error(data.message || 'Resend failed');
      setInfo(data.message);
      setCooldown(60); // Start 60 seconds countdown
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!email) {
    return (
      <div className="verify-page">
        <h2>Verification Error</h2>
        <p className="error-text">Missing email. Please register again or use the email link.</p>
        <button onClick={() => navigate('/register')}>Go to Register</button>
      </div>
    );
  }
  
  return (
    <div className="verify-page">
      <h2>Verify Email: {email}</h2>
      {error && <p className="error-text">{error}</p>}
      {info  && <p className="info-text">{info}</p>}

      <input
        type="text"
        placeholder="Please enter the verification code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={handleVerify} disabled={!code}>
        Submit Verification
      </button>

      <div className="resend-section">
        <button onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}