// src/api/login.ts
import { apiBaseURL } from "./config";

export async function login(email: string, password: string) {
    const response = await fetch(`${apiBaseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
    });

    const data = await response.json();
    console.log("Login response:", data);
    return { ok: response.ok, data };
}
