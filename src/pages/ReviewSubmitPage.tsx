// src/pages/ReviewSubmitPage.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { saveAs } from "file-saver";
import { fillAndFlattenPdf } from "../utils/pdfUtils";

export default function ReviewSubmitPage() {
  const { state } = useLocation();
  const { titleForm } = state || {};
  console.debug("⚙️  ReviewSubmitPage mounted, location.state =", state);

  const handleDownload = async () => {
    try {
      console.group("🖨️ handleDownload");
      console.debug("↳ form data being submitted:", titleForm);

      // 1) Fetch
      console.debug("↳ fetching template at /130-U.pdf");
      const res = await fetch("/130-U.pdf");
      console.debug("↳ fetch response:", res.status, res.headers.get("content-type"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const templateBytes = await res.arrayBuffer();
      console.debug("↳ templateBytes.byteLength =", templateBytes.byteLength);

      // 2) Fill & flatten
      const filledBytes = await fillAndFlattenPdf(templateBytes, titleForm);
      console.debug("↳ fillAndFlattenPdf returned Uint8Array of length", filledBytes.byteLength);

      // 3) Download
      const blob = new Blob([filledBytes], { type: "application/pdf" });
      console.debug("↳ triggering saveAs() …");
      saveAs(blob, "130-U-filled.pdf");
      console.groupEnd();
    } catch (err: any) {
      console.error("❌ Failed to generate PDF:", err);
      alert(`Failed to generate PDF:\n${err.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Review & Download</h1>
      <p>Click below to download your completed 130-U…</p>
      <button onClick={handleDownload}>Download PDF</button>
    </div>
  );
}
