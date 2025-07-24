// src/api/application.ts

import { fetchWrapper } from "./fetchWrapper";

export async function createApplication(user_id: string) {
  const formData = new FormData();
  formData.append("user_id", user_id);

  const res = await fetchWrapper("/application/create", {
    method: "POST",
    body: formData,
    headers: {} 
  });

  return res;
}

export async function getApplicationByUser(user_id: string) {
  const res = await fetchWrapper(`/application/by-user/${user_id}`, {
    method: "GET",
  });

  return res;
}
