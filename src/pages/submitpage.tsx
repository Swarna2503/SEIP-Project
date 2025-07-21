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

      <div style={{ marginBottom: 30 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 15
        }}>Upload Additional Documents</h2>
        
        <div style={{
          border: '2px dashed #e0e0e0',
          borderRadius: 8,
          padding: 30,
          textAlign: 'center',
          backgroundColor: '#fafafa',
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
              backgroundColor: '#f0f2f5',
              borderRadius: 4,
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              fontWeight: 500,
              marginBottom: 15
            }}
          >
            {isUploading ? 'Uploading...' : 'Select File to Upload'}
          </label>
          <p style={{ color: '#6c757d', fontSize: 14 }}>
            Accepted formats: PDF, JPG, PNG (max 5MB)
          </p>
          {uploadStatus && (
            <p style={{ 
              marginTop: 15,
              color: '#28a745',
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
            padding: '12px',
            borderRadius: 4,
            backgroundColor: isLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          disabled={isLoading || isUploading}
        >
          {isLoading ? 'Submitting...' : 'Submit to DMV'}
        </button>
      </div>
    </div>
  );
}