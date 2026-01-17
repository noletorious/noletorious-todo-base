import { useState } from "react";
import {
  Tag,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useTodoStore, type Todo, type Status } from "../../store/todoStore";
import { cn } from "../../lib/utils";
import { CompletionModal } from "../ui/CompletionModal";

interface TodoCardProps {
  todo: Todo;
  className?: string;
  onEdit?: (todo: Todo) => void;
  onSelect?: (todo: Todo) => void;
  onStatusChange?: (todo: Todo, status: Status) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  disableClick?: boolean;
  showStatusDropdown?: boolean;
}

const statusColors = {
  BACKLOG: "bg-gray-100 text-gray-800",
  SELECTED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
};

const priorityColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
};

export default function TodoCard({
  todo,
  className,
  onEdit,
  onSelect,
  onStatusChange,
  isSelected = false,
  isDragging = false,
  disableClick = false,
  showStatusDropdown = false,
}: TodoCardProps) {
  const { updateTodo } = useTodoStore();
  const [imageError, setImageError] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const statusOptions = [
    { value: "BACKLOG", label: "Backlog", color: "bg-gray-100 text-gray-800" },
    {
      value: "SELECTED",
      label: "Selected",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "DONE", label: "Done", color: "bg-green-100 text-green-800" },
  ];

  const handleStatusChange = async (newStatus: Status) => {
    if (onStatusChange) {
      onStatusChange(todo, newStatus);
    } else {
      await updateTodo(todo.id, { status: newStatus });
    }
    setShowStatusMenu(false);
  };

  const now = new Date();
  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < now && todo.status !== "DONE";
  const isDueSoon =
    todo.dueDate &&
    new Date(todo.dueDate) > now &&
    new Date(todo.dueDate) <= new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't handle click if disabled, dragging, or if clicking on a button/interactive element
    if (disableClick || isDragging) return;

    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.closest("button")) return;

    // Always open edit modal when clicking on a task
    if (onEdit) {
      onEdit(todo);
    }
  };

  const handleComplete = async (reason: string, description?: string) => {
    // Complete with reason from modal (reason logged for debugging)
    console.log("Task completed with reason:", reason);
    await updateTodo(todo.id, {
      completed: true,
      status: "DONE",
      ...(description && { description: description }),
    });
    setShowCompletionModal(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group",
        !disableClick && "cursor-pointer",
        isDragging && "opacity-50 transform rotate-2",
        isSelected && "ring-2 ring-primary ring-opacity-50",
        className
      )}
    >
      {/* Header with title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {showStatusDropdown && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(!showStatusMenu);
                }}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity",
                  isSelected
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                    : statusColors[todo.status]
                )}
              >
                {isSelected
                  ? "Selected"
                  : todo.status
                      .replace("IN_PROGRESS", "In Progress")
                      .replace("_", " ")}
                <ChevronDown size={12} />
              </button>

              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(option.value as Status);
                      }}
                      className="w-full px-3 py-2 hover:bg-muted text-left text-sm flex items-center gap-2"
                    >
                      <span
                        className={cn("w-2 h-2 rounded-full", option.color)}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3 className="font-medium text-foreground text-sm line-clamp-2 flex-1">
            {todo.title}
          </h3>
        </div>

        {/* Right-aligned label */}
        {todo.label && (
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 ml-2">
            <Tag className="inline w-3 h-3 mr-1" />
            {todo.label}
          </span>
        )}
      </div>

      {/* Description */}
      {todo.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {todo.description}
        </p>
      )}

      {/* Image */}
      {todo.imageUrl && !imageError && (
        <div className="mb-3">
          <img
            src={todo.imageUrl}
            alt="Task attachment"
            onError={() => setImageError(true)}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Tags and metadata - right-aligned horizontal layout */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        {/* Image indicator */}
        {todo.imageUrl && imageError && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon size={12} />
            Image unavailable
          </span>
        )}

        {/* Due date */}
        {todo.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue && "text-red-600",
              isDueSoon && "text-yellow-600",
              !isOverdue && !isDueSoon && "text-muted-foreground"
            )}
          >
            <Clock size={12} />
            Due {new Date(todo.dueDate).toLocaleDateString()}
            {isOverdue && " (Overdue)"}
            {isDueSoon && " (Due Soon)"}
          </span>
        )}

        {/* Priority */}
        {todo.priority && (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border",
              priorityColors[todo.priority]
            )}
          >
            <AlertCircle className="inline w-3 h-3 mr-1" />
            {todo.priority}
          </span>
        )}
      </div>

      {/* Quick external link if imageUrl looks like a URL */}
      {todo.imageUrl && !imageError && todo.imageUrl.startsWith("http") && (
        <div className="mt-2 pt-2 border-t border-border">
          <a
            href={todo.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink size={12} />
            View attachment
          </a>
        </div>
      )}

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={handleComplete}
        taskTitle={todo.title}
      />
    </div>
  );
}
