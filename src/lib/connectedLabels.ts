// Connected platforms shown under a user's name: nothing when none are
// connected, otherwise one entry per connected account.
export const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  twitter: "X",
};

export function connectedHandles<T extends { platform: string; username: string | null }>(accounts: T[]) {
  return accounts
    .filter((a) => PLATFORM_LABEL[a.platform] && a.username)
    .map((a) => ({ platform: a.platform, label: PLATFORM_LABEL[a.platform], username: a.username as string }));
}
