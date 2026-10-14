// "Remember me" for the Supabase session.
//
// Supabase persists its session in localStorage by default (stays signed in across
// browser restarts). When a user logs in with "Remember me" UNCHECKED we keep the
// session in sessionStorage instead: it survives reloads but not closing the tab or
// browser. The choice is stored under one flag in localStorage so every Supabase read
// and write goes to the right place.
//
// Existing users have no flag, so they keep using localStorage exactly as before.

export const REMEMBER_KEY = "zerra_remember_me"; // "0" = session-only; absent = remember

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key?(index: number): string | null;
  readonly length?: number;
}

/** Storage adapter handed to createClient({ auth: { storage } }). Never throws. */
export function createRememberStorage(local: KeyValueStorage | undefined, session: KeyValueStorage | undefined) {
  const sessionOnly = () => {
    try {
      return local?.getItem(REMEMBER_KEY) === "0";
    } catch {
      return false;
    }
  };
  const target = () => (sessionOnly() ? session : local) ?? local ?? session;

  return {
    getItem(key: string): string | null {
      try {
        return target()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        target()?.setItem(key, value);
      } catch {
        /* storage full or blocked: Supabase keeps working in memory for this page */
      }
    },
    // Clear from both so a sign-out can never leave a stale session behind in the other store.
    removeItem(key: string): void {
      for (const s of [local, session]) {
        try {
          s?.removeItem(key);
        } catch {
          /* ignore */
        }
      }
    },
  };
}

/** Is a stored key one of Supabase's session entries ("sb-<project>-auth-token", plus its pieces)? */
const isSupabaseAuthKey = (k: string) => /^sb-.+-auth-token/.test(k);

/**
 * Record the user's choice. Choosing "don't remember" also removes any session
 * already persisted in localStorage, so ticking the box off really means this
 * browser forgets the user when the tab closes.
 */
export function setRememberMe(remember: boolean, local: KeyValueStorage | undefined = safeLocal()): void {
  try {
    if (!local) return;
    if (remember) {
      local.removeItem(REMEMBER_KEY);
      return;
    }
    local.setItem(REMEMBER_KEY, "0");
    if (typeof local.length === "number" && local.key) {
      const stale: string[] = [];
      for (let i = 0; i < local.length; i++) {
        const k = local.key(i);
        if (k && isSupabaseAuthKey(k)) stale.push(k);
      }
      stale.forEach((k) => local.removeItem(k));
    }
  } catch {
    /* ignore */
  }
}

function safeLocal(): KeyValueStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
