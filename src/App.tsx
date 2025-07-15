import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login";
import HomePage from "./pages/HomePage";
import OCRPage from "./pages/OCRPage";
import TitleUploadPage from "./pages/TitleUploadPage";
import ResponsiveFormPage from "./pages/responsive-form";
import SignaturePage from "./pages/signaturePage";
import PreviewPage from "./pages/PreviewPage";
import VerifyEmailPage from './pages/VerifyEmailPage';
import RegisterPage from "./pages/RegisterPage";
import PrivateRoute from "./components/privateroute";
import SubmitPage from "./pages/submitpage";

export default function App() {
  // const isLoggedIn = Boolean(sessionStorage.getItem("userEmail"));

  return (
    <Routes>
      {/* public route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/ocr" element={<PrivateRoute><OCRPage /></PrivateRoute>} />
      <Route path="/upload-title" element={<PrivateRoute><TitleUploadPage /></PrivateRoute>} />
      <Route path="/responsive-form" element={<PrivateRoute><ResponsiveFormPage /></PrivateRoute>} />
      <Route path="/signature" element={<PrivateRoute><SignaturePage /></PrivateRoute>} />
      <Route path="/preview" element={<PrivateRoute><PreviewPage /></PrivateRoute>} />
      <Route path="/submit" element={<PrivateRoute><SubmitPage /></PrivateRoute>} />
    </Routes>
  );
}
