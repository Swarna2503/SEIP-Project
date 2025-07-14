// src/apis/verify.ts
import { apiBaseURL } from "./config";

export async function verifyEmail(email: string, code: string) {
  const response = await fetch(`${apiBaseURL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, code }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}