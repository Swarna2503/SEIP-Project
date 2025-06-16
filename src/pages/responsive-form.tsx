// src/pages/responsive-form.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";

interface LocationState {
  ocr?: any;
  titleFile?: File;
}

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Assert that location.state matches LocationState
  const { ocr, titleFile } = (location.state as LocationState) || {};

  // If we somehow land here without both, kick back to "/"
  useEffect(() => {
    if (!ocr || !titleFile) {
      navigate("/", { replace: true });
    }
  }, [ocr, titleFile, navigate]);

  // Holds the current form values
  const [formState, setFormState] = useState<Record<string, any>>({});

  // Called by <Responsive130UForm> whenever a field changes
  const handleFormChange = (state: Record<string, any>) => {
    setFormState(state);
  };

  // Move on to the review/download step
  const handleNext = () => {
    navigate("/review-submit", {
      state: {
        ocr,
        titleFile,
        titleForm: formState,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold mb-6">
        Step 3: Complete &amp; Review Title Form
      </h1>

      <Responsive130UForm onChange={handleFormChange} />

      <div className="mt-6 text-center">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next: Review &amp; Download
        </button>
      </div>
    </div>
  );
}
