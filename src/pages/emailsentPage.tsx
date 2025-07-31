// src/pages/EmailSentPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { requestSignature } from '../apis/document';

export default function EmailSentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [sellerEmail, setSellerEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const applicationId = state?.applicationId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationId) {
      setSendError('Missing application ID. Please go back and try again.');
      return;
    }

    if (!sellerEmail.trim()) {
      setSendError('Please enter a valid seller email address.');
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);

      await requestSignature(applicationId, sellerEmail.trim());

      setIsSent(true);
    } catch (err: any) {
      setSendError(err.message || 'Failed to send signature email.');
    } finally {
      setIsSending(false);
    }
  };

  if (!applicationId) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>
        <h2>Missing application ID</h2>
        <p>Please go back and generate your PDF again.</p>
      </div>
    );
  }

  if (isSent) {
    return (
      <div style={{ 
        padding: 24, 
        maxWidth: 800, 
        margin: 'auto',
        backgroundColor: '#f9fafb',
        color: '#374151',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{ 
          backgroundColor: '#ffffff',
          padding: 40,
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          width: '100%',
          maxWidth: 600
        }}>
          <h1 style={{ 
            color: '#1e40af',
            marginBottom: 24,
            fontSize: '2rem'
          }}>
            Document Sent Successfully!
          </h1>
          
          <div style={{ marginBottom: 30 }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginBottom: 20 }}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 10, color: '#4b5563' }}>
              Your document has been successfully sent to the seller for review and signature.
            </p>
            <p style={{ fontSize: '1rem', color: '#374151' }}>
              The seller can sign it using the link below (valid for 72 hours).
            </p>
            <div style={{ 
              backgroundColor: '#dbeafe',
              padding: 15,
              borderRadius: 6,
              borderLeft: '4px solid #3b82f6',
              textAlign: 'left',
              margin: '20px 0'
            }}>
              <p style={{ margin: 0, color: '#1e40af' }}>
                <strong>Seller Link:</strong>{' '}
                <a 
                  href={`${import.meta.env.VITE_FRONTEND_URL}/seller-sign/${applicationId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {import.meta.env.VITE_FRONTEND_URL}/seller-sign/{applicationId}
                </a>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/')}
              style={{ 
                padding: '12px 24px', 
                background: '#1e40af', 
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                minWidth: 180,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 24, 
      maxWidth: 800, 
      margin: 'auto',
      backgroundColor: '#f9fafb',
      color: '#374151',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <div style={{ 
        backgroundColor: '#ffffff',
        padding: 40,
        borderRadius: 8,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: 600
      }}>
        <h1 style={{ color: '#1e40af', marginBottom: 24, fontSize: '2rem' }}>
          Send Document to Seller
        </h1>
        <div style={{ marginBottom: 30 }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#1e40af" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginBottom: 20 }}
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 10, color: '#4b5563' }}>
            Please enter the seller's email address below to send them the completed Form 130-U document.
          </p>
          <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: 25 }}>
            The seller will receive a secure signature link valid for 72 hours.
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="seller-email" style={{ 
                display: 'block', 
                textAlign: 'left',
                marginBottom: 8,
                fontWeight: 500,
                color: '#4b5563'
              }}>
                Seller's Email Address
              </label>
              <input
                id="seller-email"
                type="email"
                value={sellerEmail}
                onChange={(e) => setSellerEmail(e.target.value)}
                placeholder="seller@example.com"
                disabled={isSending}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: 6,
                  border: `1px solid ${sendError ? '#ef4444' : '#d1d5db'}`,
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
              {sendError && (
                <p style={{ 
                  color: '#ef4444', 
                  textAlign: 'left',
                  margin: '8px 0 0',
                  fontSize: '0.9rem'
                }}>
                  {sendError}
                </p>
              )}
            </div>
            <button 
              type="submit"
              disabled={isSending}
              style={{ 
                padding: '12px 24px', 
                background: '#10b981', 
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                transition: 'background-color 0.2s, opacity 0.2s',
                width: '100%',
                opacity: isSending ? 0.7 : 1
              }}
              onMouseOver={(e) => !isSending && (e.currentTarget.style.backgroundColor = '#059669')}
              onMouseOut={(e) => !isSending && (e.currentTarget.style.backgroundColor = '#10b981')}
            >
              {isSending ? (
                <>
                  <span>Sending Document...</span>
                  <span style={{ marginLeft: 8 }}>⏳</span>
                </>
              ) : (
                'Send Document to Seller'
              )}
            </button>
          </form>
        </div>
        <div style={{ 
          marginTop: 30, 
          padding: 15,
          backgroundColor: '#dbeafe',
          borderRadius: 6,
          borderLeft: '4px solid #3b82f6'
        }}>
          <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem' }}>
            <strong>Note:</strong> The seller will receive an email with your completed Form 130-U and a secure link to sign.
          </p>
        </div>
      </div>
    </div>
  );
}