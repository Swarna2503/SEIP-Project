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
import ForgotPasswordPage from "./pages/forgotPasswordPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import ProfilePage from "./pages/ProfilePage";

import EmailSentPage from "./pages/emailsentPage";
import SellerSignPage from "./pages/sellerSignature";
export default function App() {
  // const isLoggedIn = Boolean(sessionStorage.getItem("userEmail"));

  return (
    <Routes>
      {/* public route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
      <Route path="/reset-password" element={<ResetPasswordPage/>} />
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/ocr" element={<PrivateRoute><OCRPage /></PrivateRoute>} />
      <Route path="/upload-title" element={<PrivateRoute><TitleUploadPage /></PrivateRoute>} />
      <Route path="/responsive-form" element={<PrivateRoute><ResponsiveFormPage /></PrivateRoute>} />
      <Route path="/signature" element={<PrivateRoute><SignaturePage /></PrivateRoute>} />
      <Route path="/preview" element={<PrivateRoute><PreviewPage /></PrivateRoute>} />
      <Route path="/email-sent" element={<PrivateRoute><EmailSentPage/></PrivateRoute>} />
      <Route path="/seller-sign/:token" element={<SellerSignPage />} />
      <Route path="/submit" element={<PrivateRoute><SubmitPage /></PrivateRoute>} />
    </Routes>
  );
}
