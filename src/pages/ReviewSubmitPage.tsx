// src/pages/ReviewSubmitPage.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { fillAndFlattenPdf } from "../utils/pdfUtils";

export default function ReviewSubmitPage() {
  const { state } = useLocation() as {
    state: { titleForm: Record<string, string|boolean> }
  };
  const formData = state.titleForm;

  const handleDownload = async () => {
    // 1) Load the blank form
    const res      = await fetch("/130-U.pdf");
    const template = await res.arrayBuffer();

    // 2) Fill + flatten
    const filled   = await fillAndFlattenPdf(template, formData);

    // 3) Trigger download
    const blob     = new Blob([filled], { type: "application/pdf" });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement("a");
    a.href         = url;
    a.download     = "130-U-filled.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Step 4: Download Your Completed 130-U</h1>
      <p>Click below to get your filled form and send it on for signature.</p>
      <button onClick={handleDownload}>Download PDF</button>
    </div>
  );
}
