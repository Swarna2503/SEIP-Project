// src/pages/VerifyEmailPage.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../apis/verify';
import { resendCode } from '../apis/resend';

export default function VerifyEmailPage() {
  const { email } = useLocation().state as { email: string };
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // 倒计时逻辑：timer 类型改为 number
  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [cooldown]);

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
      setCooldown(60); // 启动 60 秒倒计时
    } catch (e: any) {
      setError(e.message);
    }
  };

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
