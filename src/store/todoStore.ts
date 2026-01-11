import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Status = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: Status;
  label?: string;
  dueDate?: string; // ISO Status
  order: number;
}

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Partial<Todo>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  setTodos: (todos: Todo[]) => void;
}

const initialTodos: Todo[] = [
  {
    id: uuidv4(),
    title: 'Research Competitors',
    description: 'Analyze main agile tools in market',
    status: 'BACKLOG',
    label: 'Research',
    order: 0,
  },
  {
    id: uuidv4(),
    title: 'Design System',
    description: 'Create color palette and typography',
    status: 'TODO',
    label: 'Design',
    order: 0,
  },
  {
    id: uuidv4(),
    title: 'Implement Auth',
    description: 'Setup Supabase and Zustand',
    status: 'IN_PROGRESS',
    label: 'Dev',
    order: 0,
  },
  {
    id: uuidv4(),
    title: 'High Priority Task',
    description: 'This is the most important task',
    status: 'IN_PROGRESS',
    label: 'Urgent',
    order: 1,
  },
];

export const useTodoStore = create<TodoState>((set) => ({
  todos: initialTodos,
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, {
      id: uuidv4(),
      title: todo.title || 'New Task',
      status: todo.status || 'BACKLOG',
      order: state.todos.length,
      ...todo
    } as Todo]
  })),
  updateTodo: (id, updates) => set((state) => ({
    todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t))
  })),
  deleteTodo: (id) => set((state) => ({
    todos: state.todos.filter((t) => t.id !== id)
  })),
  setTodos: (todos) => set({ todos }),
}));
