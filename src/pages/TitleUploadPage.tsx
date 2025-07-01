// src/pages/TitleUploadPage.tsx
import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postTitleOCR } from "../apis/title";
import { useAuth } from "../hooks/auth";
import CameraCapture from "../components/CameraCapture";
import "../styles/title.css";

export interface TitleOcrData {
  tx_dmv_number?: string;
  vehicle_id_number?: string;
  year_model?: string;
  make_of_vehicle?: string;
  body_style?: string;
  title_document_number?: string;
  date_title_issued?: string;
  model?: string;
  MFG?: string;
  weight?: string;
  license_number?: string;
  previous_owner?: string;
  odometer_reading?: string;
  owner_remarks_1?: string;
  owner_remarks_2?: string;
  owner_remarks_3?: string;
  remarks?: string;
  date_of_lien_1?: string;
  first_lienholder?: string;
  first_lien_released?: string;
  by_authorized_agent_1?: string;
  date_of_lien_2?: string;
  second_lienholder?: string;
  second_lien_released?: string;
  by_authorized_agent_2?: string;
  date_of_lien_3?: string;
  third_lienholder?: string;
  third_lien_released?: string;
  by_authorized_agent_3?: string;
}

interface LocationState {
  ocr: { name: string } | null;
}

export default function TitleUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.user_id;

  const { ocr } = (useLocation().state as LocationState) || { ocr: null };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [titleOcrData, setTitleOcrData] = useState<TitleOcrData>({});

  // camera toggle
  const [showCamera, setShowCamera] = useState(false);

  const handleFile = async (chosen: File | Blob | null) => {
    if (!chosen) return;
    if (!userId) {
      setError("User not logged in. Please log in again.");
      return;
    }
    // if it's a Blob from camera, wrap in File
    const pickedFile = chosen instanceof File
      ? chosen
      : new File([chosen], "capture.jpg", { type: "image/jpeg" });

    setFile(pickedFile);
    setError(null);
    setLoading(true);

    try {
      const data = await postTitleOCR(pickedFile, userId);
      setTitleOcrData(data);
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

  const handleNext = () =>
    navigate("/responsive-form", {
      state: { ocr, titleFile: file, titleOcr: titleOcrData },
    });

  const handleSkip = () =>
    navigate("/responsive-form", {
      state: { ocr, titleFile: null, titleOcr: null },
    });

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 2: Upload Your Title Document</h1>
        <p className="description">
          {ocr
            ? <>Hi <strong>{ocr.name}</strong>, please upload a clear photo or PDF of your title.</>
            : <>Please upload a clear photo or PDF of your title.</>}
        </p>

        {/* drag & drop */}
        <div
          className="dropzone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">📄</div>
          <div className="dropzone-text">
            <strong>{file ? `Uploaded: ${file.name}` : "Drag and drop your title here"}</strong>
            {!file && <div>or click to browse</div>}
          </div>
        </div>

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
          <label
            className="btn camera-button"
            onClick={() => setShowCamera(true)}
          >
            📷 Take a Photo
          </label>
        </div>

        {loading && <p className="status-text">OCR processing…</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && Object.keys(titleOcrData).length > 0 && (
          <div className="ocr-preview">
            <h2 className="preview-heading">Extracted Title Information</h2>
            <ul className="ocr-list">
              {Object.entries(titleOcrData).map(([k,v]) =>
                v ? (
                  <li key={k}>
                    <strong>{k.replace(/_/g," ")}</strong>: {v}
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}

        <div className="card-footer">
          <button
            className={`btn primary${!file ? " disabled" : ""}`}
            onClick={handleNext}
            disabled={!file}
          >
            Next: Fill Title Form →
          </button>
          <button className="btn skip" onClick={handleSkip}>
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
