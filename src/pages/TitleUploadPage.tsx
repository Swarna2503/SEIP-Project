import React, { useState, useEffect, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/title.css";


interface OcrData {
  name: string;
  dob: string;
  dlNumber: string;
}

interface LocationState {
  ocr: OcrData | null;
}

export default function TitleUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ocr } = (location.state as LocationState) || { ocr: null };

  // If we landed here without getting OCR data at all, bounce back home
  useEffect(() => {
    if (ocr === undefined) {
      navigate("/", { replace: true });
    }
  }, [ocr, navigate]);
  if (ocr === undefined) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canContinue = Boolean(file);

  function handleFile(f: File | null) {
    setError(null);
    setFile(f);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const dt = e.dataTransfer.files;
    if (dt && dt[0]) handleFile(dt[0]);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleNext() {
    if (file) {
      navigate("/responsive-form", {
        state: { ocr, titleFile: file },
      });
    }
  }

  function handleSkip() {
    navigate("/responsive-form", {
      state: { ocr, titleFile: null },
    });
  }

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 2: Upload Your Title Document</h1>
        <p className="description">
          {ocr
            ? <>Hi <strong>{ocr.name}</strong>, please upload a clear photo or PDF of your title.</>
            : <>Please upload a clear photo or PDF of your title.</>}
        </p>

        {/* ─── Drag & Drop Box ─── */}
        <div
          className="dropzone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">📄</div>
          <div className="dropzone-text">
            <strong>Drag and drop your title here</strong>
            <div>or click to browse</div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          id="titleFile"
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          className="file-input"
          style={{ display: "none" }}
        />

        <label htmlFor="titleFile" className="choose-button">
          📁 Choose File
        </label>
        {error && <p className="status-text error">{error}</p>}

        <div className="card-footer">
          <button
            className={`btn primary${!canContinue ? " disabled" : ""}`}
            onClick={handleNext}
            disabled={!canContinue}
          >
            Next: Fill Title Form →
          </button>
          <button type="button" className="btn skip" onClick={handleSkip}>
            &gt; Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
