import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface SocialAccount {
  id: string;
  platform: string;
  username: string | null;
  expires_at: string | null;
  created_at: string;
  /**
   * TikTok follower count. NOT YET POPULATED by the backend — see
   * src/lib/tiktok.ts: getTikTokUser() requests
   * fields=open_id,username,display_name,avatar_url and needs
   * follower_count added (the granted OAuth scope already includes
   * user.info.stats, which is what unlocks this field — no new TikTok
   * permission needed). Once the backend adds it to that fetch and to
   * whatever row this endpoint reads from, this field starts arriving
   * for real and the Verified Influencer gate in useBadges.ts goes live
   * automatically — no frontend change needed beyond what's already here.
   */
  follower_count?: number | null;
}

export function useSocialAccounts() {
  const { session } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    if (!session) { setLoading(false); return; }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/me/social-accounts`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [session]);

  const disconnect = async (id: string) => {
    if (!session) return;
    await fetch(`${import.meta.env.VITE_API_URL}/me/social-accounts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    await fetchAccounts();
  };

  const connectTikTok = () => {
    if (!session) return;
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/tiktok?token=${session.access_token}`;
  };

  return { accounts, loading, disconnect, connectTikTok, refetch: fetchAccounts };
}