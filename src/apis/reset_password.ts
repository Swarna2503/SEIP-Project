// src/api/password.ts
import { fetchWrapper } from "./fetchWrapper";

/**
 * send email to request password reset
 */
export async function requestPasswordReset(email: string) {
  return await fetchWrapper("/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
// reset password
export async function resetPassword(token: string, newPassword: string, confirmPassword: string) {
  return await fetchWrapper("/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
}
