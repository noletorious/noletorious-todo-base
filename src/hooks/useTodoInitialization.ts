import { useEffect, useRef } from "react";
import { useTodoStore } from "../store/todoStore";
import { useAuthStore } from "../store/authStore";

/**
 * Hook to ensure todos are properly initialized and synchronized
 * Use this in components that need todo data to be available
 */
export function useTodoInitialization() {
  const { user } = useAuthStore();
  const { initializeTodos, loading, todos } = useTodoStore();
  const initializedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id || null;

    // Reset initialization flag if user changes
    if (userIdRef.current !== currentUserId) {
      initializedRef.current = false;
      userIdRef.current = currentUserId;
    }

    // Only initialize once per user session
    if (user && !initializedRef.current && !loading) {
      console.log("Initializing todos for user:", user.id);
      initializedRef.current = true;
      initializeTodos();
    }
  }, [user?.id, loading, initializeTodos]);

  return { loading, initialized: !!user && todos.length >= 0 };
}
