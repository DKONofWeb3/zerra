import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/api/supabase";

interface ZerraUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  created_at: string;
}

export function useCurrentUser() {
  const { session } = useAuth();
  const [user, setUser] = useState<ZerraUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }

    async function fetchUser() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me`,
          {
            headers: {
              Authorization: `Bearer ${session!.access_token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.user);
      } catch {
        // fallback to supabase session data
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email ?? "",
            name: data.user.user_metadata?.full_name ?? null,
            avatar: data.user.user_metadata?.avatar_url ?? null,
            created_at: data.user.created_at,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [session]);

  return { user, loading };
}