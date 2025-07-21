// src/pages/SubmitPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SubmitPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pdfData } = state as { pdfData: Uint8Array };
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert Uint8Array to Blob
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      
      // Create FormData for submission
      const formData = new FormData();
      formData.append('document', blob, 'signed-title.pdf');
      
      // Submit to backend API (simulated with timeout)
      // In a real app, you would use fetch or axios to send to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful submission
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signed-title.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isSubmitted) {
    return (
      <div style={{
        maxWidth: 500,
        margin: '40px auto',
        padding: 30,
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 72,
          color: '#28a745',
          marginBottom: 20
        }}>✓</div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 15
        }}>Submission Successful!</h1>
        <p style={{
          fontSize: 16,
          color: '#6c757d',
          marginBottom: 30,
          lineHeight: 1.5
        }}>
          Your document has been successfully submitted to the DMV.
          You will receive a confirmation email shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: 16,
            cursor: 'pointer',
            width: '100%',
            maxWidth: 300
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 500,
      margin: '40px auto',
      padding: 30,
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h1 style={{
        fontSize: 24,
        fontWeight: 600,
        marginBottom: 25,
        textAlign: 'center'
      }}>Submit Document</h1>
      
      {error && (
        <div style={{
          padding: 15,
          backgroundColor: '#ffebee',
          color: '#b71c1c',
          borderRadius: 4,
          marginBottom: 25,
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 30 }}>
        <p style={{ marginBottom: 15, lineHeight: 1.5 }}>
          Review your document before submitting to the DMV:
        </p>
        <div style={{
          padding: 15,
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          backgroundColor: '#f8f9fa'
        }}>
          <p style={{ fontWeight: 600 }}>Document: Signed Title Transfer</p>
          <p style={{ 
            fontSize: 14,
            color: '#6c757d',
            marginTop: 5
          }}>
            Ready for submission to Department of Motor Vehicles
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }}>
        <button
          onClick={handleDownload}
          style={{
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: 4,
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: 16,
            transition: 'background-color 0.2s'
          }}
          disabled={isLoading}
        >
          Download Copy
        </button>
        
        <button
          onClick={handleSubmit}
          style={{
            padding: '12px',
            borderRadius: 4,
            backgroundColor: isLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit to DMV'}
        </button>
      </div>
    </div>
  );
}