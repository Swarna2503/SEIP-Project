// src/apis/resend.ts
import { apiBaseURL } from './config';

export interface ResendCodeResponse {
  message: string;
}

export async function resendCode(email: string) {
  const response = await fetch(`${apiBaseURL}/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  const data = (await response.json()) as ResendCodeResponse;
  console.log('Resend response:', data);
  return { ok: response.ok, data };
}
