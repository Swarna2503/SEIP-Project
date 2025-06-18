// src/pages/ResponsiveFormPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import "../styles/responsive-form.css";

interface LocationState {
  ocr?: any;
  titleFile?: File;
}

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ocr, titleFile } = (location.state as LocationState) || {};

  // Redirect back home if we don't have the OCR + title file
  useEffect(() => {
    if (!ocr || !titleFile) {
      navigate("/", { replace: true });
    }
  }, [ocr, titleFile, navigate]);

  // Hold all the 130-U form field values here
  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleFormChange = (state: Record<string, any>) => {
    setFormState(state);
  };

  const handleNext = () => {
    navigate("/review-submit", {
      state: { ocr, titleFile, titleForm: formState },
    });
  };

  return (
    <div className="responsive-form-page">
      <header className="responsive-form-header">
        <h1 className="responsive-form-title">Step 3: Complete Title Form</h1>
      </header>

      <main className="responsive-form-body">
        <Responsive130UForm onChange={handleFormChange} />
      </main>

      <footer className="responsive-form-footer">
        <button
          className="responsive-form-next-btn"
          onClick={handleNext}
          disabled={Object.keys(formState).length === 0}
        >
          Next: Review & Download
        </button>
      </footer>
    </div>
  );
}
