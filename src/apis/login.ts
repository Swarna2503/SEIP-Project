// src/api/login.ts
import { fetchWrapper } from "./fetchWrapper";

export async function login(email: string, password: string) {
  return await fetchWrapper("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}