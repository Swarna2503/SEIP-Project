// src/apis/driver_license.ts
import { getAPIBaseURL } from "./config";

export async function getLatestOCR(userId: string) {
  const baseURL = await getAPIBaseURL();
  const url = `${baseURL}/api/driver_license/latest?user_id=${encodeURIComponent(userId)}`;
  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch latest OCR record");
  }

  return await response.json();
}

export async function postOCR(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const baseURL = await getAPIBaseURL();
  const url = `${baseURL}/api/driver_license/ocr`;
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",    
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "OCR failed");
  }

  return await response.json();
}
