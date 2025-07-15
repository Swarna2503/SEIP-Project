// src/api/config.ts

//local host base URL for API requests
// export const apiBaseURL = "http://127.0.0.1:8000";
// later when deploy to the server use the following：
// export const apiBaseURL = "https://dmv-agent.ai/api";
// export const apiBaseURL = "http://18.116.34.154";
export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
