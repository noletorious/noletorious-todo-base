import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
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
    set({ session, user: session?.user ?? null, loading: false });

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
