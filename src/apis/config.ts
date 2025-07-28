// // src/api/config.ts
export function getAPIBaseURL(): Promise<string> {
  const { protocol, hostname } = window.location;
  // 本地开发：协议 http，后端在 8000 端口
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return Promise.resolve(`http://${hostname}:8000`);
  }
  // 生产环境假定后端跟前端同域名同端口
  return Promise.resolve(`${protocol}//${hostname}`);
}
