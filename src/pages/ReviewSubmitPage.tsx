// src/pages/ReviewSubmitPage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ReviewSubmitPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state: { titleForm: Record<string, any> };
  };
  const formData = state?.titleForm;

  if (!formData) {
    navigate("/responsive-form", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">
        Step 3: Review & Submit
      </h1>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {Object.entries(formData).map(([key, val]) => (
          <React.Fragment key={key}>
            <dt className="font-medium">{key}</dt>
            <dd>{String(val)}</dd>
          </React.Fragment>
        ))}
      </dl>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/responsive-form")}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={() => alert("Submit logic here")}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}
