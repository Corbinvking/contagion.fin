import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeout = useRef<NodeJS.Timeout>();
  const retryCount = useRef(0);
  const maxRetries = 3;
  const isRefreshing = useRef(false);

  const scheduleTokenRefresh = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.expires_at) return;

      // Clear any existing refresh timeout
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }

      // Calculate when to refresh (10 minutes before expiry to allow for retries)
      const expiresIn = new Date(session.expires_at * 1000).getTime() - Date.now() - 10 * 60 * 1000;
      
      if (expiresIn <= 0) {
        // Token is already expired or about to expire, refresh now
        await refreshToken();
      } else {
        // Schedule refresh
        refreshTimeout.current = setTimeout(() => refreshToken(), expiresIn);
      }
    } catch (err) {
      console.error('Error scheduling token refresh:', err);
    }
  };

  const refreshToken = async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        if (error.status === 429 && retryCount.current < maxRetries) {
          // Implement exponential backoff for retries
          const delay = Math.pow(2, retryCount.current + 1) * 1000; // Longer initial delay
          retryCount.current++;
          
          // Schedule retry
          setTimeout(() => {
            isRefreshing.current = false;
            refreshToken();
          }, delay);
          
          return;
        }
        throw error;
      }

      // Reset retry count on success
      retryCount.current = 0;
      
      if (data.session) {
        setUser(data.session.user);
        // Schedule next refresh
        await scheduleTokenRefresh();
      } else {
        // No session after refresh, sign out
        await signOut();
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      if (err.status === 429 || err.name === 'AuthSessionMissingError') {
        await signOut();
      }
    } finally {
      isRefreshing.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          if (session) {
            await scheduleTokenRefresh();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await scheduleTokenRefresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }
    retryCount.current = 0;
    isRefreshing.current = false;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);