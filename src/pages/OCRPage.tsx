// src/pages/OCRPage.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { postOCR, getLatestOCR } from "../apis/driver_license";
import { useAuth } from "../hooks/auth";
import "../styles/ocr.css";

import CameraCapture from "../components/CameraCapture"; // ← new import

interface OcrData {
  name: string;
  address: string;
  dlNumber: string;
  state: string;
  city?: string; // new added optional fields
  street_address?: string; // new added optional field
  zip_code?: string;       // new added optional field
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
    street_address: "", // new added optional field
    zip_code: "",       // new added optional field
    city: "",           // new added optional field
  });
  
  useEffect(() => {
    const fetchLatest = async () => {
      if (!userId) return;
      try {
        const data = await getLatestOCR(userId);
        if (data && data.dlNumber) {
          setOcrData({
            name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
            address: data.address,
            dlNumber: data.dlNumber,
            state: data.state,
            street_address: data.street_address,
            zip_code: data.zip_code,
            city: data.city,
          });
        }
      } catch (err) {
        console.warn("No previous OCR found or fetch failed.");
      }
    };

    fetchLatest();
  }, [userId]);

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
    let uploadFile: File;
    if (fileOrBlob instanceof File) {
      // already a File: keep its original name
      uploadFile = fileOrBlob;
    } else {
      // pure Blob from camera: generate a unique filename
      const ext = fileOrBlob.type.split("/")[1] ?? "jpg";
      uploadFile = new File(
        [fileOrBlob],
        `capture-${Date.now()}.${ext}`,
        { type: fileOrBlob.type }
      );
    }
    // const file =
    //   fileOrBlob instanceof Blob
    //     ? new File([fileOrBlob], "capture.jpg", { type: fileOrBlob.type })
    //     : fileOrBlob;

    try {
      const data = await postOCR(uploadFile, userId);
      setOcrData({
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
    Boolean(ocrData.name) &&
    Boolean(ocrData.address) &&
    Boolean(ocrData.dlNumber) &&
    Boolean(ocrData.state) &&
    Boolean(ocrData.street_address) &&
    Boolean(ocrData.zip_code) &&
    Boolean(ocrData.city);

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
              <strong>Extracted Name:</strong> {ocrData.name || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {ocrData.address || "N/A"}
            </p>
            <p>
              <strong>DL #:</strong> {ocrData.dlNumber || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {ocrData.state || "N/A"}
            </p>
            <p>
              <strong>City:</strong> {ocrData.city || "N/A"}
            </p>
            <p>
              <strong>Street Address:</strong> {ocrData.street_address || "N/A"}
            </p>
            <p>
              <strong>ZIP Code:</strong> {ocrData.zip_code || "N/A"}
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
