import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL;

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) throw new Error("Not authenticated");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Generic GET request to backend
export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { headers });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

// Generic POST request to backend
export async function apiPost<T>(path: string, body?: object): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

// Public GET (no auth needed)
export async function apiGetPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}