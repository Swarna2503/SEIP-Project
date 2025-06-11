// src/pages/responsive-form.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleFormChange = (state: Record<string, any>) => {
    setFormState(state);
  };

  const handleNext = () => {
    navigate("/review-submit", {
      state: { titleForm: formState },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold mb-6">
        Step 2: Complete Title Form
      </h1>

      <Responsive130UForm onChange={handleFormChange} />

      <div className="mt-6 text-center">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next: Review & Submit
        </button>
      </div>
    </div>
  );
}
