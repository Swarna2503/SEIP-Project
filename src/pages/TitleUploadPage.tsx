import { useState, useRef, useEffect } from "react";
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
  const [fileError, setFileError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [titleOcrData, setTitleOcrData] = useState<TitleOcrData>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

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
      setFileError("Unsupported file type. Accepted: PDF, JPG, JPEG, PNG.");
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
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); // PDFs don't get a preview URL
    }
  };

  // Handle file selection from any source
  const handleFile = async (chosen: File | Blob | null) => {
    if (!chosen) return;
    if (!userId) {
      setOcrError("User not logged in. Please log in again.");
      return;
    }

    // Convert Blob to File if needed
    let pickedFile: File;
    if (chosen instanceof Blob && !(chosen instanceof File)) {
      pickedFile = new File([chosen], "capture.jpg", { type: chosen.type });
    } else {
      pickedFile = chosen as File;
    }

    // Validate before processing
    if (!validateFile(pickedFile)) {
      return;
    }

    setFile(pickedFile);
    setFileError(null);
    setOcrError(null);
    setIsUploading(true);
    createPreview(pickedFile);

    try {
      const data = await postTitleOCR(pickedFile, userId);
      setTitleOcrData(data);
    } catch (err: any) {
      setOcrError(err.message || "OCR processing failed");
    } finally {
      setIsUploading(false);
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
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setTitleOcrData({});
    setFileError(null);
    setOcrError(null);
  };

  const handleNext = () =>
    navigate("/responsive-form", {
      state: { ocr, titleFile: file, titleOcr: titleOcrData },
    });

  const handleSkip = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    navigate("/responsive-form", {
      state: { ocr, titleFile: null, titleOcr: null },
    });
  };

  const validationPassed = file !== null && !fileError;

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 2: Upload Your Title Document</h1>
        <p className="description">
          {ocr ? (
            <>
              Hi <strong>{ocr.name}</strong>, please upload a clear photo or PDF
              of your title.
            </>
          ) : (
            <>Please upload a clear photo or PDF of your title.</>
          )}
        </p>

        {/* File preview section */}
        {file && (
          <div className="preview-container">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="preview-image"
              />
            ) : (
              <div className="pdf-preview">
                <div className="pdf-icon">📄</div>
                <div className="pdf-name">{file.name}</div>
              </div>
            )}
            <button
              type="button"
              className="btn remove-button"
              onClick={handleRemove}
              disabled={isUploading}
            >
              × Remove
            </button>
          </div>
        )}

        {/* Dropzone with spinner overlay */}
        <div className="dropzone-container">
          <div
            className={`dropzone ${isUploading ? "disabled" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading && (
              <div className="spinner-overlay">
                <div className="spinner"></div>
              </div>
            )}
            
            <div className="dropzone-icon">📄</div>
            <div className="dropzone-text">
              <strong>
                {file ? "Drag and drop to replace file" : "Drag and drop your title here"}
              </strong>
              {!file && <div>or click to browse</div>}
            </div>
          </div>
          
          {/* Validation error */}
          {fileError && (
            <div className="validation-error">{fileError}</div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="file-input"
          title="Upload your title document (PDF, JPG, JPEG, PNG)"
          placeholder="Choose a file"
        />

        <div className="button-group">
          <button
            className={`btn choose-button ${isUploading ? "disabled" : ""}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            disabled={isUploading}
          >
            📁 Choose File
          </button>
          <button
            className={`btn camera-button ${isUploading ? "disabled" : ""}`}
            onClick={() => !isUploading && setShowCamera(true)}
            disabled={isUploading}
          >
            📷 Take a Photo
          </button>
        </div>

        {isUploading && <p className="status-text">Processing file...</p>}
        {ocrError && <p className="status-text error">{ocrError}</p>}

        {!isUploading && Object.keys(titleOcrData).length > 0 && (
          <div className="ocr-preview">
            <h2 className="preview-heading">Extracted Title Information</h2>
            <ul className="ocr-list">
              {Object.entries(titleOcrData).map(
                ([k, v]) =>
                  v ? (
                    <li key={k}>
                      <strong>{k.replace(/_/g, " ")}</strong>: {v}
                    </li>
                  ) : null
              )}
            </ul>
          </div>
        )}

        <div className="buttons">
          <button
            className="btn primary"
            onClick={handleNext}
            disabled={!validationPassed || isUploading}
          >
            Next: Fill Title Form →
          </button>
          <button
            className="btn skip"
            onClick={handleSkip}
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