// EVIONOR Supabase Auth Client
// This client connects directly to EVIONOR for authentication
import { createClient } from '@supabase/supabase-js';

const EVIONOR_URL = import.meta.env.VITE_EVIONOR_SUPABASE_URL;
const EVIONOR_ANON_KEY = import.meta.env.VITE_EVIONOR_SUPABASE_ANON_KEY;

export const evionorAuth = createClient(EVIONOR_URL, EVIONOR_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
