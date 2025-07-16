// src/pages/PreviewPage.tsx
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

  const handleSubmit = () => {
    if (!state?.pdfData) {
      setError('Cannot submit - no PDF data available');
      return;
    }
    navigate('/submit', { state: { pdfData: state.pdfData } });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: 'auto' }}>
      <h1>Document Preview</h1>
      
      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          border: '1px solid red',
          borderRadius: 4,
          marginBottom: 15,
          backgroundColor: '#ffebee'
        }}>
          {error}
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
            padding: '10px 15px', 
            background: '#6c757d', 
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            flex: '1 1 120px',
            minWidth: 120
          }}
        >
          Back to Edit
        </button>
        
        <button 
          onClick={handleDownload}
          style={{ 
            padding: '10px 15px', 
            background: '#28a745', 
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            flex: '1 1 150px',
            minWidth: 150
          }}
          disabled={!pdfUrl}
        >
          Download PDF
        </button>

        <button 
          onClick={handleSubmit}
          style={{ 
            padding: '10px 15px', 
            background: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            flex: '1 1 180px',
            minWidth: 180
          }}
          disabled={!pdfUrl}
        >
          Submit Document
        </button>
      </div>

      {pdfUrl ? (
        <div style={{ 
          height: '80vh', 
          border: '1px solid #ccc', 
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
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
          border: '1px dashed #ccc',
          borderRadius: 4
        }}>
          <p style={{ color: '#6c757d' }}>Loading document preview...</p>
        </div>
      )}
    </div>
  );
}