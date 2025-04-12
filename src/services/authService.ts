
import { supabase } from "@/integrations/supabase/client";

// Interfaces
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}

// Authentication functions
export const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.full_name,
        photoUrl: data.user.user_metadata?.avatar_url,
      };
    }
    return null;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, fullName?: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        displayName: fullName || '',
      };
    }
    return null;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    
    if (data && data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.full_name,
        photoUrl: data.user.user_metadata?.avatar_url,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Auth state listener setup
export const setupAuthListener = (callback: (user: UserProfile | null) => void): (() => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      const user: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        displayName: session.user.user_metadata?.full_name,
        photoUrl: session.user.user_metadata?.avatar_url,
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};
