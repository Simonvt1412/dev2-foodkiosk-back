import { supabase } from '../config/supabaseClient';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🔧 Setting up database...');

  try {
    // First, ensure the exec_sql function exists
    console.log('📝 Checking if exec_sql function exists...');
    
    try {
      // Testing if function exists
      const { error: testFunctionError } = await supabase.rpc('exec_sql', { sql_string: 'SELECT 1;' });
      
      if (testFunctionError && testFunctionError.message.includes('does not exist')) {
        console.error('❌ The exec_sql function does not exist in your database.');
        console.log('Please run the following SQL in the Supabase SQL Editor:');
        console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql_string text) RETURNS void AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        return;
      } else {
        console.log('✅ exec_sql function exists');
      }
    } catch (funcError) {
      console.error('❌ Error checking exec_sql function:', funcError);
      return;
    }
    
    // Disable RLS on users table
    console.log('🔓 Disabling Row Level Security on users table...');
    
    const { error: disableRlsError } = await supabase.rpc('exec_sql', { 
      sql_string: 'ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableRlsError) {
      console.error('❌ Error disabling RLS:', disableRlsError);
    } else {
      console.log('✅ Row Level Security disabled on users table');
    }
    
    // Create or update users table schema if needed
    console.log('🔄 Updating users table schema if needed...');
    
    const { error: schemaError } = await supabase.rpc('exec_sql', { 
      sql_string: `
        -- Add any missing columns to users table
        ALTER TABLE IF EXISTS public.users 
          ADD COLUMN IF NOT EXISTS name TEXT,
          ADD COLUMN IF NOT EXISTS password_hash TEXT,
          ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `
    });
    
    if (schemaError) {
      console.error('❌ Error updating schema:', schemaError);
    } else {
      console.log('✅ Schema updated successfully');
    }
    
    console.log('🏁 Database setup complete');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

// Run the setup function
setupDatabase()
  .then(() => {
    console.log('✅ Database setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Unhandled error in setup script:', error);
    process.exit(1);
  });