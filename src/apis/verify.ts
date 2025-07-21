// src/apis/verify.ts
import { fetchWrapper } from "./fetchWrapper";

export async function verifyEmail(email: string, code: string) {
  return await fetchWrapper("/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}