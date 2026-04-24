"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { getURL } from "./url-helpers";

import { useAuthContext } from "@/providers/AuthProvider";

/**
 * Reactive auth hook — now consumes the global AuthContext for stability
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Sign out and clear session
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Sign in with Google using Supabase OIDC
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getURL()}auth/callback`,
    },
  });

  if (error) {
    console.error("Google login error:", error.message);
    throw error;
  }

  return data;
}

/**
 * Sign in silently with Google Identity Services (GIS) ID Token
 */
export async function signInWithGoogleIdToken(token: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token,
  });

  if (error) {
    console.error("Google ID Token login error:", error.message);
    throw error;
  }

  return data;
}

/**
 * Fetch the current user's profile
 */
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return null;
  }

  return data;
}

/**
 * Update user profile details
 */
export async function updateProfile(profileData: any) {
  console.log("updateProfile: Getting user...");
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");
  console.log("updateProfile: User authenticated:", user.id);

  // Fetch existing profile to preserve mandatory fields (like full_name) during upsert
  console.log("updateProfile: Fetching existing profile...");
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("updateProfile: Fetch error:", fetchError.message);
    throw fetchError;
  }
  console.log("updateProfile: Existing profile fetched");

  console.log("updateProfile: Upserting new data...");
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...(existingProfile || {}), // Spread existing data
      ...profileData,            // Apply new updates
      updated_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  console.log("updateProfile: Upsert response received");

  if (error) {
    console.error("updateProfile: Upsert error:", error.message);
    throw error;
  }

  console.log("updateProfile: Success");
  return data;
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(file: File) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", user.id);

  const res = await fetch("/api/upload-avatar", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || "Sunucu yükleme hatası");
  }

  return data.url;
}
