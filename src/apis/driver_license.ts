// src/api/driver_license.ts
import { apiBaseURL } from "./config";


export async function getLatestOCR(userId: string) {
  const response = await fetch(`/api/driverlicense/latest?user_id=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch latest OCR record");
  }
  return response.json();
}

export async function postOCR(file: File, userId: string) {

  //   // construct FormData to provide to backend
  //   // later after have login change to 
  //   // const currentUserId = "current_user_id"; // replace with actual user ID from auth context or state
  //   const currentUserId = "685afdb53ea50cd2299e9cd8";
  //   const formData = new FormData();
  //   formData.append("file", chosen);
  //   formData.append("user_id", currentUserId);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const response = await fetch(`${apiBaseURL}/driverlicense/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "OCR failed");
  }

  const data = await response.json();
  return data;
}
