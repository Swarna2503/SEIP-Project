// src/pages/OCRPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function OCRPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">
        Step 1: Upload & OCR Driver’s License
      </h1>
      <p className="mb-6 text-center">
        [TODO: build your OCR upload & preview here]
      </p>
      <button
        onClick={() => navigate("/responsive-form")}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Next: Fill Title Form
      </button>
    </div>
  );
}
