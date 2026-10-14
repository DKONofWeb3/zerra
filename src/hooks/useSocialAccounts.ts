import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/api/supabase";

interface SocialAccount {
  id: string;
  platform: string;
  username: string | null;
  expires_at: string | null;
  created_at: string;
  follower_count?: number | null;
}

// Connected accounts live on the server. The list is cached per user in
// localStorage so a page load shows them immediately, and it is only ever
// replaced by a *successful* response. A failed or slow request (expired
// token on load, backend waking up, flaky network) must never read as
// "nothing connected": only the user pressing Disconnect removes an account.
const cacheKey = (userId: string) => `zerra_social_accounts:${userId}`;

function readCache(userId: string | undefined): SocialAccount[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(userId: string, accounts: SocialAccount[]) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(accounts));
  } catch {
    /* storage blocked or full: the in-memory list still works */
  }
}

const RETRY_DELAYS_MS = [1500, 4000, 9000];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useSocialAccounts() {
  const { session, user } = useAuth();
  const userId = user?.id;
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => readCache(userId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const latest = useRef(0); // ignore responses from superseded fetches

  // Switching users must not show the previous user's accounts.
  useEffect(() => {
    setAccounts(readCache(userId));
  }, [userId]);

  const request = useCallback(async (token: string) => {
    return fetch(`${import.meta.env.VITE_API_URL}/me/social-accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }, []);

  const fetchAccounts = useCallback(async () => {
    if (!session || !userId) { setLoading(false); return; }
    const run = ++latest.current;
    setLoading(true);
    let token = session.access_token;
    let refreshed = false;

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        let res = await request(token);

        // Expired access token (common right after the tab was closed for a while): refresh once.
        if (res.status === 401 && !refreshed) {
          refreshed = true;
          const { data } = await supabase.auth.refreshSession();
          if (data.session) {
            token = data.session.access_token;
            res = await request(token);
          }
        }

        if (res.ok) {
          const data = await res.json();
          const list: SocialAccount[] = data.accounts ?? [];
          if (run !== latest.current) return;
          setAccounts(list);
          writeCache(userId, list);
          setError(false);
          setLoading(false);
          return;
        }
        // 4xx other than 401 will not fix itself; 5xx / 401 may, so fall through to retry.
        if (res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 408 && res.status !== 429) break;
      } catch {
        /* network error: retry below */
      }
      if (attempt < RETRY_DELAYS_MS.length) await wait(RETRY_DELAYS_MS[attempt]);
      if (run !== latest.current) return;
    }

    // Gave up: keep whatever we already had (cached list) and flag the error.
    if (run !== latest.current) return;
    setError(true);
    setLoading(false);
  }, [session, userId, request]);

  // Key on the token's user, not the session object: Supabase hands out a new
  // session object on every token refresh, which would refetch needlessly.
  useEffect(() => { fetchAccounts(); }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return { accounts, loading, error, disconnect, connectTikTok, refetch: fetchAccounts };
}
