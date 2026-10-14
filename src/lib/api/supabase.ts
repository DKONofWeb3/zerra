import { createClient } from "@supabase/supabase-js";
import { createRememberStorage } from "./rememberStorage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const safe = (get: () => Storage) => {
  try {
    return get();
  } catch {
    return undefined; // storage blocked (private mode / disabled)
  }
};

// The session lives in localStorage unless the user logged in with "Remember me"
// unchecked, in which case it lives in sessionStorage (see rememberStorage.ts).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createRememberStorage(
      safe(() => window.localStorage),
      safe(() => window.sessionStorage),
    ),
  },
});
