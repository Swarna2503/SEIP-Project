// src/api/driver_license.ts
import { getAPIBaseURL } from "./config";

export async function getLatestOCR(userId: string) {
  const baseURL = await getAPIBaseURL();
  const response = await fetch(`${baseURL}/driverlicense/latest?user_id=${userId}`, {
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
  const response = await fetch(`${baseURL}/driverlicense/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "OCR failed");
  }

  return await response.json();
}