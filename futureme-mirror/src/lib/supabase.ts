import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// Load environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Keep a single browser client instance
let _client: SupabaseClient | null = null;

// Exported helper to create (and reuse) the Supabase client
export function createClient(): SupabaseClient {
  if (!_client) {
    _client = createSupabaseClient(url, anonKey);
  }
  return _client;
}
