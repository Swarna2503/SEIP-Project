// // src/api/application.ts

// import { fetchWrapper } from "./fetchWrapper";

// export async function createApplication(user_id: string) {
//   const formData = new FormData();
//   formData.append("user_id", user_id);

//   const res = await fetchWrapper("/application/create", {
//     method: "POST",
//     body: formData,
//     headers: {} 
//   });

//   return res;
// }

// export async function getApplicationByUser(user_id: string) {
//   const res = await fetchWrapper(`/application/by-user/${user_id}`, {
//     method: "GET",
//   });

//   return res;
// }
// src/api/application.ts
import { fetchWrapper } from "./fetchWrapper";

// 创建一个新的申请草稿
export async function createApplication(user_id: string) {
  // 用 FormData 把 user_id 传给后端的 Form(...) 解析器
  const formData = new FormData();
  formData.append("user_id", user_id);

  // path 里不写 /api，fetchWrapper 会自动补上
  const res = await fetchWrapper("/application/create", {
    method: "POST",
    body: formData,
    // 不需要写 headers，fetchWrapper 已经根据 body instanceof FormData 来跳过 JSON 头
  });

  return res;  // { ok, status, data: { application_id, application_display_id, status } }
}

// 根据 user_id 查询（未提交的）草稿
export async function getApplicationByUser(user_id: string) {
  const res = await fetchWrapper(`/application/by-user/${encodeURIComponent(user_id)}`, {
    method: "GET",
  });
  return res;  // { ok, status, data: { application_id?, application_display_id?, status? } }
}
