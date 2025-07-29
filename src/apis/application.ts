// src/api/application.ts
import { fetchWrapper } from "./fetchWrapper";

// create a new draft
export async function createApplication(user_id: string) {
  const formData = new FormData();
  formData.append("user_id", user_id);
  const res = await fetchWrapper("/application/create", {
    method: "POST",
    body: formData,
  });

  return res;  // { ok, status, data: { application_id, application_display_id, status } }
}

// query the draft by user id
export async function getApplicationByUser(user_id: string) {
  const res = await fetchWrapper(`/application/by-user/${encodeURIComponent(user_id)}`, {
    method: "GET",
  });
  return res;  // { ok, status, data: { application_id?, application_display_id?, status? } }
}

// query history submit record
export async function getApplicationHistory(user_id: string) {
  const res = await fetchWrapper(`/application/history/${encodeURIComponent(user_id)}`, {
    method: "GET",
  });
  return res;
}

// get history record
export async function getDraftApplications(user_id: string) {
  const res = await fetchWrapper(`/application/drafts/${encodeURIComponent(user_id)}`, {
    method: "GET",
  });
  return res;
}

// delete application
export async function deleteApplication(application_id: string) {
  const res = await fetchWrapper(`/application/${application_id}`, {
    method: "DELETE",
  });
  return res;
}
