import { supabase } from '../config/supabaseClient';
import bcrypt from 'bcryptjs'; // Changed from bcrypt to bcryptjs
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  try {
    // Default admin credentials (use environment variables if available)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@foodkiosk.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'FoodKiosk Admin';

    console.log('🔍 Checking if admin user exists...');
    
    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', adminEmail.toLowerCase())
      .single();

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: adminName,
          email: adminEmail.toLowerCase(),
          password_hash: hashedPassword,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin user:', error);
      
      if (error.message.includes('violates row-level security')) {
        console.log('⚠️ Row Level Security is preventing user creation.');
        console.log('Please run the setupDB.ts script first to disable RLS.');
      }
      
      return;
    }

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Please change this default password after logging in');
  } catch (error) {
    console.error('❌ Error in createAdminUser:', error);
  }
}

// Run the function
createAdminUser()
  .then(() => {
    console.log('✅ Admin user creation process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });