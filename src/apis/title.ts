// src/api/title.ts
import { apiBaseURL } from "./config";

export async function postTitleOCR(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const response = await fetch(`${apiBaseURL}/title/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "Title OCR failed");
  }

  const data = await response.json();
  return data; 
}
