import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/api/supabase";

interface ZerraUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  created_at: string;
  username?: string | null;
  wallet_address?: string | null;
  wallet_chain?: string | null;
  notifications_prefs?: { email: boolean; push: boolean; campaigns: boolean } | null;
  privacy_settings?: { public_profile: boolean } | null;
}

export function useCurrentUser() {
  const { session } = useAuth();
  const [user, setUser]     = useState<ZerraUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!session) { setLoading(false); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data.user);
    } catch {
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
  }, [session]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, refresh: fetchUser };
}