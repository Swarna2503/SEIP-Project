// src/pages/ReviewSubmitPage.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { fillAndFlattenPdf, type PdfSignature } from '../utils/pdfUtils';

type SigPad = InstanceType<typeof SignatureCanvas>;

export default function ReviewSubmitPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { titleForm = {}, signatures = {} as Record<string,string> } = (state as any) || {};

  const sellerRef     = useRef<SigPad>(null);
  const ownerRef      = useRef<SigPad>(null);
  const additionalRef = useRef<SigPad>(null);

  // Preload existing signature data-URLs
  useEffect(() => {
    const load = (r: React.RefObject<SigPad>, url?: string) => {
      if (r.current && url?.startsWith('data:image')) {
        r.current.clear();
        r.current.fromDataURL(url);
      }
    };
    load(sellerRef,     signatures.SellerSignature);
    load(ownerRef,      signatures.OwnerSignature);
    load(additionalRef, signatures.AdditionalSignature);
  }, [signatures]);

  const getSig = (r: React.RefObject<SigPad>) =>
    r.current && !r.current.isEmpty()
      ? r.current.getCanvas().toDataURL('image/png')
      : null;

  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string|null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const sigs: PdfSignature[] = [
        { key: 'SellerSignature',     dataUrl: signatures.SellerSignature     || getSig(sellerRef)     },
        { key: 'OwnerSignature',      dataUrl: signatures.OwnerSignature      || getSig(ownerRef)      },
        { key: 'AdditionalSignature', dataUrl: signatures.AdditionalSignature || getSig(additionalRef) },
      ];
      
      const resp = await fetch('/130-U.pdf');
      if (!resp.ok) throw new Error(`PDF load failed (${resp.status})`);
      
      const buf = new Uint8Array(await resp.arrayBuffer());
      const out = await fillAndFlattenPdf(buf, titleForm, sigs);

      // Navigate to preview page with PDF data
      navigate('/preview', {
        state: {
          pdfData: out,
          formData: titleForm,  // Contains state abbreviations
          signatures,
        }
      });
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 24,
      maxWidth: 800,
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
        Review &amp; Sign
      </h1>
      
      {error && <div style={{
        color: 'var(--danger)',
        backgroundColor: 'var(--danger-light)',
        padding: '12px 16px',
        borderRadius: 'var(--radius)',
        marginBottom: 24,
        border: '1px solid var(--danger)'
      }}>
        <strong>Error:</strong> {error}
      </div>}

      {/** Seller **/}
      <section style={{ 
        marginBottom: 32,
        backgroundColor: 'var(--lighter)',
        padding: 20,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ 
          color: 'var(--primary)',
          marginTop: 0,
          marginBottom: 16
        }}>Seller’s Signature</h2>
        
        <SignatureCanvas ref={sellerRef} penColor="black"
          canvasProps={{ width:600, height:150, className:'sigCanvas',
            style:{
              border:'1px solid var(--border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--lighter)',
            }}}/>
        
        <button 
          onClick={() => sellerRef.current?.clear()}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--light)',
            color: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            marginTop: 12,
            transition: 'var(--transition)',
            fontWeight: 600,
            fontSize: 14,
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--light)'}
        >
          Clear Seller Signature
        </button>
      </section>

      {/** Owner **/}
      <section style={{ 
        marginBottom: 32,
        backgroundColor: 'var(--lighter)',
        padding: 20,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ 
          color: 'var(--primary)',
          marginTop: 0,
          marginBottom: 16
        }}>Applicant/Owner’s Signature</h2>
        
        <SignatureCanvas ref={ownerRef} penColor="black"
          canvasProps={{ width:600, height:150, className:'sigCanvas',
            style:{
              border:'1px solid var(--border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--lighter)',
            }}}/>
        
        <button 
          onClick={() => ownerRef.current?.clear()}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--light)',
            color: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            marginTop: 12,
            transition: 'var(--transition)',
            fontWeight: 600,
            fontSize: 14,
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--light)'}
        >
          Clear Owner Signature
        </button>
      </section>

      {/** Additional **/}
      <section style={{ 
        marginBottom: 32,
        backgroundColor: 'var(--lighter)',
        padding: 20,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ 
          color: 'var(--primary)',
          marginTop: 0,
          marginBottom: 16
        }}>Additional Applicant’s Signature</h2>
        
        <SignatureCanvas ref={additionalRef} penColor="black"
          canvasProps={{ width:600, height:150, className:'sigCanvas',
            style:{
              border:'1px solid var(--border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--lighter)',
            }}}/>
        
        <button 
          onClick={() => additionalRef.current?.clear()}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--light)',
            color: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            marginTop: 12,
            transition: 'var(--transition)',
            fontWeight: 600,
            fontSize: 14,
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--light)'}
        >
          Clear Additional Signature
        </button>
      </section>

      <button
        onClick={handleDownload}
        disabled={isLoading}
        style={{
          marginTop: 20,
          padding: '14px 28px',
          backgroundColor: isLoading ? 'var(--primary-dark)' : 'var(--primary)',
          color: 'var(--lighter)',
          border: 'none',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow)',
          transition: 'var(--transition)',
          fontSize: '1.1rem',
          fontWeight: 600,
          display: 'block',
          width: '100%',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
        onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
        onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--primary)')}
      >
        {isLoading ? 'Generating PDF…' : 'Preview & Download'}
      </button>
    </div>
  );
}