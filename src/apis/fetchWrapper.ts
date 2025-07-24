// // src/api/fetchWrapper.ts
// import { getAPIBaseURL } from "./config";

// export interface FetchResult<T = any> {
//   ok: boolean;
//   status: number;
//   data: T;
// }

// export async function fetchWrapper(path: string, options: RequestInit = {}) {
//   const baseURL = await getAPIBaseURL();
//   const url = `${baseURL}/api${path}`;

//   const defaultOptions: RequestInit = {
//     ...options,
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//     },
//   };

//   const response = await fetch(url, defaultOptions);
//   const data = await response.json().catch(() => ({}));

//   return { ok: response.ok, status: response.status, data };
// }

// src/api/fetchWrapper.ts
// src/api/fetchWrapper.ts
import { getAPIBaseURL } from "./config";

export interface FetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

export async function fetchWrapper(path: string, options: RequestInit = {}) {
  const baseURL = await getAPIBaseURL();
  const url = `${baseURL}/api${path}`;

  // 判断 body 有没有 FormData，如果有就不要自动加 JSON 头
  const isForm = options.body instanceof FormData;

  const headers: Record<string, string> = isForm
    ? { ...(options.headers as any) }        // 透传用户自己加的头
    : {                                      // 否则默认走 JSON
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}
