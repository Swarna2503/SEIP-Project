// src/pages/OCRPage.tsx
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { postOCR } from "../apis/driver_license";
import { useAuth } from "../hooks/auth";
import "../styles/ocr.css";

import CameraCapture from "../components/CameraCapture"; // ← new import

interface OcrData {
  name: string;
  address: string;
  dlNumber: string;
  state: string;
}

export default function OCRPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.user_id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrData, setOcrData] = useState<OcrData>({
    name: "",
    address: "",
    dlNumber: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // new state to show/hide our camera overlay
  const [showCamera, setShowCamera] = useState(false);

  // unify File or Blob into a File
  const handleFile = async (fileOrBlob: File | Blob | null) => {
    if (!fileOrBlob) return;
    if (!userId) {
      setError("User not logged in. Please log in again.");
      return;
    }
    setError(null);
    setLoading(true);

    // convert blob → File
    const file =
      fileOrBlob instanceof Blob
        ? new File([fileOrBlob], "capture.jpg", { type: fileOrBlob.type })
        : fileOrBlob;

    try {
      const data = await postOCR(file, userId);
      setOcrData({
        name: data.name,
        address: data.address,
        dlNumber: data.dlNumber,
        state: data.state,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) =>
    handleFile(e.target.files?.[0] ?? null);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const canContinue =
    Boolean(ocrData.name) &&
    Boolean(ocrData.address) &&
    Boolean(ocrData.dlNumber) &&
    Boolean(ocrData.state);

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 1: Upload & OCR Driver’s License</h1>
        <p className="description">
          Please upload a clear photo or PDF of your driver’s license, or skip
          to continue.
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

        {/* hidden file input for disk uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          className="file-input"
        />

        <div className="button-group">
          <label
            className="btn choose-button"
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Choose File
          </label>

          {/* open our in-page camera overlay */}
          <button
            className="btn camera-button"
            onClick={() => setShowCamera(true)}
          >
            📷 Take a Photo
          </button>
        </div>

        {loading && <p className="status-text">Running OCR, please wait…</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && ocrData.name && (
          <div className="ocr-data">
            <p>
              <strong>Name:</strong> {ocrData.name}
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
            needed. However, having it ready will help speed up the process.
          </p>
        </div>

        <div className="buttons">
          <button
            className="btn primary"
            disabled={!canContinue || loading}
            onClick={() =>
              navigate("/upload-title", { state: { ocr: ocrData } })
            }
          >
            Continue →
          </button>
          <button
            type="button"
            className="btn skip"
            onClick={() => navigate("/upload-title", { state: { ocr: null } })}
          >
            &gt; Skip for now
          </button>
        </div>

        {showCamera && (
          <CameraCapture
            onCapture={(blob) => handleFile(blob)}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </div>
  );
}
