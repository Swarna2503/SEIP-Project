// src/api/title.ts
import { getAPIBaseURL } from "./config";

export async function postTitleOCR(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const baseURL = await getAPIBaseURL();
  const response = await fetch(`${baseURL}/title/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Title OCR failed");
  }

  return await response.json();
}

export async function getLatestTitleOCR(userId: string) {
  const baseURL = await getAPIBaseURL();
  const response = await fetch(`${baseURL}/title/latest?user_id=${userId}`);

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || "Failed to fetch latest title OCR record");
  }

  return await response.json();
}

