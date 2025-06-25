// src/pages/ResponsiveFormPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import "../styles/responsive-form.css";

interface LocationState {
  ocr?: any;        // may be null if user skipped OCR
  titleFile?: File; // always set by the TITLE‐UPLOAD step
}

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const { ocr, titleFile } = state ?? {};
  useEffect(() => {
  if (!state) {
     // no state at all => somebody hit this URL directly
     navigate("/", { replace: true });
   }
 }, [state, navigate]);
  // ─────────────────────────────────────────────────────────

  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleFormChange = (newState: Record<string, any>) => {
    setFormState(newState);
  };

  const handleNext = () => {
    navigate("/review-submit", {
      state: { ocr, titleFile, titleForm: formState },
    });
  };

  return (
    <div className="responsive-form-page">
      <h1 className="page-title">Step 3: Complete Title Form</h1>

      <div className="form-card">
        <div className="sections-container">
          <Responsive130UForm
            onChange={handleFormChange}
            /* our CSS hooks */
            sectionClass="section-card"
            gridClass="fields-grid"
          />
        </div>
      </div>

      <div className="form-footer">
        <button className="btn-next" onClick={handleNext}>
          Next: Review &amp; Submit →
        </button>
      </div>
    </div>
  );
}