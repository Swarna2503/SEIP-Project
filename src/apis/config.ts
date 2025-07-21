// src/api/config.ts
let cachedAPIBaseURL: string = "";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

async function detectAPIBaseURL(): Promise<string> {
  if (cachedAPIBaseURL) return cachedAPIBaseURL;

  const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

  if (isLocalhost) {
    cachedAPIBaseURL = "http://127.0.0.1:8000";
    console.log("🔧 Local dev: Using local backend:", cachedAPIBaseURL);
    return cachedAPIBaseURL;
  }

  cachedAPIBaseURL = import.meta.env.VITE_API_BASE_URL || "";
  console.log("🌐 Using remote backend:", cachedAPIBaseURL);
  return cachedAPIBaseURL;
}

if (isBrowser()) detectAPIBaseURL();

export let apiBaseURL = ""; // 兼容旧用法
export async function getAPIBaseURL(): Promise<string> {
  if (apiBaseURL) return apiBaseURL;
  apiBaseURL = await detectAPIBaseURL();
  return apiBaseURL;
}


//local host base URL for API requests
// export const apiBaseURL = "http://127.0.0.1:8000";
// later when deploy to the server use the following：
// export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// console.log("API BASE URL →", apiBaseURL);
