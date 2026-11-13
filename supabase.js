// Add the URL from Supabase Project Settings > API before enabling cloud portals.
// The anon/publishable key is intended for browser use; enforce Row Level Security in Supabase.
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = 'sb_publishable_86gVUSBiNObcZKjNnXQk_A_r-6F6yXP';
const supabaseClient = (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase?.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
