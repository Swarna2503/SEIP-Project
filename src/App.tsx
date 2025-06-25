// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login";
import HomePage from "./pages/HomePage";
import OCRPage from "./pages/OCRPage";
import TitleUploadPage from "./pages/TitleUploadPage";
import ResponsiveFormPage from "./pages/responsive-form";
import ReviewSubmitPage from "./pages/ReviewSubmitPage";

export default function App() {
  const isLoggedIn = Boolean(sessionStorage.getItem("userEmail"));

  return (
    <Routes>
      {/* public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* redirect all unknowns to login if not authenticated */}
      {!isLoggedIn ? (
        <Route path="*" element={<Navigate to="/login" replace />} />
      ) : (
        <>
          {/* authenticated routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/ocr" element={<OCRPage />} />
          <Route path="/upload-title" element={<TitleUploadPage />} />
          <Route path="/responsive-form" element={<ResponsiveFormPage />} />
          <Route path="/review-submit" element={<ReviewSubmitPage />} />
        </>
      )}
    </Routes>
  );
}
