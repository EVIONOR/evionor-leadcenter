// EVIONOR Supabase Auth Client
// This client connects directly to EVIONOR for authentication
import { createClient } from '@supabase/supabase-js';

const EVIONOR_URL = 'https://zqnaexspgdlaccaqcsmq.supabase.co';
const EVIONOR_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbmFleHNwZ2RsYWNjYXFjc21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDQ2NjgsImV4cCI6MjA3NzU4MDY2OH0.ZSQ5Mv11dus-tc60IbDEeEoCbGeRMMzWgUGP9HbUCyc';

export const evionorAuth = createClient(EVIONOR_URL, EVIONOR_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
