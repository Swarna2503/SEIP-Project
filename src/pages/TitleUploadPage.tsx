import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postTitleOCR } from "../apis/title";
import { useAuth } from "../hooks/auth";
import "../styles/title.css";


export interface titleOcrData {
  // Title OCR
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

  // Lien Information
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
  ocr: {
    name: string;
    address: string;
    dlNumber: string;
    state: string;
  } | null;
}

export default function TitleUploadPage() {
  const navigate = useNavigate();

  const { user } = useAuth();
  console.log("current user:", user);
  const userId = user?.user_id;

  const location = useLocation();
  const { ocr } = (location.state as LocationState) || { ocr: null };

  // // If we landed here without getting OCR data at all, bounce back home
  // useEffect(() => {
  //   if (ocr === undefined) {
  //     navigate("/", { replace: true });
  //   }
  // }, [ocr, navigate]);
  // if (ocr === undefined) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [titleOcrData, setTitleOcrData] = useState<titleOcrData>({});
  const [loading, setLoading] = useState(false);
  // const canContinue = Boolean(file);

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
      const data = await postTitleOCR(chosen, userId);
      console.log("OCR data received:", data);
      setTitleOcrData(data);
    } catch (err: any) {
      console.error("Title OCR failed:", err);
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

  const handleNext = () => {
    if (file) {
      navigate("/responsive-form", {
        state: { 
          ocr, 
          titleFile: file, 
          titleOcr: titleOcrData },
      });
    }
  };

  const handleSkip = () => {
    navigate("/responsive-form", {
      state: { 
        ocr, 
        titleFile: null,
        titleOcr: null
      },
    });
  };

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
            <strong>
              {file ? `Uploaded: ${file.name}` : "Drag and drop your title here"}
            </strong>
            {!file && <div>or click to browse</div>}
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
        {loading && <p className="status-text"> OCR processing...</p>}

        {!loading && Object.keys(titleOcrData).length > 0 && (
        <div className="ocr-preview">
          <h2 className="preview-heading">Extracted Title Information</h2>
          <ul className="ocr-list">
            {Object.entries(titleOcrData).map(([key, value]) => (
              value && (
                <li key={key}>
                  <strong>{key.replace(/_/g, " ")}:</strong> {value}
                </li>
              )
            ))}
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
          <button type="button" className="btn skip" onClick={handleSkip}>
            &gt; Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
