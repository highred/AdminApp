import { createClient } from '@supabase/supabase-js';

// The Supabase URL and Anon Key are hardcoded here for this development environment.
// In a real production deployment (e.g., on Vercel), these would be set as
// environment variables for security and flexibility.
const supabaseUrl = 'https://uoexkxcjlypbbovjcqln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZXhreGNqbHlwYmJvdmpjcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzA4MjksImV4cCI6MjA3MTc0NjgyOX0.l0ToeaWXeLEGO8HyOXFUqpyrQiAyQO_b15flIuCa8vQ';


if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing. Make sure to set them correctly in supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);