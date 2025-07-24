// src/pages/OCRPage.tsx
import { useNavigate, Navigate } from "react-router-dom";
import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { postOCR, getLatestOCR } from "../apis/driver_license";
import { useAuth } from "../hooks/auth";
import "../styles/ocr.css";

import CameraCapture from "../components/CameraCapture";

interface OcrData {
  first_name: string;
  last_name: string;
  name: string;
  address: string;
  dlNumber: string;
  state: string;
  city?: string;
  street_address?: string;
  zip_code?: string;
}

export default function OCRPage() {
  const navigate = useNavigate();
  const { user, loading:authLoading} = useAuth();
  const userId = user?.user_id;
  // check if userId is available
  console.log("[DEBUG] userId:", userId);
  if (authLoading) {
    return <div className="loading">Loading user info...</div>;
  }

  if (!user?.user_id) {
    return <Navigate to="/login" replace />;
  }


  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ocrData, setOcrData] = useState<OcrData>({
    first_name: "",
    last_name: "",
    name: "",
    address: "",
    dlNumber: "",
    state: "",
    street_address: "",
    zip_code: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Load latest OCR from backend
  // useEffect(() => {
  //   const fetchLatest = async () => {
  //     if (!userId) return;
  //     try {
  //       const data = await getLatestOCR(userId);
  //       if (data && data.dlNumber) {
  //         setOcrData({
  //           first_name: data.first_name,
  //           last_name: data.last_name,
  //           name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
  //           address: data.address,
  //           dlNumber: data.dlNumber,
  //           state: data.state,
  //           street_address: data.street_address,
  //           zip_code: data.zip_code,
  //           city: data.city,
  //         });
  //       }
  //     } catch {
  //       console.warn("No previous OCR found or fetch failed.");
  //     }
  //   };
  //   fetchLatest();
  // }, [userId]);

  // File validation
  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setFileError("Invalid file type. Accepted: PDF, JPG, JPEG, PNG.");
      return false;
    }
    if (file.size > maxSize) {
      setFileError(
        `File too large (${(file.size / 1024 / 1024).toFixed(
          2
        )}MB). Max size: 10MB.`
      );
      return false;
    }
    setFileError(null);
    return true;
  };

  const createPreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreview({ url, name: file.name, type: "image" });
    } else {
      setFilePreview({ url: "", name: file.name, type: "pdf" });
    }
  };

  const handleFile = async (fileOrBlob: File | Blob | null) => {
    if (!fileOrBlob || !userId) return;

    let file: File;
    if (fileOrBlob instanceof File) {
      file = fileOrBlob;
    } else {
      const ext = fileOrBlob.type.split("/")[1] ?? "jpg";
      file = new File([fileOrBlob], `capture-${Date.now()}.${ext}`, {
        type: fileOrBlob.type,
      });
    }

    if (!validateFile(file)) return;

    setLoading(true);
    setError(null);
    setFileError(null);
    createPreview(file);

    try {
      const data = await postOCR(file, userId);
      console.log("[DEBUG] OCR response:", data); // 👈 添加这行
      setOcrData({
        first_name: data.first_name,
        last_name: data.last_name,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        address: data.address,
        dlNumber: data.dlNumber,
        state: data.state,
        street_address: data.street_address,
        zip_code: data.zip_code,
        city: data.city,
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
    ocrData.name &&
    ocrData.address &&
    ocrData.dlNumber &&
    ocrData.state &&
    ocrData.city &&
    ocrData.zip_code &&
    ocrData.street_address;

  const handleRemoveFile = () => {
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
    setFilePreview(null);
    setOcrData({
      first_name: "",
      last_name: "",
      name: "",
      address: "",
      dlNumber: "",
      state: "",
      street_address: "",
      zip_code: "",
      city: "",
    });
  };

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 1: Upload Your Driver’s License</h1>
        <p className="description">
          Please upload a clear photo or PDF of your driver’s license, or skip
          to continue.
        </p>

        {filePreview && (
          <div className="preview-container">
            {filePreview.type === "image" ? (
              <img src={filePreview.url} alt="Preview" className="preview-image" />
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
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="file-input"
          title="Upload your driver's license file"
          placeholder="Choose a file to upload"
        />

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
          >
            📷 Take a Photo
          </button>

          <button
            className="btn secondary"
            disabled={!userId || loading}
            onClick={async () => {
              if (!userId) {
                setError("User ID is missing.");
                return;
              }
              try {
                setLoading(true);
                const data = await getLatestOCR(userId);
                if (data && data.dlNumber) {
                  setOcrData({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
                    address: data.address,
                    dlNumber: data.dlNumber,
                    state: data.state,
                    street_address: data.street_address,
                    zip_code: data.zip_code,
                    city: data.city,
                  });
                } else {
                  setError("No previous OCR data found.");
                }
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            ⟳ Fetch Data
          </button>

        </div>


        {loading && <p className="status-text">Running OCR, please wait…</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && ocrData.name&& (
          <div className="ocr-data">
            <p><strong>Name:</strong> {ocrData.name || "N/A"}</p>
            <p><strong>Address:</strong> {ocrData.address || "N/A"}</p>
            <p><strong>DL #:</strong> {ocrData.dlNumber || "N/A"}</p>
            <p><strong>State:</strong> {ocrData.state || "N/A"}</p>
            <p><strong>City:</strong> {ocrData.city || "N/A"}</p>
            <p><strong>Street Address:</strong> {ocrData.street_address || "N/A"}</p>
            <p><strong>ZIP Code:</strong> {ocrData.zip_code || "N/A"}</p>
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
            You can skip this step and upload your driver's license later if needed. 
            However, having it ready will help speed up the process.
          </p>
        </div>

        <div className="buttons">
          <button
            className="btn primary"
            disabled={!canContinue || loading}
            onClick={() => navigate("/upload-title", { state: { ocr: ocrData } })}
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
