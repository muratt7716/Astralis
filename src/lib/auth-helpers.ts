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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Fetch existing profile to preserve mandatory fields (like full_name) during upsert
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

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

  if (error) {
    console.error("Error updating profile:", error.message);
    throw error;
  }

  return data;
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(file: File) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('cosmic-assets')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('cosmic-assets')
    .getPublicUrl(filePath);

  return publicUrl;
}
