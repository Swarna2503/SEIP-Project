// // src/api/config.ts

// let apiBaseURL = "";

// export async function getAPIBaseURL(): Promise<string> {
//   if (apiBaseURL) return apiBaseURL;

//   if (typeof window !== "undefined") {
//     const hostname = window.location.hostname;
//     console.log("Current hostname:", hostname);

//     if (hostname === "localhost" || hostname === "127.0.0.1") {
//       apiBaseURL = "http://127.0.0.1:8000";
//       console.log("Using local backend:", apiBaseURL);
//     } else {
//       apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";
//       console.log("Using remote backend:", apiBaseURL);
//     }
//   }

//   return apiBaseURL;
// }
// src/apis/config.ts

/**
 * 返回当前页面同源下的后端地址。
 * 本地开发时，假定后端跑在 8000 端口。
 * 部署时会根据 window.location.protocol/hostname 自动切换。
 */
export function getAPIBaseURL(): Promise<string> {
  const { protocol, hostname } = window.location;
  // 本地开发：协议 http，后端在 8000 端口
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return Promise.resolve(`http://${hostname}:8000`);
  }
  // 生产环境假定后端跟前端同域名同端口
  return Promise.resolve(`${protocol}//${hostname}`);
}
