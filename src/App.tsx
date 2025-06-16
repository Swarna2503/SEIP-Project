import React from "react";
import { Routes, Route } from "react-router-dom";
import OCRPage            from "./pages/OCRPage";
import TitleUploadPage    from "./pages/TitleUploadPage";
import ResponsiveFormPage from "./pages/responsive-form";
import ReviewSubmitPage   from "./pages/ReviewSubmitPage";

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<OCRPage />} />
      <Route path="/upload-title"    element={<TitleUploadPage />} />
      <Route path="/responsive-form" element={<ResponsiveFormPage />} />
      <Route path="/review-submit"   element={<ReviewSubmitPage />} />
      <Route path="*"                element={<div>404 — page not found</div>} />
    </Routes>
  );
}
