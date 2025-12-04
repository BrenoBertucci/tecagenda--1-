import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.localVITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.local.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL ERROR: Supabase environment variables are missing!');
    console.error('Please check .env.local and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Use placeholders to prevent crash during module initialization
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder';

export const supabase = createClient(safeUrl, safeKey);
