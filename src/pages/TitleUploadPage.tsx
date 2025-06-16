// src/pages/TitleUploadPage.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ocr.css";

interface OcrData {
  name: string;
  dob: string;
  dlNumber: string;
}

interface LocationState {
  ocr?: OcrData;
}

export default function TitleUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};
  const ocr = state.ocr;

  // Redirect back if we have no OCR data
  useEffect(() => {
    if (!ocr) navigate("/", { replace: true });
  }, [ocr, navigate]);

  const [file, setFile] = useState<File | null>(null);
  const canContinue = Boolean(file);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function handleNext() {
    if (ocr && file) {
      navigate("/responsive-form", {
        state: { ocr, titleFile: file },
      });
    }
  }

  if (!ocr) return null;

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 2: Upload Your Title Document</h1>

        <p className="description">
          Hi <strong>{ocr.name}</strong>, please upload a clear photo or PDF of
          your title.
        </p>

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="file-input"
        />

        <button
          disabled={!canContinue}
          onClick={handleNext}
          className={`btn ${canContinue ? "primary" : "disabled"}`}
        >
          Next: Fill Title Form
        </button>
      </div>
    </div>
  );
}
