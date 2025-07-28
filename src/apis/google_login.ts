import { getAPIBaseURL } from "./config";

export async function firebaseLogin(idToken: string) {
  const baseURL = await getAPIBaseURL();
  const res = await fetch(`${baseURL}/api/firebase-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",  // important: sets the cookie!
    body: JSON.stringify({ token: idToken })
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
