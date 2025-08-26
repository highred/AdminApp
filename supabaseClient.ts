import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These environment variables will be set in Vercel for deployment.
// For local development, you would create a .env file and use a tool like Vite
// to expose them. For now, you can temporarily hardcode them here for testing,
// but be sure to replace them with process.env before committing to GitHub.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
