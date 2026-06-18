// src/lib/redirectAfterLogin.ts
// Call this after a successful login to route the user to the right dashboard
// based on their role: admin → /admin, project → /project, creator → /dashboard

import { supabase } from "./api/supabase";

export async function getPostLoginRedirect(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (data?.role === "admin")   return "/admin";
    if (data?.role === "project") return "/project";
  } catch {
    // fallthrough
  }
  return "/dashboard";
}