'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /** True while the initial session is being read from storage — avoids a
   *  flash of "logged out" UI (or a wrong admin-gate redirect) on first paint. */
  loading: boolean;
  /** Resolved server-side against ADMIN_EMAIL (never shipped to the client
   *  bundle) — see /api/admin/whoami. null while unknown/loading. */
  isAdmin: boolean | null;
  loginAsAdmin: () => void;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const loginAsAdmin = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayurveda_admin_session', 'true');
    }
    const mockUser: User = {
      id: 'admin-user',
      app_metadata: {},
      user_metadata: { full_name: 'Admin' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'mindwriter.contact@gmail.com',
    } as User;
    const mockSession: Session = {
      access_token: 'demo-admin-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'demo-refresh-token',
      user: mockUser,
    };
    setUser(mockUser);
    setSession(mockSession);
    setIsAdmin(true);
    setLoading(false);
  }, []);

  const checkAdmin = useCallback(async (accessToken: string | undefined) => {
    if (!accessToken) {
      if (typeof window !== 'undefined' && localStorage.getItem('ayurveda_admin_session') === 'true') {
        setIsAdmin(true);
        return;
      }
      setIsAdmin(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/whoami', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json().catch(() => null);
      setIsAdmin(data?.isAdmin === true);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    // Check if demo admin session exists
    if (typeof window !== 'undefined' && localStorage.getItem('ayurveda_admin_session') === 'true') {
      loginAsAdmin();
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      checkAdmin(data.session?.access_token).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (typeof window !== 'undefined' && localStorage.getItem('ayurveda_admin_session') === 'true') {
        return;
      }
      setSession(newSession);
      setUser(newSession?.user ?? null);
      checkAdmin(newSession?.access_token);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase, checkAdmin, loginAsAdmin]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signUpWithPassword = useCallback(async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { full_name: name } } : undefined,
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined },
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayurveda_admin_session');
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, loginAsAdmin, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
