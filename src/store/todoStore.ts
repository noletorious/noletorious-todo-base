import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export type Status = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: Status;
  label?: string;
  dueDate?: string; // ISO Status
  order: number;
  completed?: boolean;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  setTodos: (todos: Todo[]) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('Todo')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      
      // Map Supabase data to our Todo Type (handling any discrepancies if needed)
      set({ todos: data as Todo[] });
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addTodo: async (todo) => {
    // 1. Optimistic Update
    const tempId = uuidv4();
    const newTodo: Todo = {
      id: tempId,
      title: todo.title || 'New Task',
      status: todo.status || 'BACKLOG',
      label: todo.label,
      description: todo.description,
      order: get().todos.length,
      completed: false,
      ...todo,
    } as Todo;

    set((state) => ({ todos: [...state.todos, newTodo] }));

    try {
      // 2. Call API
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      // We need to exclude 'id' if we want the DB to generate it, OR we generate it.
      // But we passed tempId. If we want DB to authorize, we need to send userId.
      const taskPayload = {
        ...newTodo,
        id: undefined, // Let DB generate ID? relying on @default(uuid())
        userId: user.id
      };
      // actually if we want to use the tempId, we can. But usually client-side IDs are risky if not careful.
      // Let's rely on DB generation for safety, meaning we must swap the ID back.

      const { data, error } = await supabase
        .from('Todo')
        .insert([taskPayload])
        .select()
        .single();
        
      if (error) throw error;

      // 3. Replace temp todo with real one
      set((state) => ({
          todos: state.todos.map(t => t.id === tempId ? (data as Todo) : t)
      }));

    } catch (err: any) {
      console.error('Error adding todo:', err);
      // Revert optimistic update
      set((state) => ({ todos: state.todos.filter(t => t.id !== tempId) }));
      set({ error: err.message });
    }
  },

  updateTodo: async (id, updates) => {
    // 1. Optimistic Update
    const previousTodos = get().todos;
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }));

    try {
        // 2. Call API
        const { error } = await supabase
            .from('Todo')
            .update(updates)
            .eq('id', id);
            
        if (error) throw error;
    } catch (err: any) {
        console.error('Error updating todo:', err);
        // Revert
        set({ todos: previousTodos, error: err.message });
    }
  },

  deleteTodo: async (id) => {
      // 1. Optimistic Update
      const previousTodos = get().todos;
      set((state) => ({
          todos: state.todos.filter((t) => t.id !== id)
      }));

      try {
          const { error } = await supabase
            .from('Todo')
            .delete()
            .eq('id', id);

          if (error) throw error;
      } catch (err: any) {
          console.error('Error deleting todo:', err);
          set({ todos: previousTodos, error: err.message });
      }
  },

  setTodos: (todos) => set({ todos }),
}));
