"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const setProfileCookie = (value: boolean) => {
    if (typeof window === 'undefined') return;
    if (value) {
      document.cookie = `has-profile=true; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    } else {
      document.cookie = `has-profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile in AuthProvider:", error.message);
      } else if (data) {
        setProfile(data);
        setProfileCookie(true);
        // Sync to cache
        if (typeof window !== 'undefined') {
          localStorage.setItem("last-cosmic-profile", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile in AuthProvider:", err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) return;

    // 1. OPTIMISTIC UPDATE: Update local state immediately
    const previousProfile = profile;
    const newProfile = { ...profile, ...profileData, id: user.id };
    setProfile(newProfile);
    
    // Update cache immediately too
    if (typeof window !== 'undefined') {
      localStorage.setItem("last-cosmic-profile", JSON.stringify(newProfile));
    }

    try {
      // 2. BACKGROUND SYNC: Mevcut profili merge ederek güncelle
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          ...(existing || {}),
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      
      // Update with confirmed data from server
      if (data) {
        setProfile(data);
        setProfileCookie(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem("last-cosmic-profile", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Error updating profile in AuthProvider:", err);
      // Rollback on failure? 
      // For UX speed, we might not want to rollback immediately unless it's a critical error,
      // but let's keep the optimistic state and just log.
      // setProfile(previousProfile); 
    }
  };

  useEffect(() => {
    // Initial session check
    const init = async () => {
      try {
        // Try to load profile from cache FIRST for instant UI
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem("last-cosmic-profile");
          if (cached) {
            setProfile(JSON.parse(cached));
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthProvider] Auth event: ${event}`);
      if (session?.user) {
        // Preserve same object reference on token refresh to avoid triggering
        // dependent useEffect hooks in consumer components unnecessarily
        setUser((prev: any) => (prev?.id === session.user.id ? prev : session.user));
        // Only re-fetch profile on meaningful auth events, not periodic token refreshes
        if (event !== 'TOKEN_REFRESHED') {
          await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem("last-cosmic-profile");
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("[AuthProvider] signOut initiated");
    try {
      setUser(null);
      setProfile(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("last-cosmic-profile");
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[AuthProvider] signOut error:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setProfileCookie(false);
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
