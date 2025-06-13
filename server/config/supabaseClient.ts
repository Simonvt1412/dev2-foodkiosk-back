import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.error('Required variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  
  // Show clear guidance for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Example .env file should contain:');
    console.log('SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('SUPABASE_ANON_KEY=your-anon-key');
  }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');