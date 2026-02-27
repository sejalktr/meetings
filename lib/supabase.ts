import { createClient } from '@supabase/supabase-js';

// This code tells the app to pull the keys from your Vercel Environment Variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase variables are missing! Check your .env file.");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
