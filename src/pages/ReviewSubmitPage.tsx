import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { saveAs } from 'file-saver';
import { fillAndFlattenPdf, type PdfSignature } from '../utils/pdfUtils';

type SigPad = InstanceType<typeof SignatureCanvas>;

export default function ReviewSubmitPage() {
  const { state } = useLocation();
  const { titleForm = {}, signatures = {} as Record<string,string> } = (state as any) || {};

  const sellerRef     = useRef<SigPad>(null);
  const ownerRef      = useRef<SigPad>(null);
  const additionalRef = useRef<SigPad>(null);

  // preload existing signature data-URLs
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
      saveAs(new Blob([out], { type: 'application/pdf' }), '130-U-signed.pdf');
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding:24, maxWidth:800, margin:'auto' }}>
      <h1>Review &amp; Sign</h1>
      {error && <pre style={{ color:'red', whiteSpace:'pre-wrap' }}>{error}</pre>}

      {/** Seller **/}
      <section>
        <h2>Seller’s Signature</h2>
        <SignatureCanvas ref={sellerRef} penColor="black"
          canvasProps={{ width:600, height:150, className:'sigCanvas',
            style:{ border:'1px solid #ccc', borderRadius:4 }}}/>
        <button onClick={()=>sellerRef.current?.clear()}>Clear Seller</button>
      </section>

      {/** Owner **/}
      <section>
        <h2>Applicant/Owner’s Signature</h2>
        <SignatureCanvas ref={ownerRef} penColor="black"
          canvasProps={{ width:600, height:150, className:'sigCanvas',
            style:{ border:'1px solid #ccc', borderRadius:4 }}}/>
        <button onClick={()=>ownerRef.current?.clear()}>Clear Owner</button>
      </section>

      {/** Additional **/}
      <section>
        <h2>Additional Applicant’s Signature</h2>
        <SignatureCanvas ref={additionalRef} penColor="black"
          canvasProps={{ width:600, height:150, className:'sigCanvas',
            style:{ border:'1px solid #ccc', borderRadius:4 }}}/>
        <button onClick={()=>additionalRef.current?.clear()}>Clear Additional</button>
      </section>

      <button
        onClick={handleDownload}
        disabled={isLoading}
        style={{
          marginTop:20,
          padding:'0.75rem 1.5rem',
          backgroundColor: isLoading?'#ccc':'#007bff',
          color:'white', border:'none', borderRadius:4,
        }}
      >
        {isLoading?'Generating PDF…':'Download Signed PDF'}
      </button>
    </div>
  );
}

