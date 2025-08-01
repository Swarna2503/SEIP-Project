import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPdfUrl, fetchPdfProxy, submitSignedPdf } from '../apis/document';
import { PDFDocument, rgb } from 'pdf-lib';

const SignatureCanvas = forwardRef<any, any>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    isEmpty: () => {
      const canvas = canvasRef.current;
      if (!canvas) return true;
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      return !data.some((v, i) => i % 4 === 3 && v !== 0);
    },
    getTrimmedCanvas: () => {
      return canvasRef.current!;
    }
  }));

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsDrawing(true);
    setLastPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
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
    ctx.strokeStyle = props.penColor || '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
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
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = props.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [props.backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={props.canvasProps?.width || 400}
      height={props.canvasProps?.height || 150}
      style={{
        border: '1px solid #ccc',
        cursor: 'pointer',
        touchAction: 'none',      
        ...props.canvasProps?.style
      }}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerLeave={stopDrawing}
    />
  );
});

const CalendarPicker = ({ onSelect, onClose }: { onSelect: (date: string) => void; onClose: () => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Format as MM-DD-YYYY
    const formattedDate = `${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}-${selectedDate.getFullYear()}`;
    onSelect(formattedDate);
    onClose();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div style={{
      position: 'absolute',
      background: '#334155',
      padding: 16,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 1000,
      color: '#f8fafc',
      width: 240
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer' }}>&lt;</button>
        <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer' }}>&gt;</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.9rem' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day}>{day}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <div
            key={day}
            onClick={() => handleSelectDate(day)}
            style={{
              padding: 8,
              cursor: 'pointer',
              background: currentDate.getDate() === day ? '#10b981' : 'transparent',
              borderRadius: 4
            }}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SellerSignPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const sellerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [signatureDate, setSignatureDate] = useState('');
  const [pdfData, setPdfData] = useState('');
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer|null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const loadPdf = async () => {
    try {
      const res = await getPdfUrl(token!);
      const url = res.data?.pdfUrl;
      if (!url) throw new Error('No PDF URL returned');
      setPdfData(url);
      setError(null);
    } catch (err: any) {
      console.error('[SellerSignPage] loadPdf error', err);
      setError('Failed to load document: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Missing document ID');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadPdf();
  }, [token]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const arrayBuffer = await fetchPdfProxy(token!);
      setPdfBytes(arrayBuffer);
    })();
  }, [token]);

  useEffect(() => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPdfSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfBytes]);

  const embedSignatureInPdf = async (canvas: HTMLCanvasElement): Promise<string> => {
    const dataUrl = canvas.toDataURL('image/png');
    const arrayBuffer = await fetchPdfProxy(token!);
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pngImage = await pdfDoc.embedPng(dataUrl);
    const page = pdfDoc.getPages()[0];
    page.drawImage(pngImage, {
      x: 25,
      y: 85,
      width: 200,
      height: 15,
    });

    const form = pdfDoc.getForm();
    
    try {
      const sellerNameField = form.getTextField('sellerName');
      sellerNameField.setText(signatureName);
    } catch (err) {
      console.warn('Seller name field not found, adding as text');
      page.drawText(signatureName, {
        x: 25,
        y: 105,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }

    try {
      const sellerDateField = form.getTextField('sellerDate');
      sellerDateField.setText(signatureDate);
    } catch (err) {
      console.warn('Seller date field not found, adding as text');
      page.drawText(signatureDate, {
        x: 225,
        y: 85,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }

    const signedBytes = await pdfDoc.save();
    const blob = new Blob([signedBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  const handleSignDocument = async () => {
    if (!signatureName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!sellerRef.current || sellerRef.current.isEmpty()) {
      setError('Please provide your signature');
      return;
    }
    if (!signatureDate) {
      setError('Please select a valid date');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const canvas = sellerRef.current.getTrimmedCanvas();
      const signedPdfUrl = await embedSignatureInPdf(canvas);

      const response = await fetch(signedPdfUrl);
      const signedBytes = new Uint8Array(await response.arrayBuffer());

      function arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      }
      const signedPdfBase64 =
        'data:application/pdf;base64,' +
        arrayBufferToBase64(signedBytes);

      const res = await submitSignedPdf(token!, signedPdfBase64);
      if (!res.ok) {
        throw new Error(`Submit failed: ${res.status}`);
      }
      const { signedUrl } = res.data as { signedUrl?: string };
      alert('✅ Document signed successfully!');
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('[SellerSignPage] submit error', err);
      setError(err.message || 'Failed to submit signature');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    if (!sellerRef.current || sellerRef.current.isEmpty()) {
      setError("Please Sign first, then preview");
      return;
    }
    const canvas = sellerRef.current.getTrimmedCanvas();
    const signedPdfUrl = await embedSignatureInPdf(canvas);
    setPdfSrc(signedPdfUrl);
  };

  const handleClear = () => {
    sellerRef.current?.clear();
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfSrc(url);
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
            width: 50, height: 50,
            border: '5px solid rgba(255,255,255,0.1)',
            borderTop: '5px solid #60a5fa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
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
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: 600,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{
            color: '#f87171',
            marginBottom: 16,
            fontSize: '1.5rem'
          }}>
            Document Error
          </h2>
          <p style={{
            marginBottom: 24,
            color: '#cbd5e1',
            lineHeight: 1.6
          }}>
            {error}
          </p>
          <button onClick={() => { setError(null); setIsLoading(true); loadPdf();}}
            style={{
              padding: '12px 28px',
              marginRight: 10,
              background: 'linear-gradient(135deg, #334155, #475569)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}>
            Try Again
          </button>
          <button onClick={() => navigate('/')}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #475569, #64748b)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}>
            Return Home
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
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)'
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
            background: 'linear-gradient(135deg,#334155,#475569)',
            borderRadius: 12, 
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative', 
            overflow: 'auto', 
            height: '100vh'
          }}>
            <div style={{
              background: 'rgba(30,41,59,0.6)', 
              padding: '16px 24px',
              fontWeight: 600, 
              fontSize: '1.1rem', 
              color: '#e2e8f0',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              Document Preview
            </div>
            <div style={{ 
              height: '100vh',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              position: 'relative'
            }}>
              {pdfSrc && (
                <iframe
                  src={pdfSrc}
                  title="Document to sign"
                  width="100%"
                  height="100%"
                  style={{ border: 'none', display: 'block' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Signing Section */}
        <div style={{
          background: 'linear-gradient(135deg, #334155, #475569)',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          padding: 32,
          border: '1px solid rgba(255,255,255,0.1)',
          height: 'fit-content'
        }}>
          <h2 style={{
            color: '#e2e8f0',
            marginTop: 0,
            marginBottom: 24,
            paddingBottom: 16,
            fontSize: '1.5rem',
            fontWeight: 600,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
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
              onChange={e => setSignatureName(e.target.value)}
              placeholder="Enter your name as it appears on the document"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '1rem',
                backgroundColor: 'rgba(15,23,42,0.5)',
                color: '#f8fafc',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24, position: 'relative' }}>
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
              onChange={e => setSignatureDate(e.target.value)}
              onClick={() => setShowCalendar(true)}
              placeholder="MM-DD-YYYY"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(15,23,42,0.5)',
                color: '#f8fafc',
                cursor: 'pointer'
              }}
            />
            {showCalendar && (
              <CalendarPicker
                onSelect={date => {
                  setSignatureDate(date);
                  setShowCalendar(false);
                }}
                onClose={() => setShowCalendar(false)}
              />
            )}
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
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              backgroundColor: 'rgba(15,23,42,0.5)',
              overflow: 'hidden'
            }}>
              <SignatureCanvas
                ref={sellerRef}
                penColor="#000000"
                backgroundColor="#ffffff"
                canvasProps={{ width: 350, height: 150 }}
              />
            </div>
            <button
              onClick={handleClear}
              style={{
                marginTop: 12,
                padding: '10px 20px',
                background: 'rgba(15,23,42,0.5)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Clear Signature
            </button>
            
            <button 
              onClick={handlePreview}
              style={{
                marginTop: 12,
                padding: '10px 20px',
                background: 'rgba(15,23,42,0.5)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Preview Signature
            </button>
          </div>

          <div style={{
            background: 'rgba(30,64,175,0.15)',
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
              width: '100%',
              padding: '16px 28px',
              background: isSubmitting
                ? 'linear-gradient(135deg, #1e293b, #334155)'
                : 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1.1rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ position: 'relative', zIndex: 2 }}>Signing Document...</span>
                <span style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  height: '100%', width: '30%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'shimmer 1.5s infinite'
                }} />
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
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              Document ID:{' '}
              <code style={{
                background: 'rgba(15,23,42,0.5)',
                padding: '4px 8px',
                borderRadius: 4,
                color: '#e2e8f0'
              }}>
                {token}
              </code>
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