// src/pages/PreviewPage.tsx
import React, { useEffect, useState } from 'react';
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

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: 'auto' }}>
      <h1>Document Preview</h1>
      
      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            padding: '10px 15px', 
            background: '#6c757d', 
            color: 'white',
            border: 'none',
            borderRadius: 4
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
            borderRadius: 4
          }}
          disabled={!pdfUrl}
        >
          Download PDF
        </button>
      </div>

      {pdfUrl ? (
        <div style={{ height: '80vh', border: '1px solid #ccc', borderRadius: 4 }}>
          <iframe 
            src={pdfUrl} 
            title="PDF Preview"
            width="100%"
            height="100%"
          />
        </div>
      ) : !error && (
        <p>Loading document preview...</p>
      )}
    </div>
  );
}