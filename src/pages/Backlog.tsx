import { useState } from 'react';
import { useTodoStore, type Todo } from '../store/todoStore';
import { Search, Plus, Calendar, Tag, ArrowRight, MoreVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';

export default function Backlog() {
  const { todos, addTodo, updateTodo } = useTodoStore();
  const [search, setSearch] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // We filter locally but for reordering to work properly with global store it's tricky.
  // For this starter, we'll just show the Backlog items.
  const backlogTodos = todos.filter(t => t.status === 'BACKLOG');
  
  // Sophisticated search: check title, label, description
  const filteredTodos = backlogTodos.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.label?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    addTodo({ title: newTodoTitle, status: 'BACKLOG', order: Date.now() });
    setNewTodoTitle('');
  };

  const handleReorder = (_newOrder: Todo[]) => {
      // Placeholder for reorder logic
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Backlog
        </h1>
        <span className="text-muted-foreground text-sm">{filteredTodos.length} tasks</span>
      </div>

      <div className="flex gap-4 items-center bg-card p-2 rounded-xl shadow-sm border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="text-muted-foreground ml-2" size={20} />
        <input 
            type="text" 
            placeholder="Search tasks, labels, descriptions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
            type="text" 
            placeholder="Add a new task..." 
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="flex-1 p-4 rounded-xl border border-border bg-card shadow-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="bg-primary text-primary-foreground px-6 rounded-xl font-bold hover:opacity-90 transition-opacity">
            <Plus size={24} />
        </button>
      </form>

      <div className="space-y-2">
        <Reorder.Group axis="y" values={filteredTodos} onReorder={handleReorder}>
            {filteredTodos.map((todo) => (
                <Reorder.Item key={todo.id} value={todo}>
                    <div className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                        <div className="text-muted-foreground hover:text-foreground cursor-grab">
                            <MoreVertical size={16} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{todo.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                {todo.label && (
                                    <span className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs font-medium">
                                        <Tag size={12} /> {todo.label}
                                    </span>
                                )}
                                {todo.description && (
                                    <span className="truncate max-w-[200px]">{todo.description}</span>
                                )}
                                {todo.dueDate && (
                                     <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(todo.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => updateTodo(todo.id, { status: 'TODO' })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                        >
                            Select <ArrowRight size={16} />
                        </button>
                    </div>
                </Reorder.Item>
            ))}
        </Reorder.Group>
        
        {filteredTodos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                <p>No tasks found in backlog. Create one!</p>
            </div>
        )}
      </div>
    </div>
  );
}
