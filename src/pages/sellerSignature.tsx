import React, { useRef, useEffect, useState } from 'react';

const SignatureCanvas = React.forwardRef<any, any>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    },
    isEmpty: () => {
      const canvas = canvasRef.current;
      if (!canvas) return true;
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return !imageData.data.some((channel, index) => index % 4 === 3 && channel !== 0);
    },
    getTrimmedCanvas: () => {
      return canvasRef.current;
    }
  }));

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = props.penColor || '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && props.backgroundColor) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = props.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [props.backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={props.canvasProps?.width || 400}
      height={props.canvasProps?.height || 150}
      style={{
        border: '1px solid #ccc',
        cursor: 'crosshair',
        backgroundColor: props.backgroundColor || 'white',
        ...props.canvasProps?.style
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
});

export default function SellerSignPage() {
  const token = 'demo-token-123';
  const location = { 
    state: null as { pdfData?: string; applicantInfo?: any } | null 
  };
  
  const sellerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [signatureDate, setSignatureDate] = useState('');
  const [pdfData, setPdfData] = useState('');
  const [applicantInfo, setApplicantInfo] = useState<any>({});

  // Generate formatted date string
  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const loadDocument = () => {
      try {
        // Set the date immediately
        setSignatureDate(getFormattedDate());
        
        if (location.state?.pdfData) {
          setPdfData(location.state.pdfData);
          setApplicantInfo(location.state.applicantInfo || {});
          setIsLoading(false);
          return;
        }
        
        // Mock document data
        const mockPdfData = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO4w6HDhMOgw6...';
        const mockApplicantInfo = {
          applicantName: 'John Doe',
          applicantEmail: 'john@example.com'
        };
        
        setPdfData(mockPdfData);
        setApplicantInfo(mockApplicantInfo);
        
        setIsLoading(false);
      } catch (e: any) {
        console.error('Error loading document:', e);
        setError(e.message || 'Failed to load document');
        setIsLoading(false);
      }
    };

    // Set the date immediately on load
    setSignatureDate(getFormattedDate());
    
    // Simulate document loading
    setTimeout(loadDocument, 1000);
  }, []);

  const handleSignDocument = async () => {
    try {
      if (!signatureName.trim()) {
        setError('Please provide your name');
        return;
      }

      if (!sellerRef.current) {
        setError('Signature canvas not available');
        return;
      }

      if (sellerRef.current.isEmpty()) {
        setError('Please provide your signature');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      // Get signature
      const canvas = sellerRef.current.getTrimmedCanvas();
      if (!canvas) {
        throw new Error('Could not get signature canvas');
      }
      
      const signatureDataUrl = canvas.toDataURL('image/png');
      
      // Prepare signature object
      const signatures = [
        { key: 'SellerSignature', dataUrl: signatureDataUrl }
      ];

      // Simulate signing process
      console.log('Signing document with:', {
        name: signatureName,
        date: signatureDate,
        signatures: signatures.length
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      const docId = `signed_${Date.now()}`;
      alert(`Document signed successfully! ID: ${docId}`);
      
    } catch (e: any) {
      console.error('Error signing document:', e);
      setError(e.message || 'Failed to sign document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSignature = () => {
    if (sellerRef.current) {
      sellerRef.current.clear();
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        color: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50,
            height: 50,
            border: '5px solid rgba(255, 255, 255, 0.1)',
            borderTop: '5px solid #60a5fa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
            Loading document...
          </p>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        padding: 24
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #334155, #475569)',
          padding: 40,
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          maxWidth: 600,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="60" 
            height="60" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#f87171" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginBottom: 20 }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 style={{ color: '#f87171', marginBottom: 16, fontSize: '1.5rem' }}>
            Document Error
          </h2>
          <p style={{ marginBottom: 24, color: '#cbd5e1', lineHeight: 1.6 }}>
            {error}
          </p>
          <button 
            onClick={() => setError(null)}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #334155, #475569)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              marginRight: 10
            }}
          >
            Try Again
          </button>
          <button 
            onClick={() => console.log('Navigate to home')}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #475569, #64748b)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: 24,
      maxWidth: 1200,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b, #334155)',
      color: '#f8fafc'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #334155, #475569)',
        padding: '32px 24px',
        textAlign: 'center',
        borderRadius: 12,
        marginBottom: 32,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2rem', 
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
          Document Signing Portal
        </h1>
        <p style={{ 
          margin: '12px 0 0', 
          opacity: 0.85,
          fontSize: '1.1rem',
          color: '#e2e8f0'
        }}>
          Please review and sign the Form 130-U
        </p>
      </div>
      
      <div className="signing-container" style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: 32
      }}>
        {/* Document Preview */}
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, #334155, #475569)',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ 
              background: 'rgba(30, 41, 59, 0.6)',
              padding: '16px 24px',
              fontWeight: 600,
              fontSize: '1.1rem',
              color: '#e2e8f0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              Document Preview
            </div>
            <div style={{ 
              height: '70vh',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8'
            }}>
              {pdfData ? (
                <iframe 
                  src={pdfData}
                  title="Document to sign"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                  <p>Document will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Signing Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #334155, #475569)',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          padding: 32,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: 'fit-content'
        }}>
          <h2 style={{ 
            color: '#e2e8f0',
            marginTop: 0,
            marginBottom: 24,
            paddingBottom: 16,
            fontSize: '1.5rem',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            Seller's Signature
          </h2>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 12,
              fontWeight: 500,
              color: '#e2e8f0',
              fontSize: '1.05rem'
            }}>
              Your Full Name
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Enter your name as it appears on the document"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                color: '#f8fafc',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 12,
              fontWeight: 500,
              color: '#e2e8f0',
              fontSize: '1.05rem'
            }}>
              Signature Date
            </label>
            <input
              type="text"
              value={signatureDate}
              readOnly
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                fontSize: '1rem',
                boxSizing: 'border-box',
                cursor: 'not-allowed',
                color: '#94a3b8'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 12,
              fontWeight: 500,
              color: '#e2e8f0',
              fontSize: '1.05rem'
            }}>
              Your Signature
            </label>
            <div style={{ 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              overflow: 'hidden'
            }}>
              <SignatureCanvas 
                ref={sellerRef}
                penColor="#f8fafc"
                backgroundColor="rgba(15, 23, 42, 0.3)"
                canvasProps={{ 
                  width: 350, 
                  height: 150,
                  style: {
                    cursor: 'crosshair',
                    display: 'block'
                  }
                }}
              />
            </div>
            <button 
              onClick={handleClearSignature}
              style={{
                padding: '10px 20px',
                marginTop: 12,
                background: 'rgba(15, 23, 42, 0.5)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Clear Signature
            </button>
          </div>
          
          <div style={{ 
            background: 'rgba(30, 64, 175, 0.15)',
            padding: 20,
            borderRadius: 8,
            borderLeft: '4px solid #3b82f6',
            marginBottom: 32
          }}>
            <p style={{ 
              margin: 0, 
              color: '#dbeafe',
              fontSize: '0.95rem',
              lineHeight: 1.6
            }}>
              <strong style={{ color: '#bfdbfe' }}>Signing Instructions:</strong> Please sign in the box above exactly as your name appears on the document. Your signature will be legally binding.
            </p>
          </div>
          
          <button
            onClick={handleSignDocument}
            disabled={isSubmitting}
            style={{
              padding: '16px 28px',
              background: isSubmitting 
                ? 'linear-gradient(135deg, #1e293b, #334155)' 
                : 'linear-gradient(135deg, #059669, #10b981)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1.1rem',
              width: '100%',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ position: 'relative', zIndex: 2 }}>Signing Document...</span>
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '30%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  animation: 'shimmer 1.5s infinite',
                }}></span>
              </>
            ) : (
              'Sign and Submit'
            )}
          </button>
          
          {token && (
            <p style={{ 
              marginTop: 20,
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.9rem',
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              Document ID: <code style={{ 
                background: 'rgba(15, 23, 42, 0.5)',
                padding: '4px 8px',
                borderRadius: 4,
                color: '#e2e8f0'
              }}>{token}</code>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        
        @media (max-width: 1024px) {
          .signing-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}