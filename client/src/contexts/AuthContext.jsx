import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      return data;
    } catch (err) {
      console.warn('Failed to fetch user profile:', err.message);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile();
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    let authListener = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile();
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      authListener = data.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.signIn(email, password);
    setUser(data.user);
    await fetchProfile();
    return data;
  };

  const register = async (email, password, fullName) => {
    const data = await authService.signUp(email, password, fullName);
    setUser(data.user);
    await fetchProfile();
    return data;
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
      updateProfileState,
      isAuthenticated: Boolean(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
