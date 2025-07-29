import { useState, useRef, useEffect } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { postTitleOCR, getLatestTitleOCR } from "../apis/title";
import { useAuth } from "../hooks/auth";
import CameraCapture from "../components/CameraCapture";
import "../styles/title.css";

export interface TitleOcrData {
  state?: string;
  document_type?: string;
  texas_department_of_motor_vehicles?: string;

  vehicle_identification_number?: string;
  year_model?: string;
  make_of_vehicle?: string;
  body_style?: string;
  model?: string;
  MFG?: string;
  weight?: string;
  license_number?: string;
  title_document_number?: string;
  date_title_issued?: string;
  odometer_reading?: string;
  odometer_remark?: string;

  previous_owner?: string;
  owner_name?: string;
  owner_address?: string;

  first_lienholder?: string;
  first_date_of_lien?: string;
  first_lien_released_date?: string;
  first_authorized_agent?: string;
  second_lienholder?: string;
  second_date_of_lien?: string;
  second_lien_released_date?: string;
  second_authorized_agent?: string;
  third_lienholder?: string;
  third_date_of_lien?: string;
  third_lien_released_date?: string;
  third_authorized_agent?: string;

  form_revision?: string;
}

export default function TitleUploadPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  // const userId = user?.user_id;
  // 2) wait on auth
  if (authLoading) {
    return <div className="loading">Loading user info…</div>;
  }
  // 3) if not logged in, send to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const { state } = useLocation() as {
    state: { ocr: { name: string } | null; applicationId: string };
  };
  const { ocr, applicationId } = state;
  console.log("[DEBUG] ocr, applicationId:", ocr, applicationId);

  if (!applicationId) {
    return <Navigate to="/" replace />;
  }

  // const { ocr } = (useLocation().state as LocationState) || { ocr: null };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [titleOcrData, setTitleOcrData] = useState<TitleOcrData>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const fieldsToShow = [
    { key: "vehicle_identification_number", label: "Vehicle Identification Number" },
    { key: "year_model",           label: "Year" },
    { key: "make_of_vehicle",      label: "Make" },
    { key: "body_style",           label: "Body Style" },
    { key: "model",                label: "Model" },
    { key: "mfg_capacity_in_tons", label: "Empty Weight" },
    { key: "previous_owner",       label: "Previous Owner" },
    { key: "owner_name",           label: "Current Owner" },
    { key: "city",                 label: "City" },
    { key: "state",                label: "State" },
  ];


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
    // if (!userId) {
    if(!applicationId) {
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
      // const data = await postTitleOCR(pickedFile, userId);
      const data = await postTitleOCR(pickedFile, applicationId);
      setTitleOcrData(data.ocr_result);
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
      // state: { ocr, titleFile: file, titleOcr: titleOcrData },
      state: { ocr, titleFile: file, titleOcr: titleOcrData, applicationId },
    });

  const handleSkip = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    navigate("/responsive-form", {
      // state: { ocr, titleFile: null, titleOcr: null },
      state: { ocr, titleFile: null, titleOcr: null, applicationId },
    });
  };

  // const validationPassed = file !== null && !fileError;
  // 新版：有 file 或者 有 titleOcrData 就通过
  const validationPassed =
    !fileError &&
    (
      file !== null ||
      Object.keys(titleOcrData).length > 0
    );

  console.log(titleOcrData)

  return (
    <div className="main-container">
      <div className="page-container">
        <h1 className="heading">Step 2: Upload Your Vehicle Title Document</h1>
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

          <button
            className="btn secondary"
            onClick={async () => {
              // if (!userId) {
              if (!applicationId) {
                setOcrError("Please log in first.");
                return;
              }
              try {
                setIsUploading(true);
                // const data = await getLatestTitleOCR(userId);
                const data = await getLatestTitleOCR(applicationId);
                if (data && data.ocr_result) {
                  setTitleOcrData(data.ocr_result);
                  setOcrError(null);
                } else {
                  setOcrError("No previous title OCR data found.");
                }
              } catch (err: any) {
                setOcrError(err.message || "Failed to load previous OCR record.");
              } finally {
                setIsUploading(false);
              }
            }}
            disabled={isUploading}
          >
            ⟳ Load Record
          </button>

        </div>

        {isUploading && <p className="status-text">Processing file...</p>}
        {ocrError && <p className="status-text error">{ocrError}</p>}

        {!isUploading && Object.keys(titleOcrData).length > 0 && (
          <div className="ocr-preview">
            <h2 className="preview-heading">Extracted Title Information</h2>
            <ul className="ocr-list">
              {fieldsToShow.map(({ key, label }) => {
                const val = (titleOcrData as any)[key];
                return val ? (
                  <li key={key}>
                    <strong>{label}:</strong> {val}
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}

        <div className="buttons">
          <button className="btn back" onClick={() => navigate(-1)}>
            ← Back
          </button>

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