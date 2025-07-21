// src/api/fetchWrapper.ts
import { getAPIBaseURL } from "./config";

export async function fetchWrapper(path: string, options: RequestInit = {}) {
  const baseURL = await getAPIBaseURL();
  const url = `${baseURL}/api${path}`;

  const defaultOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, defaultOptions);
  const data = await response.json().catch(() => ({}));

  return { ok: response.ok, data };
}