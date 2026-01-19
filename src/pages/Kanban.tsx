import { useState } from "react";
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
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTodoStore, type Todo, type Status } from "../store/todoStore";
import { cn } from "../lib/utils";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import TodoCard from "../components/todos/TodoCard";
import TodoForm from "../components/todos/TodoForm";
import TodoView from "../components/todos/TodoView";
import Modal from "../components/ui/Modal";
import { CompletionModal } from "../components/ui/CompletionModal";

// --- Components ---

function SortableItem({
  todo,
  onEdit,
  onViewOnly,
  onStatusChange,
}: {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onViewOnly: (todo: Todo) => void;
  onStatusChange: (todo: Todo, status: Status) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: {
      type: "todo",
      todo,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("mb-3 group", isDragging && "opacity-50")}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 opacity-60 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-md touch-none"
        >
          <GripVertical size={16} className="text-muted-foreground" />
        </div>
        <div className="flex-1">
          <TodoCard
            todo={todo}
            onEdit={onEdit}
            onViewOnly={onViewOnly}
            onStatusChange={onStatusChange}
            isDragging={isDragging}
            disableClick={isDragging}
            showStatusDropdown={true}
          />
        </div>
      </div>
    </div>
  );
}

function Column({
  id,
  title,
  items,
  onEditTodo,
  onViewTodo,
  onClearDone,
  onStatusChange,
}: {
  id: Status;
  title: string;
  items: Todo[];
  onEditTodo: (todo: Todo) => void;
  onViewTodo: (todo: Todo) => void;
  onClearDone?: () => void;
  onStatusChange: (todo: Todo, status: Status) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id,
    },
  });

  // Calculate date range for Done column
  const getCompletionDateRange = () => {
    if (id !== "DONE" || items.length === 0) return null;

    const completedDates = items
      .filter((todo) => todo.completedAt)
      .map((todo) => new Date(todo.completedAt!))
      .sort((a, b) => a.getTime() - b.getTime());

    if (completedDates.length === 0) return null;

    const earliest = completedDates[0];
    const latest = completedDates[completedDates.length - 1];

    if (completedDates.length === 1) {
      return earliest.toLocaleDateString();
    } else {
      return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
    }
  };

  const dateRange = getCompletionDateRange();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-[300px] bg-muted/50 rounded-xl p-4 flex flex-col h-full border border-border/50 transition-colors",
        isOver && "bg-primary/10 border-primary/50",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-bold text-muted-foreground uppercase tracking-wider text-xs">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="bg-background text-xs font-bold px-2 py-1 rounded text-muted-foreground shadow-sm">
            {items.length}
          </span>
          {id === "DONE" && items.length > 0 && onClearDone && (
            <button
              onClick={onClearDone}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
              title="Clear all completed tasks"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>
      </div>
      {id === "DONE" && dateRange && (
        <div className="text-xs text-muted-foreground mb-2 text-right italic">
          {dateRange}
        </div>
      )}

      <SortableContext
        items={items.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto min-h-[100px]">
          {items.map((todo) => (
            <SortableItem
              key={todo.id}
              todo={todo}
              onEdit={onEditTodo}
              onViewOnly={onViewTodo}
              onStatusChange={onStatusChange}
            />
          ))}
          {items.length === 0 && (
            <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground/50">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// --- Main Page ---

export default function Kanban() {
  const { todos, updateTodo, deleteTodo, loading } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [viewingTodo, setViewingTodo] = useState<Todo | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns: { id: Status; title: string }[] = [
    { id: "SELECTED", title: "Selected" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "DONE", title: "Done" },
  ];

  // Filter items for board - show SELECTED, IN_PROGRESS, and DONE
  const boardTodos = todos.filter((t) => t.status !== "BACKLOG");

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
      const activeTodo = todos.find((t) => t.id === active.id);

      // Find if dropping in column or item
      let newStatus: Status | undefined;

      // Is 'over.id' one of our column IDs?
      if (columns.some((c) => c.id === over.id)) {
        newStatus = over.id as Status;
      } else {
        // It's likely an item in a column
        const overTodo = todos.find((t) => t.id === over.id);
        if (overTodo) newStatus = overTodo.status;
      }

      if (activeTodo && newStatus && activeTodo.status !== newStatus) {
        // Special handling for dragging to DONE - show completion modal
        if (newStatus === "DONE") {
          setTaskToComplete(activeTodo);
          setShowCompletionModal(true);
        } else {
          updateTodo(activeTodo.id, { status: newStatus });
        }
      }
    }

    setActiveId(null);
  };

  const activeTodo = activeId ? todos.find((t) => t.id === activeId) : null;

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleViewTodo = (todo: Todo) => {
    setViewingTodo(todo);
  };

  const handleCloseEditModal = () => {
    setEditingTodo(null);
  };

  const handleCloseViewModal = () => {
    setViewingTodo(null);
  };

  const handleStatusChange = (todo: Todo, newStatus: Status) => {
    // If marking as done, trigger completion modal
    if (newStatus === "DONE") {
      setTaskToComplete(todo);
      setShowCompletionModal(true);
      return;
    }

    // Handle other status changes directly
    updateTodo(todo.id, { status: newStatus });
  };

  const handleCompleteTask = async (reason: string, description?: string) => {
    if (taskToComplete) {
      // Complete with reason from modal (reason logged for debugging)
      console.log("Task completed with reason:", reason);
      await updateTodo(taskToComplete.id, {
        status: "DONE",
        completed: true,
        ...(description && { description: description }),
      });
      setTaskToComplete(null);
      // Close edit modal if open
      setEditingTodo(null);
    }
  };

  const handleClearDone = async () => {
    if (
      !window.confirm(
        "Clear all completed tasks from Kanban view? (Tasks will remain in Backlog Done section)",
      )
    ) {
      return;
    }

    const doneTasks = boardTodos.filter((todo) => todo.status === "DONE");

    // Move done tasks back to BACKLOG to clear them from Kanban while preserving them
    for (const task of doneTasks) {
      await updateTodo(task.id, { status: "BACKLOG" });
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">
          My Project - Kanban Board
        </h1>
        <p className="text-muted-foreground">
          Drag and drop tasks to manage your agile workflow.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-2">
          {columns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              items={boardTodos.filter((t) => t.status === col.id)}
              onEditTodo={handleEditTodo}
              onViewTodo={handleViewTodo}
              onStatusChange={handleStatusChange}
              onClearDone={col.id === "DONE" ? handleClearDone : undefined}
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

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTodo}
        onClose={handleCloseEditModal}
        title="Edit Task"
        size="lg"
        statusToggle={
          editingTodo
            ? {
                isDone: editingTodo.status === "DONE",
                onToggle: () => {
                  if (editingTodo.status === "DONE") {
                    updateTodo(editingTodo.id, {
                      status: "BACKLOG",
                      completed: false,
                    });
                  } else {
                    setTaskToComplete(editingTodo);
                    setShowCompletionModal(true);
                  }
                },
                disabled: false,
              }
            : undefined
        }
      >
        {editingTodo && (
          <TodoForm
            todo={editingTodo}
            isEditing
            onSubmit={handleCloseEditModal}
            onCancel={handleCloseEditModal}
            showHeader={false}
          />
        )}
      </Modal>

      {/* View-Only Modal */}
      <Modal
        isOpen={!!viewingTodo}
        onClose={handleCloseViewModal}
        title="Task Details"
        size="lg"
        statusToggle={
          viewingTodo && viewingTodo.status === "DONE"
            ? {
                isDone: true,
                onToggle: () => {
                  // Only allow undoing from backlog, so close modal
                  handleCloseViewModal();
                },
                disabled: true,
              }
            : undefined
        }
      >
        {viewingTodo && <TodoView todo={viewingTodo} />}
      </Modal>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setTaskToComplete(null);
        }}
        onComplete={handleCompleteTask}
        taskTitle={taskToComplete?.title || ""}
      />
    </div>
  );
}
