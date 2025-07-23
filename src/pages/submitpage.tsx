// src/pages/SubmitPage.tsx
import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SubmitPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pdfData } = state as { pdfData: Uint8Array };
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadStatus(null);
    setError(null);
    
    try {
      const file = files[0];
      
      // Simulate upload process
      setUploadStatus(`Uploading ${file.name}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }
      
      setUploadStatus(`${file.name} uploaded successfully!`);
      
      // Here you would typically send the file to your backend
      // Example using fetch:
      /*
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      */
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      // Reset the input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isSubmitted) {
    return (
      <div style={{
        maxWidth: 500,
        margin: '40px auto',
        padding: 30,
        backgroundColor: 'var(--lighter)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 72,
          color: 'var(--primary)',
          marginBottom: 20
        }}>✓</div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 15,
          color: 'var(--primary)'
        }}>Submission Successful!</h1>
        <p style={{
          fontSize: 16,
          color: 'var(--primary-dark)',
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
            backgroundColor: 'var(--primary)',
            color: 'var(--lighter)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontSize: 16,
            cursor: 'pointer',
            width: '100%',
            maxWidth: 300,
            fontWeight: 600,
            transition: 'var(--transition)',
            boxShadow: 'var(--shadow)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
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
      backgroundColor: 'var(--lighter)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      color: 'var(--secondary)'
    }}>
      <h1 style={{
        fontSize: 24,
        fontWeight: 600,
        marginBottom: 25,
        textAlign: 'center',
        color: 'var(--primary)'
      }}>Submit Document</h1>
      
      {error && (
        <div style={{
          padding: 15,
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          borderRadius: 'var(--radius)',
          marginBottom: 25,
          border: '1px solid var(--danger)'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 30 }}>
        <p style={{ marginBottom: 15, lineHeight: 1.5, color: 'var(--secondary)' }}>
          Review your document before submitting to the DMV:
        </p>
        <div style={{
          padding: 15,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--light)'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--primary)' }}>Document: Signed Title Transfer</p>
          <p style={{ 
            fontSize: 14,
            color: 'var(--primary-dark)',
            marginTop: 5
          }}>
            Ready for submission to Department of Motor Vehicles
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 15,
          color: 'var(--primary)'
        }}>Upload Additional Documents</h2>
        
        <div style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius)',
          padding: 30,
          textAlign: 'center',
          backgroundColor: 'var(--light)',
          marginBottom: 15
        }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isUploading}
            style={{ display: 'none' }}
            id="document-upload"
          />
          <label
            htmlFor="document-upload"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'var(--lighter)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              border: '1px solid var(--border)',
              fontWeight: 500,
              marginBottom: 15,
              transition: 'var(--transition)',
              color: 'var(--secondary)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--lighter)'}
          >
            {isUploading ? 'Uploading...' : 'Select File to Upload'}
          </label>
          <p style={{ color: 'var(--primary-dark)', fontSize: 14 }}>
            Accepted formats: PDF, JPG, PNG (max 5MB)
          </p>
          {uploadStatus && (
            <p style={{ 
              marginTop: 15,
              color: 'var(--primary)',
              fontWeight: 500
            }}>
              {uploadStatus}
            </p>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: '14px',
            borderRadius: 'var(--radius)',
            backgroundColor: isLoading ? 'var(--primary-dark)' : 'var(--primary)',
            color: 'var(--lighter)',
            border: 'none',
            fontSize: 16,
            cursor: 'pointer',
            transition: 'var(--transition)',
            fontWeight: 600,
            boxShadow: 'var(--shadow)'
          }}
          disabled={isLoading || isUploading}
          onMouseOver={(e) => !isLoading && !isUploading && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
          onMouseOut={(e) => !isLoading && !isUploading && (e.currentTarget.style.backgroundColor = 'var(--primary)')}
        >
          {isLoading ? 'Submitting...' : 'Submit to DMV'}
        </button>
      </div>
    </div>
  );
}