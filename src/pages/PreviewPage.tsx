import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PreviewPage() {
  const { state } = useLocation();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.pdfData) {
      setError('No PDF data found. Please go back and generate the document.');
      return;
    }
    
    try {
      const blob = new Blob([state.pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Clean up on unmount
      return () => URL.revokeObjectURL(url);
    } catch (e) {
      setError('Failed to load PDF document');
    }
  }, [state]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = '130-U-signed.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSendToSeller = () => {
    if (!state?.pdfData) {
      setError('Cannot send email - no PDF data available');
      return;
    }
    navigate('/email-sent', { 
      state: { 
        pdfData: state.pdfData,
        // Add any other necessary data like form data or document reference
      } 
    });
  };

  return (
    <div style={{ 
      padding: 24, 
      maxWidth: 1200, 
      margin: 'auto',
      backgroundColor: 'var(--light)',
      color: 'var(--secondary)',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        color: 'var(--primary)',
        marginBottom: 24,
        borderBottom: '2px solid var(--primary-dark)',
        paddingBottom: 16
      }}>
        Document Preview
      </h1>
      
      {error && (
        <div style={{ 
          color: 'var(--danger)', 
          backgroundColor: 'var(--danger-light)',
          padding: '12px 16px', 
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius)',
          marginBottom: 24,
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ 
        marginBottom: 20, 
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10 
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            padding: '12px 18px', 
            background: 'var(--primary-dark)', 
            color: 'var(--lighter)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            flex: '1 1 120px',
            minWidth: 120,
            fontWeight: 600,
            fontSize: 14,
            transition: 'var(--transition)',
            boxShadow: 'var(--shadow)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
        >
          Back to Edit
        </button>
        
        <button 
          onClick={handleDownload}
          style={{ 
            padding: '12px 18px', 
            background: 'var(--primary)', 
            color: 'var(--lighter)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            flex: '1 1 150px',
            minWidth: 150,
            fontWeight: 600,
            fontSize: 14,
            transition: 'var(--transition)',
            boxShadow: 'var(--shadow)'
          }}
          disabled={!pdfUrl}
          onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
          onMouseOut={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--primary)')}
        >
          Download PDF
        </button>

        <button 
          onClick={handleSendToSeller}
          style={{ 
            padding: '12px 18px', 
            background: 'var(--success)', 
            color: 'var(--lighter)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            flex: '1 1 180px',
            minWidth: 180,
            fontWeight: 600,
            fontSize: 14,
            transition: 'var(--transition)',
            boxShadow: 'var(--shadow)'
          }}
          disabled={!pdfUrl}
          onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--success-dark)')}
          onMouseOut={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--success)')}
        >
          Send to Seller
        </button>
      </div>

      {pdfUrl ? (
        <div style={{ 
          height: '80vh', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
          backgroundColor: 'var(--lighter)'
        }}>
          <iframe 
            src={pdfUrl} 
            title="PDF Preview"
            width="100%"
            height="100%"
          />
        </div>
      ) : !error && (
        <div style={{
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--lighter)'
        }}>
          <p style={{ color: 'var(--primary-dark)' }}>Loading document preview...</p>
        </div>
      )}
    </div>
  );
}