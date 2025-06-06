// src/pages/ReviewEditPDFPage.tsx

import React, { useRef, useEffect } from "react";
// “import type” means PDFViewerHandle is erased at runtime (no missing‐export error)
import PDFViewer, { type PDFViewerHandle } from "../components/PDFViewer";
import { fillAndFlattenPdf, downloadPdf } from "../utils/pdfUtils";

export default function ReviewEditPDFPage() {
  // Attach a ref to our PDFViewer so that we can call getFormData() later
  const viewerRef = useRef<PDFViewerHandle>(null);

  useEffect(() => {
    console.log("[ReviewEditPDFPage] Mounted. viewerRef =", viewerRef.current);
  }, []);

  async function handleSignAndSubmit() {
    console.log("[ReviewEditPDFPage] ▶️ Sign & Submit clicked");

    try {
      // 1) Grab the raw PDF bytes from public/
      const res = await fetch("/130-U-fillable.pdf");
      console.log(
        "[ReviewEditPDFPage] 📥 fetched /130-U-fillable.pdf, status =",
        res.status
      );
      const originalPdfBytes = await res.arrayBuffer();

      // 2) Pull form values from PDFViewer via the ref
      const formData = viewerRef.current?.getFormData() || {};
      console.log("[ReviewEditPDFPage] Current formData =", formData);

      // 3) Use pdf-lib (inside fillAndFlattenPdf) to produce a flattened PDF
      const filledBytes = await fillAndFlattenPdf(originalPdfBytes, formData);
      console.log("[ReviewEditPDFPage] 🎉 PDF filled & flattened");

      // 4) Trigger browser download
      downloadPdf(filledBytes, "130-U-filled.pdf");
      console.log("[ReviewEditPDFPage] 💾 downloadPdf invoked");
    } catch (err) {
      console.error("[ReviewEditPDFPage] ❌ Error during Sign & Submit:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Review & Complete the 130-U PDF
      </h1>

      <div className="bg-white rounded shadow p-4">
        {/* Mount our PDFViewer and attach the ref */}
        <PDFViewer ref={viewerRef} url="/130-U-fillable.pdf" />

        <div className="mt-4">
          <button
            onClick={handleSignAndSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign &amp; Submit
          </button>
        </div>
      </div>
    </div>
  );
}
