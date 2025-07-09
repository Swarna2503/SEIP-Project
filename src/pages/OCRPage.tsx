import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { postOCR } from "../apis/driver_license";
import { useAuth } from "../hooks/auth";
import "../styles/ocr.css";

import CameraCapture from "../components/CameraCapture";

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
  const [showCamera, setShowCamera] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Validate file type and size
  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setFileError(
        "Invalid file type. Accepted: PDF, JPG, JPEG, PNG."
      );
      return false;
    }

    if (file.size > maxSize) {
      setFileError(
        `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max size: 10MB.`
      );
      return false;
    }

    setFileError(null);
    return true;
  };

  // Create preview for file
  const createPreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreview({
        url,
        name: file.name,
        type: "image",
      });
    } else {
      setFilePreview({
        url: "", // PDFs don't get a preview URL
        name: file.name,
        type: "pdf",
      });
    }
  };

  // Handle file selection from any source
  const handleFile = async (fileOrBlob: File | Blob | null) => {
    if (!fileOrBlob) return;
    if (!userId) {
      setError("User not logged in. Please log in again.");
      return;
    }

    let file: File;
    if (fileOrBlob instanceof Blob) {
      file = new File([fileOrBlob], "capture.jpg", {
        type: fileOrBlob.type,
      });
    } else {
      file = fileOrBlob;
    }

    // Validate before processing
    if (!validateFile(file)) {
      return;
    }

    setError(null);
    setFileError(null);
    setLoading(true);
    
    try {
      createPreview(file);
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

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  // Clear previews when component unmounts
  useEffect(() => {
    return () => {
      if (filePreview?.url) {
        URL.revokeObjectURL(filePreview.url);
      }
    };
  }, [filePreview]);

  const canContinue =
    Boolean(ocrData.name) &&
    Boolean(ocrData.address) &&
    Boolean(ocrData.dlNumber) &&
    Boolean(ocrData.state);

  // Handle file removal
  const handleRemoveFile = () => {
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
    setFilePreview(null);
    setOcrData({
      name: "",
      address: "",
      dlNumber: "",
      state: "",
    });
  };

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 1: Upload & OCR Driver’s License</h1>
        <p className="description">
          Please upload a clear photo or PDF of your driver’s license, or skip
          to continue.
        </p>

        {/* File preview section */}
        {filePreview && (
          <div className="preview-container">
            {filePreview.type === "image" ? (
              <img
                src={filePreview.url}
                alt="Preview"
                className="preview-image"
              />
            ) : (
              <div className="pdf-preview">
                <div className="pdf-icon">📄</div>
                <div className="pdf-name">{filePreview.name}</div>
              </div>
            )}
            <button
              type="button"
              className="btn remove-button"
              onClick={handleRemoveFile}
              disabled={loading}
            >
              × Remove
            </button>
          </div>
        )}

        {/* Dropzone */}
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="file-input"
        />

        {/* Error banner for file validation */}
        {fileError && (
          <div className="error-banner">
            <div className="error-icon">⚠️</div>
            <div className="error-message">{fileError}</div>
          </div>
        )}

        <div className="button-group">
          <label
            className={`btn choose-button ${loading ? "disabled" : ""}`}
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            📁 Choose File
          </label>

          <button
            className={`btn camera-button ${loading ? "disabled" : ""}`}
            onClick={() => !loading && setShowCamera(true)}
            disabled={loading}
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
            disabled={loading}
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