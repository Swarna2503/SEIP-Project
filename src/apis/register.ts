// src/apis/register.ts
import { apiBaseURL } from "./config";

export interface RegisterResponse {
  message: string; 
}

export async function register(email: string, password: string, confirmPassword: string){
  const response = await fetch(`${apiBaseURL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, confirmPassword }),
  });

  const data = await response.json() as RegisterResponse;
  console.log("Register response:", data);
  return { ok: response.ok, data };
}