// src/pages/EmailSentPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockSendEmail, mockPrepareSellerSignature } from '../apis/mockapi';

export default function EmailSentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [sellerEmail, setSellerEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<{
    initiated: boolean;
    link?: string;
    token?: string;
    error?: string;
  }>({ initiated: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellerEmail.trim()) {
      setSendError('Please enter a valid email address');
      return;
    }
    
    if (!state?.pdfData) {
      setSendError('PDF data is missing. Please go back and try again.');
      return;
    }
    
    try {
      setIsSending(true);
      setSendError(null);
      setSignatureStatus({ initiated: false });
      
      // Step 1: Mock sending email to seller
      const emailResponse = await mockSendEmail({
        to: sellerEmail.trim(),
        subject: 'Form 130-U for Review and Signature',
        body: 'Please review and sign the attached Form 130-U document.',
        pdfData: state.pdfData,
        applicantInfo: state.formData
      });

      if (!emailResponse.success) {
        throw new Error('Failed to send email');
      }

      // Step 2: Mock initiating seller signature process
      const signatureResponse = await mockPrepareSellerSignature({
        sellerEmail: sellerEmail.trim(),
        pdfData: state.pdfData,
        metadata: {
          initiatedBy: state.formData?.applicantEmail || 'unknown',
          expirationHours: 72
        }
      });

      if (!signatureResponse.success) {
        throw new Error(signatureResponse.error || 'Failed to initiate signature process');
      }

      // Store ONLY metadata in localStorage (removed pdfData to fix quota error)
      const storageKey = `document_${signatureResponse.signatureId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        applicantInfo: state.formData,
        expiration: Date.now() + 72 * 60 * 60 * 1000 // 72 hours
      }));

      // Update UI state
      setIsSent(true);
      setSignatureStatus({
        initiated: true,
        link: signatureResponse.signingLink,
        token: signatureResponse.signatureId
      });
    } catch (error: any) {
      console.error('Process failed:', error);
      setSendError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  // Format expiration date for display
  // const formatExpiration = (date?: Date) => {
  //   if (!date) return '';
  //   return new Date(date).toLocaleString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

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
            
            <p style={{ 
              fontSize: '1.1rem', 
              lineHeight: 1.6,
              marginBottom: 10,
              color: '#4b5563'
            }}>
              Your document has been successfully sent to the seller for review and signature.
            </p>
            
            {signatureStatus.initiated ? (
              <>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: 1.6,
                  color: '#374151',
                  marginBottom: 20
                }}>
                  The seller has been sent a secure link to sign the document electronically.
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
                    <strong>Signature Status:</strong> Signature process initiated
                  </p>
                  <p style={{ margin: '8px 0 0', color: '#1e40af' }}>
                    <strong>Token:</strong> {signatureStatus.token}
                  </p>
                </div>
              </>
            ) : (
              <p style={{ 
                fontSize: '1rem', 
                lineHeight: 1.6,
                color: '#b45309',
                marginBottom: 20
              }}>
                Warning: Signature process could not be initiated. The seller has received the document but will need to sign manually.
              </p>
            )}
          </div>
          
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 15,
            justifyContent: 'center',
            marginTop: 20
          }}>
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
            
            {signatureStatus.link && (
              <button 
                onClick={() => window.open(signatureStatus.link, '_blank')}
                style={{ 
                  padding: '12px 24px', 
                  background: '#4b5563', 
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  minWidth: 180,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              >
                Test Seller Sign Page
              </button>
            )}
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
        <h1 style={{ 
          color: '#1e40af',
          marginBottom: 24,
          fontSize: '2rem'
        }}>
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
          
          <p style={{ 
            fontSize: '1.1rem', 
            lineHeight: 1.6,
            marginBottom: 10,
            color: '#4b5563'
          }}>
            Please enter the seller's email address below to send them the completed Form 130-U document.
          </p>
          
          <p style={{ 
            fontSize: '1rem', 
            lineHeight: 1.6,
            color: '#6b7280',
            marginBottom: 25
          }}>
            The seller will receive an email with the document attached and instructions for signing.
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
          <p style={{ 
            margin: 0, 
            color: '#1e40af',
            fontSize: '0.9rem'
          }}>
            <strong>Note:</strong> The seller will receive an email with your completed Form 130-U and instructions on how to sign it electronically.
          </p>
        </div>
      </div>
    </div>
  );
}