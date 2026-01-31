import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
const hasCredentials = supabaseUrl && supabaseAnonKey;

if (!hasCredentials) {
  console.error(
    '⚠️ Supabase credentials not found!\n' +
    'Please create a .env file in the root directory with:\n' +
    'VITE_SUPABASE_URL=your_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_anon_key\n\n' +
    'Get these values from: Supabase Dashboard > Settings > API\n' +
    'See SUPABASE_SETUP.md for detailed instructions.'
  );
}

// Use environment variables or placeholder (will fail on API calls but won't crash the app)
// Remove quotes if present in env vars
const url = (supabaseUrl || 'https://placeholder.supabase.co').replace(/^["']|["']$/g, '');
const key = (supabaseAnonKey || 'placeholder-key').replace(/^["']|["']$/g, '');

// Log which project is being used (for debugging)
if (import.meta.env.DEV && hasCredentials) {
  const projectId = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';
  console.log('🔗 Using Supabase project:', projectId);
  console.log('📍 URL:', url);
}

export const supabase = createClient<Database>(url, key);

// Export a helper to check if credentials are configured
export const isSupabaseConfigured = () => hasCredentials;

