import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const MISSING_ENV = !supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co'
  || !supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here';

export { MISSING_ENV };

// Use placeholder values so createClient() doesn't throw on missing env
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: { persistSession: true, autoRefreshToken: true }
  }
);
