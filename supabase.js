// Supabase browser client configuration.
// The publishable key is safe to expose in the browser; protect data with RLS policies.
const SUPABASE_URL = 'https://iazlemocpuhzwtrkyfgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sbS10vHYIrxhHsqnQNoWgA_WzREJj_-';

const supabaseClient = (window.supabase?.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
