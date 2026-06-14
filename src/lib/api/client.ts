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

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

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

export async function apiPut<T>(path: string, body?: object): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

// Generic DELETE request to backend
export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export async function apiGetPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}