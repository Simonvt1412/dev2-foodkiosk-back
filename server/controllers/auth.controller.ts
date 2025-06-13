import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient';

// Declare session type augmentation for TypeScript
declare module 'express-session' {
  interface SessionData {
    user: any;
    isAuthenticated: boolean;
  }
}

// Show login page
export const showLogin = (req: Request, res: Response) => {
  // If user is already logged in, redirect to dashboard
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/dashboard');
  }
  
  res.render('auth/login', { 
    error: null,
    success: null, 
    page: 'login',
    title: 'Login - FoodKiosk'
  });
};

// Process login form
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('auth/login', { 
        error: 'Email en wachtwoord zijn verplicht',
        success: null, 
        page: 'login',
        title: 'Login - FoodKiosk'
      });
    }

    console.log('👤 Attempting login for user:', email);

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return res.render('auth/login', { 
        error: 'Ongeldige inloggegevens',
        success: null, 
        page: 'login',
        title: 'Login - FoodKiosk'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.error('❌ Invalid password for user:', email);
      return res.render('auth/login', { 
        error: 'Ongeldige inloggegevens',
        success: null, 
        page: 'login',
        title: 'Login - FoodKiosk'
      });
    }

    // Set user session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.session.isAuthenticated = true;

    console.log('✅ User logged in successfully:', user.name);
    
    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('❌ Login error:', error);
    res.render('auth/login', { 
      error: 'Er is een fout opgetreden. Probeer het later opnieuw.',
      success: null, 
      page: 'login',
      title: 'Login - FoodKiosk'
    });
  }
};

// Process logout
export const logout = (req: Request, res: Response) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error destroying session:', err);
    }
    
    // Redirect to login page
    res.redirect('/auth/login');
  });
};