"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  signOut: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Prevent fetchProfile from running concurrently or redundantly
  const fetchingProfileFor = useRef<string | null>(null);

  const setProfileCookie = (value: boolean) => {
    if (typeof window === "undefined") return;
    if (value) {
      document.cookie = `has-profile=true; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    } else {
      document.cookie = `has-profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  };

  const fetchProfile = async (userId: string) => {
    // Skip if we're already fetching for this user
    if (fetchingProfileFor.current === userId) return;
    fetchingProfileFor.current = userId;
    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setProfileCookie(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("last-cosmic-profile", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("[AuthProvider] fetchProfile error:", err);
    } finally {
      fetchingProfileFor.current = null;
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      fetchingProfileFor.current = null; // allow re-fetch
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) return;

    // Optimistic update
    const newProfile = { ...profile, ...profileData, id: user.id };
    setProfile(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("last-cosmic-profile", JSON.stringify(newProfile));
    }

    try {
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

      if (data) {
        setProfile(data);
        setProfileCookie(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("last-cosmic-profile", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("[AuthProvider] updateProfile error:", err);
    }
  };

  useEffect(() => {
    // Load cached profile immediately for instant UI
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("last-cosmic-profile");
      if (cached) {
        try { setProfile(JSON.parse(cached)); } catch {}
      }
    }

    // Safety net: never stay loading > 8 seconds
    const safetyTimer = setTimeout(() => setLoading(false), 8000);

    // Single source of truth: onAuthStateChange handles everything
    // getSession() is NOT called separately to avoid double-auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "TOKEN_REFRESHED") {
          // Token silently refreshed — no state changes needed
          clearTimeout(safetyTimer);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser((prev: any) =>
            prev?.id === session.user.id ? prev : session.user
          );
          // Only fetch profile on meaningful events
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
            await fetchProfile(session.user.id);
          }
        } else {
          setUser(null);
          setProfile(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("last-cosmic-profile");
          }
          setProfileCookie(false);
        }

        clearTimeout(safetyTimer);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setProfileCookie(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("last-cosmic-profile");
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[AuthProvider] signOut error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
