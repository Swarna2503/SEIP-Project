// src/apis/register.ts
import { fetchWrapper } from "./fetchWrapper";

export interface RegisterResponse {
  message: string; 
}

export async function register(email: string, password: string, confirmPassword: string) {
  return await fetchWrapper("/register", {
    method: "POST",
    body: JSON.stringify({ email, password, confirmPassword }),
  });
}