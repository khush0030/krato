import { createClient } from '@supabase/supabase-js';

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!url || !key) {
      // Return a dummy during build — actual calls will fail at runtime with a clear error
      console.warn('Supabase credentials not configured');
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    _client = createClient(url, key);
  }
  return _client;
}
