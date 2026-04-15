import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/api/supabaseApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
      setIsLoadingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const initAuth = async () => {
    try {
      const session = await auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadProfile(session.user.id);
      }
    } catch (e) {
      console.error('Auth init error:', e);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loadProfile = async (userId) => {
    try {
      const p = await auth.getProfile(userId);
      setProfile(p);
    } catch (e) {
      console.error('Profile load error:', e);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) await loadProfile(user.id);
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const mergedUser = user && profile
    ? { ...profile, id: user.id, email: user.email,
        full_name: profile.full_name || user.user_metadata?.full_name || user.email }
    : null;

  return (
    <AuthContext.Provider value={{
      user: mergedUser, rawUser: user, profile,
      isAuthenticated, isLoadingAuth,
      logout, refreshProfile, loadProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
