import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { postOCR } from "../apis/driver_license";
import { useAuth } from "../hooks/auth";
import "../styles/ocr.css";

// change 
interface OcrData {
  name: string;
  address: string;
  dlNumber: string;
  state: string;
}

export default function OCRPage() {
  const navigate = useNavigate();
  // authentication hook to get user info
  const { user } = useAuth();
  console.log("current user:", user);
  const userId = user?.user_id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<OcrData>({
    name: "",
    address: "",
    dlNumber: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (chosen: File | null) => {
    if (!chosen) return;
    if (!userId) {
      console.error("User ID is not available");
      setError("User ID is not available. Please log in again.");
      return;
    }
    setFile(chosen);
    setError(null);
    setLoading(true);

    try {
      const data = await postOCR(chosen, userId);

      setOcrData({
        name: data.name,
        address: data.address,
        dlNumber: data.dlNumber,
        state: data.state,
      });
    } catch (err: any) {
      console.error("OCR failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] ?? null;
    handleFile(chosen);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dt = e.dataTransfer.files;
    if (dt && dt[0]) handleFile(dt[0]);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Check if all required fields are filled
  const canContinue =
    Boolean(ocrData.name) &&
    Boolean(ocrData.address) &&
    Boolean(ocrData.dlNumber) &&
    Boolean(ocrData.state);


  const handleNext = () => {
    navigate("/upload-title", { state: { ocr: ocrData } });
  };

  const handleSkip = () => {
    navigate("/upload-title", { state: { ocr: null } });
  };

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 1: Upload & OCR Driver’s License</h1>
        <p className="description">
          Please upload a clear photo or PDF of your driver’s license, or skip to continue.
        </p>

        <div
          className="dropzone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">📄</div>
          <div className="dropzone-text">
            <strong>Drag and drop your file here</strong>
            <div>or click to browse</div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          id="file"
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          className="file-input"
        />

        <label htmlFor="file" className="choose-button">
          📁 Choose File
        </label>

        {loading && <p className="status-text">Running OCR, please wait…</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && ocrData.name && (
          <div className="ocr-data">
            <p>
              <strong>Extracted Name:</strong> {ocrData.name}
            </p>
            <p>
              <strong>Address:</strong> {ocrData.address}
            </p>
            <p>
              <strong>DL #:</strong> {ocrData.dlNumber}
            </p>
            <p>
              <strong>State:</strong> {ocrData.state}
            </p>
          </div>
        )}

        <div className="accepted-box">
          <h4>Accepted File Types:</h4>
          <ul>
            <li>PDF documents (.pdf)</li>
            <li>Image files (.jpg, .jpeg, .png)</li>
            <li>Maximum file size: 10MB</li>
          </ul>
        </div>

        <div className="skip-box">
          <h4>Skip Upload:</h4>
          <p>
            You can skip this step and upload your driver's license later if
            needed. However, having it ready will help speed up the
            process.
          </p>
        </div>

        <div className="buttons">
          <button
            className="btn primary"
            disabled={!canContinue || loading}
            onClick={handleNext}
          >
            Continue  →
          </button>
          <button
            type="button"                
            className="btn skip"
            onClick={handleSkip}
          >
            &gt; Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
