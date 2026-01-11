import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  type DragStartEvent, 
  type DragOverEvent, 
  type DragEndEvent,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTodoStore, type Todo, type Status } from '../store/todoStore';
import { cn } from '../lib/utils';
import { GripVertical } from 'lucide-react';

// --- Components ---

function SortableItem({ todo }: { todo: Todo }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.id, data: { todo } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners}
        className={cn(
            "bg-card p-4 rounded-xl shadow-sm border border-border mb-3 group hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
            isDragging && "opacity-50"
        )}
    >
        <div className="flex justify-between items-start mb-2">
            <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                todo.label === 'Bug' ? "bg-red-100 text-red-600" :
                todo.label === 'Feature' ? "bg-blue-100 text-blue-600" :
                "bg-secondary/10 text-secondary"
            )}>
                {todo.label || 'Task'}
            </span>
            <GripVertical size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors" />
        </div>
        <h4 className="font-medium text-sm leading-tight text-card-foreground">{todo.title}</h4>
    </div>
  );
}

function Column({ id, title, items }: { id: Status; title: string; items: Todo[] }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex-1 min-w-[300px] bg-muted/50 rounded-xl p-4 flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-muted-foreground uppercase tracking-wider text-xs">{title}</h3>
                <span className="bg-background text-xs font-bold px-2 py-1 rounded text-muted-foreground shadow-sm">{items.length}</span>
            </div>
            
            <SortableContext items={items.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto min-h-[100px]">
                    {items.map(todo => (
                        <SortableItem key={todo.id} todo={todo} />
                    ))}
                    {items.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground/50">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}

// --- Main Page ---

export default function Kanban() {
  const { todos, updateTodo } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns: { id: Status, title: string }[] = [
      { id: 'TODO', title: 'Selected' },
      { id: 'IN_PROGRESS', title: 'In Progress' },
      { id: 'DONE', title: 'Done' }
  ];

  // Filter items for board
  const boardTodos = todos.filter(t => t.status !== 'BACKLOG');

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
      // Basic implementation for moving between columns visual
      const { over } = event; // removed 'active'
      if (!over) return;
      
      // We rely on handleDragEnd for the state update primarily in this simple version
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
        const activeTodo = todos.find(t => t.id === active.id);
        
        // Find if dropping in column or item
        let newStatus: Status | undefined;
        
        // Is 'over.id' one of our column IDs?
        if (columns.some(c => c.id === over.id)) {
            newStatus = over.id as Status;
        } else {
            // It's likely an item in a column
            const overTodo = todos.find(t => t.id === over.id);
            if (overTodo) newStatus = overTodo.status;
        }
        
        if (activeTodo && newStatus && activeTodo.status !== newStatus) {
            updateTodo(activeTodo.id, { status: newStatus });
        }
    }
    
    setActiveId(null);
  };

  const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
        <div className="mb-6">
            <h1 className="text-3xl font-heading font-bold">Kanban Board</h1>
            <p className="text-muted-foreground">Drag and drop tasks to manage your agile workflow.</p>
        </div>

        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragStart={handleDragStart} 
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-full overflow-x-auto pb-2">
                {columns.map(col => (
                    <Column 
                        key={col.id} 
                        id={col.id} 
                        title={col.title} 
                        items={boardTodos.filter(t => t.status === col.id)} 
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTodo ? (
                    <div className="bg-card p-4 rounded-xl shadow-2xl border-2 border-primary rotate-3 cursor-grabbing opacity-90 w-[300px]">
                        <h4 className="font-medium text-sm">{activeTodo.title}</h4>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    </div>
  );
}
