import { create } from "zustand";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// Extended user type that includes our app-specific properties
export interface AppUser extends SupabaseUser {
  name?: string;
  isPaid?: boolean;
  isPremium?: boolean;
}

interface AuthState {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => {
    // Create extended user with app-specific properties
    const appUser: AppUser | null = session?.user
      ? {
          ...session.user,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
          isPaid: session.user.user_metadata?.isPremium || false,
          isPremium: session.user.user_metadata?.isPremium || false,
        }
      : null;

    set({ session, user: appUser, loading: false });

    // Trigger todo fetch when authentication changes
    if (session?.user) {
      // Import here to avoid circular dependency
      import("./todoStore").then(({ useTodoStore }) => {
        useTodoStore.getState().initializeTodos();
      });
    } else {
      // Clear todos when user logs out
      import("./todoStore").then(({ useTodoStore }) => {
        useTodoStore.getState().clearTodos();
      });
    }
  },
  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      get().setSession(session);

      supabase.auth.onAuthStateChange((_event, session) => {
        get().setSession(session);
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ loading: false });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    // setSession will be called by auth state change listener
  },
}));
