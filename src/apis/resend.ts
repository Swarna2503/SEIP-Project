// src/apis/resend.ts
import { fetchWrapper } from "./fetchWrapper";

export interface ResendCodeResponse {
  message: string;
}

export async function resendCode(email: string) {
  return await fetchWrapper("/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}