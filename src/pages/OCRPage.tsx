// src/pages/OCRPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ocr.css";

interface OcrData {
  name: string;
  dob: string;
  dlNumber: string;
}

export default function OCRPage() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<OcrData>({
    name: "",
    dob: "",
    dlNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] ?? null;
    setFile(chosen);
    setError(null);

    if (!chosen) return;
    setLoading(true);

    try {
      // simulate OCR delay
      await new Promise((r) => setTimeout(r, 1500));

      // dummy OCR data
      setOcrData({
        name: "Jane Doe",
        dob: "1985-04-23",
        dlNumber: "D12345678",
      });
    } catch {
      setError("Failed to run OCR. Please try another file.");
    } finally {
      setLoading(false);
    }
  };

  const canContinue =
    Boolean(ocrData.name) &&
    Boolean(ocrData.dob) &&
    Boolean(ocrData.dlNumber);

  const handleNext = () => {
    navigate("/upload-title", { state: { ocr: ocrData } });
  };

  return (
    <div className="main-container">
      <div className="page-container">
      <h1 className="heading">Step 1: Upload &amp; OCR Driver’s License</h1>

      <p className="description">
        Please upload a clear photo or PDF of your driver’s license.
      </p>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="file-input"
      />

      {loading && (
        <p className="status-text">Running OCR, please wait…</p>
      )}
      {error && (
        <p className="status-text error">{error}</p>
      )}

      {!loading && ocrData.name && (
        <div className="ocr-data">
          <p>
            <strong>Extracted Name:</strong> {ocrData.name}
          </p>
          <p>
            <strong>Date of Birth:</strong> {ocrData.dob}
          </p>
          <p>
            <strong>DL #:</strong> {ocrData.dlNumber}
          </p>
        </div>
      )}

      <button
        disabled={!canContinue}
        onClick={handleNext}
        className={`btn ${canContinue ? "primary" : "disabled"}`}
      >
        Next: Upload Title Document
      </button>
    </div>
    </div>
  );
}
