"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: any | null;
  profile: any | null;
  session: any | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
  mergeProfile: (data: Partial<any>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  profileLoading: false,
  signOut: async () => { },
  updateProfile: async () => { },
  refreshProfile: async () => { },
  mergeProfile: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
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

    // Optimistic update — UI reflects immediately
    const newProfile = { ...profile, ...profileData, id: user.id };
    setProfile(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("last-cosmic-profile", JSON.stringify(newProfile));
    }

    try {
      // Simple update — profile always exists (created on signup)
      const { error } = await supabase
        .from("profiles")
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      // Rollback optimistic update on error
      setProfile(profile);
      if (typeof window !== "undefined") {
        localStorage.setItem("last-cosmic-profile", JSON.stringify(profile));
      }
      console.error("[AuthProvider] updateProfile error:", err);
      throw err;
    }
  };

  useEffect(() => {
    // Load cached profile immediately for instant UI
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("last-cosmic-profile");
      if (cached) {
        try { setProfile(JSON.parse(cached)); } catch { }
      }
    }

    // Safety net: never stay loading > 3 seconds
    const safetyTimer = setTimeout(() => setLoading(false), 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "TOKEN_REFRESHED") {
          // Token silently refreshed — unblock UI, no profile re-fetch needed
          clearTimeout(safetyTimer);
          if (session) setSession(session);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser((prev: any) =>
            prev?.id === session.user.id ? prev : session.user
          );
          // Unblock UI immediately — profile loads in background
          clearTimeout(safetyTimer);
          setLoading(false);

          if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
            fetchingProfileFor.current = null;
            fetchProfile(session.user.id); // fire & forget
          }
        } else {
          // No session (unauthenticated or signed out)
          setSession(null);
          setUser(null);
          setProfile(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("last-cosmic-profile");
          }
          setProfileCookie(false);
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setSession(null);
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

  // Merge new data into profile state without any DB call — instant UI update
  const mergeProfile = (data: Partial<any>) => {
    setProfile((prev: any) => {
      const merged = { ...prev, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem("last-cosmic-profile", JSON.stringify(merged));
      }
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, profileLoading, signOut, updateProfile, refreshProfile, mergeProfile }}>
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
