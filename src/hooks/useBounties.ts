import { useEffect, useState } from "react";

interface Bounty {
  id: string;
  project_name: string;
  token_icon: string | null;
  reward_usdc: number;
  description: string | null;
  status: string;
  created_at: string;
}

export function useBounties() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBounties() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/bounties`);
        if (!res.ok) throw new Error("Failed to fetch bounties");
        const data = await res.json();
        setBounties(data.bounties ?? []);
      } catch {
        setBounties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBounties();
  }, []);

  return { bounties, loading };
}