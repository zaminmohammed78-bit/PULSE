// Supabase browser client configuration.
// The publishable key is safe to expose in the browser; protect data with RLS policies.
const SUPABASE_URL = 'https://mhwnyamoregoycuyudyc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_86gVUSBiNObcZKjNnXQk_A_r-6F6yXP';

const supabaseClient = (window.supabase?.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
