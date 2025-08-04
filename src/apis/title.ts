// src/api/title.ts
import { getAPIBaseURL } from "./config";

export async function getLatestTitle(applicationId: string) {
  const baseURL = await getAPIBaseURL();
  const resp = await fetch(
    `${baseURL}/api/title/latest?application_id=${encodeURIComponent(applicationId)}`,
    { credentials: "include" }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch latest title OCR record");
  }

  // resp.json() is already the FLAT title OCR object
  const flat = await resp.json();
  return flat;
}

export async function postTitleOCR(file: File, applicationId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("application_id", applicationId);

  const baseURL = await getAPIBaseURL();
  const response = await fetch(`${baseURL}/api/title/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Title OCR failed");
  }

  return await response.json();
}

export async function getLatestTitleOCR(applicationId: string) {
  const baseURL = await getAPIBaseURL();
  const response = await fetch(`${baseURL}/api/title/latest?application_id=${applicationId}`);

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || "Failed to fetch latest title OCR record");
  }

  return await response.json();
}
