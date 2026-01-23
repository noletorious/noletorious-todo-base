import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "../lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export type Status = "BACKLOG" | "SELECTED" | "IN_PROGRESS" | "DONE"
export type Priority = "LOW" | "MEDIUM" | "HIGH"

export interface Todo {
  id: string
  title: string
  description?: string
  status: Status
  label?: string // Maps to database 'label' field
  priority?: Priority
  dueDate?: string // ISO string
  imageUrl?: string
  order: number
  projectName?: string
  completed?: boolean
  userId?: string
  selected?: boolean // For backlog selection (AGILE methodology)
  isArchived?: boolean
  completionReason?: string
  createdAt?: string
  updatedAt?: string
  // Client-side only fields (not in database)
  lastOpenedAt?: string // When task was last opened/viewed
  completedAt?: string // When task was marked as done
}

interface TodoState {
  todos: Todo[]
  loading: boolean
  error: string | null
  selectedTodos: Todo[] // For selected todos in backlog
  subscription: RealtimeChannel | null // For real-time subscription cleanup

  // Basic CRUD operations
  fetchTodos: () => Promise<void>
  addTodo: (todo: Partial<Todo>) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  setTodos: (todos: Todo[]) => void

  // Selection operations for AGILE methodology
  selectTodo: (id: string) => Promise<void>
  unselectTodo: (id: string) => Promise<void>
  moveSelectedToKanban: () => Promise<void>

  // Bulk operations
  bulkUpdateOrder: (
    updates: { id: string; order: number; status?: Status }[]
  ) => Promise<void>

  // Initialization and cleanup
  initializeTodos: () => Promise<void>
  cleanupSubscription: () => void
  clearTodos: () => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      loading: false,
      error: null,
      selectedTodos: [],
      subscription: null,

      fetchTodos: async () => {
        console.log(
          "🚀 fetchTodos called - current loading state:",
          get().loading
        )

        // Prevent multiple simultaneous fetches
        if (get().loading) {
          console.log("⏸️ Already loading, skipping fetch")
          return
        }

        console.log("📊 Setting loading to true...")
        set({ loading: true, error: null })

        try {
          console.log("🔑 Getting authenticated user...")
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser()

          if (authError) {
            console.error("❌ Auth error:", authError)
            throw new Error(`Auth error: ${authError.message}`)
          }

          if (!user) {
            console.log("❌ No user found during fetch")
            set({ todos: [], selectedTodos: [], loading: false })
            return
          }

          console.log("✅ User found:", user.id)
          console.log("📧 User email:", user.email)

          console.log("🏗️ Querying todos from database...")
          const { data, error } = await supabase
            .from("Todo")
            .select("*")
            .eq("userId", user.id)
            .order("order", { ascending: true })

          if (error) {
            console.error("❌ Database error:", error)
            throw error
          }

          console.log(
            "✅ Database query successful! Found",
            data?.length || 0,
            "todos"
          )
          console.log("📋 Todos data:", data)

          // Map Supabase data to our Todo Type and extract selected todos
          const todos = (data as Todo[]) || []
          const selectedTodos = todos.filter((todo) => todo.selected)

          console.log("🎯 Setting todos in state:", {
            todosCount: todos.length,
            selectedCount: selectedTodos.length,
          })
          set({ todos, selectedTodos })

          console.log("✅ fetchTodos completed successfully!")
        } catch (err: unknown) {
          console.error("💥 Error in fetchTodos:", err)
          set({
            error: err instanceof Error ? err.message : "An error occurred",
          })
        } finally {
          console.log("🏁 Setting loading to false...")
          set({ loading: false })
          console.log("🏁 Loading state after finally:", get().loading)
        }
      },

