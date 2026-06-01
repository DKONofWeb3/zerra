import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface SocialAccount {
  id: string;
  platform: string;
  username: string | null;
  expires_at: string | null;
  created_at: string;
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