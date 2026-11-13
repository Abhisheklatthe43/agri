import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const authService = {
  // Register with email and password
  async signUp(email, password, fullName) {
    if (!isSupabaseConfigured) {
      // Demo / offline fallback mode
      const demoUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email,
        user_metadata: { full_name: fullName }
      };
      localStorage.setItem('agrismart_demo_token', 'demo-token');
      localStorage.setItem('agrismart_demo_user', JSON.stringify(demoUser));
      return { user: demoUser, session: { access_token: 'demo-token' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Login with email and password
  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email,
        user_metadata: { full_name: 'Demo Farmer' }
      };
      localStorage.setItem('agrismart_demo_token', 'demo-token');
      localStorage.setItem('agrismart_demo_user', JSON.stringify(demoUser));
      return { user: demoUser, session: { access_token: 'demo-token' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    localStorage.removeItem('agrismart_demo_token');
    localStorage.removeItem('agrismart_demo_user');

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    if (!isSupabaseConfigured) {
      return { message: 'Password recovery email sent (demo mode simulated)' };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) throw error;
    return data;
  },

  // Get current session
  async getSession() {
    if (!isSupabaseConfigured) {
      const token = localStorage.getItem('agrismart_demo_token');
      const userStr = localStorage.getItem('agrismart_demo_user');
      if (token && userStr) {
        return {
          user: JSON.parse(userStr),
          access_token: token
        };
      }
      return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  }
};