      addTodo: async (todo) => {
        const tempId = uuidv4()

        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser()

          if (authError || !user) {
            throw new Error("User not logged in")
          }

          // 1. Optimistic Update
          const newTodo: Todo = {
            id: tempId,
            title: todo.title || "New Task",
            status: todo.status || "BACKLOG",
            label: todo.label,
            description: todo.description,
            priority: todo.priority || "MEDIUM",
            order: todo.order || Date.now(),
            completed: false,
            selected: false,
            userId: user.id,
            ...todo,
          } as Todo

          set((state) => ({ todos: [...state.todos, newTodo] }))

          // 2. Call API - Let DB generate ID for safety
          const taskPayload = {
            title: newTodo.title,
            description: newTodo.description,
            status: newTodo.status,
            label: newTodo.label,
            priority: newTodo.priority,
            dueDate: newTodo.dueDate
              ? new Date(newTodo.dueDate).toISOString()
              : null,
            imageUrl: newTodo.imageUrl,
            order: newTodo.order,
            completed: newTodo.completed,
            selected: newTodo.selected,
            userId: user.id,
          }

          const { data, error } = await supabase
            .from("Todo")
            .insert([taskPayload])
            .select()
            .single()

          if (error) throw error

          // 3. Replace temp todo with real one
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === tempId ? (data as Todo) : t
            ),
          }))
        } catch (err: unknown) {
          console.error("Error adding todo:", err)
          // Revert optimistic update
          set((state) => ({
            todos: state.todos.filter((t) => t.id !== tempId),
          }))
          set({
            error: err instanceof Error ? err.message : "An error occurred",
          })
        }
      },

      updateTodo: async (id, updates) => {
        // Automatically add updatedAt timestamp to all updates
        const timestampedUpdates = {
          ...updates,
          updatedAt: new Date().toISOString(),
        }

        // Filter out fields that don't exist in the database
        const dbFields = [
          "id",
          "title",
          "description",
          "status",
          "label",
          "priority",
          "dueDate",
          "imageUrl",
          "order",
          "projectName",
          "completed",
          "selected",
          "isArchived",
          "completionReason",
          "userId",
          "createdAt",
          "updatedAt",
        ]
        const dbUpdates = Object.keys(timestampedUpdates)
          .filter((key) => dbFields.includes(key))
          .reduce(
            (obj, key) => {
              obj[key] =
                timestampedUpdates[key as keyof typeof timestampedUpdates]
              return obj
            },
            {} as Record<string, any>
          )

        // 1. Optimistic Update (use all fields for state)
        const previousTodos = get().todos
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, ...timestampedUpdates } : t
          ),
        }))

        try {
          // 2. Call API (use only database fields)
          const { error } = await supabase
            .from("Todo")
            .update(dbUpdates)
            .eq("id", id)

          if (error) throw error
        } catch (err: unknown) {
          console.error("Error updating todo:", err)
          // Revert
          set({
            todos: previousTodos,
            error: err instanceof Error ? err.message : "An error occurred",
          })
        }
      },

      deleteTodo: async (id) => {
        // 1. Optimistic Update
        const previousTodos = get().todos
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }))

        try {
          const { error } = await supabase.from("Todo").delete().eq("id", id)

          if (error) throw error
        } catch (err: unknown) {
          console.error("Error deleting todo:", err)
          set({
            todos: previousTodos,
            error: err instanceof Error ? err.message : "An error occurred",
          })
        }
      },

      setTodos: (todos) => set({ todos }),

      // Selection operations for AGILE methodology
      selectTodo: async (id) => {
        const todo = get().todos.find((t) => t.id === id)
        if (!todo) return

        // Add to selected list and update todo
        set((state) => ({
          selectedTodos: [
            ...state.selectedTodos.filter((t) => t.id !== id),
            { ...todo, selected: true },
          ],
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, selected: true } : t
          ),
        }))

        // Update in database
        try {
          await get().updateTodo(id, { selected: true })
        } catch (err: unknown) {
          console.error("Error selecting todo:", err)
        }
      },

      unselectTodo: async (id) => {
        set((state) => ({
          selectedTodos: state.selectedTodos.filter((t) => t.id !== id),
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, selected: false } : t
          ),
        }))

        // Update in database
        try {
          await get().updateTodo(id, { selected: false })
        } catch (err: unknown) {
          console.error("Error unselecting todo:", err)
        }
      },

      moveSelectedToKanban: async () => {
        const { selectedTodos } = get()
        const updates = selectedTodos.map((todo) => ({
          id: todo.id,
          status: "TODO" as Status,
          selected: false,
        }))

        // Update all selected todos to TODO status
        for (const update of updates) {
          await get().updateTodo(update.id, {
            status: update.status,
            selected: update.selected,
          })
        }

        set({ selectedTodos: [] })
      },

      bulkUpdateOrder: async (updates) => {
        // Optimistic update
        const previousTodos = get().todos
        set((state) => ({
          todos: state.todos.map((todo) => {
            const update = updates.find((u) => u.id === todo.id)
            return update
              ? {
                  ...todo,
                  order: update.order,
                  ...(update.status && { status: update.status }),
                }
              : todo
          }),
        }))

        try {
          // Batch update in database
          for (const update of updates) {
            await supabase
              .from("Todo")
              .update({
                order: update.order,
                ...(update.status && { status: update.status }),
              })
              .eq("id", update.id)
          }
        } catch (err: unknown) {
          console.error("Error bulk updating todos:", err)
          set({
            todos: previousTodos,
            error: err instanceof Error ? err.message : "An error occurred",
          })
        }
      },

      // Initialization and cleanup methods
      initializeTodos: async () => {
        console.log("Initializing todos...")

        // Prevent multiple simultaneous initializations
        if (get().loading) {
          console.log("Already initializing, skipping...")
          return
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("Error getting user:", userError)
          set({ loading: false, error: userError.message })
          return
        }

        // Clean up any existing subscription first
        get().cleanupSubscription()

        if (user) {
          console.log("User found, fetching todos for:", user.id)

          try {
            // Let fetchTodos handle its own loading state management
            await get().fetchTodos()

            // Only set up subscription if fetchTodos was successful
            const channel = supabase
              .channel(`todos-${user.id}`)
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "Todo",
                  filter: `userId=eq.${user.id}`,
                },
                (payload) => {
                  console.log("Real-time change:", payload)
                  // Handle specific events to avoid unnecessary refetches
                  const currentTodos = get().todos

                  if (payload.eventType === "INSERT" && payload.new) {
                    const newTodo = payload.new as Todo
                    // Only add if not already in store (avoid duplicates from optimistic updates)
                    if (!currentTodos.find((t) => t.id === newTodo.id)) {
                      set((state) => ({
                        todos: [...state.todos, newTodo].sort(
                          (a, b) => a.order - b.order
                        ),
                      }))
                    }
                  } else if (payload.eventType === "UPDATE" && payload.new) {
                    const updatedTodo = payload.new as Todo
                    set((state) => ({
                      todos: state.todos.map((t) =>
                        t.id === updatedTodo.id ? updatedTodo : t
                      ),
                    }))
                  } else if (payload.eventType === "DELETE" && payload.old) {
                    const deletedId = payload.old.id
                    set((state) => ({
                      todos: state.todos.filter((t) => t.id !== deletedId),
                    }))
                  }
                }
              )
              .subscribe((status) => {
                console.log("Subscription status:", status)
                if (status === "SUBSCRIBED") {
                  console.log("Successfully subscribed to todo changes")
                } else if (status === "CHANNEL_ERROR") {
                  console.error("Subscription error")
                  // Clean up and don't retry to avoid infinite loops
                  get().cleanupSubscription()
                }
              })

            set({ subscription: channel })
          } catch (error) {
            console.error("Error during initialization:", error)
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Initialization failed",
            })
          }
        } else {
          console.log("No user found, clearing todos")
          set({ todos: [], selectedTodos: [], loading: false })
        }
      },

      cleanupSubscription: () => {
        const { subscription } = get()
        if (subscription) {
          subscription.unsubscribe()
          set({ subscription: null })
        }
      },

      clearTodos: () => {
        get().cleanupSubscription()
        set({ todos: [], selectedTodos: [], error: null })
      },
    }),
    {
      name: "todo-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist UI preferences, not sensitive data or subscription objects
      partialize: (state) => ({
        selectedTodos: state.selectedTodos,
        // Exclude subscription and other non-serializable data
      }),
    }
  )
)
