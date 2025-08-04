// src/apis/driver_license.ts
import { getAPIBaseURL } from "./config";
import { fetchWrapper } from "./fetchWrapper";

export async function getLatestOCR(applicationId: string) {
  const baseURL = await getAPIBaseURL();
  const url = `${baseURL}/api/driverlicense/latest?application_id=${applicationId}`;
  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch latest OCR record");
  }

  return await response.json();
}

export async function postOCR(file: File, applicationId: string) {
  const formData = new FormData();
  formData.append("file", file);
  // formData.append("user_id", userId);
  formData.append("application_id", applicationId); // 使用 application_id 替代 user_id

  const baseURL = await getAPIBaseURL();
  const url = `${baseURL}/api/driverlicense/ocr`;
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

export async function getLatestDriverLicense(applicationId: string) {
  // 注意：fetchWrapper 默认会在路径前加 /api
  return fetchWrapper(
    `/driverlicense/latest?application_id=${encodeURIComponent(applicationId)}`,
    { method: "GET" }
  );
}