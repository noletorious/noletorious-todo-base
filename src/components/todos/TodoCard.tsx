import { useState } from "react";
import {
  Tag,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useTodoStore, type Todo } from "../../store/todoStore";
import { cn } from "../../lib/utils";
import { CompletionModal } from "../ui/CompletionModal";

interface TodoCardProps {
  todo: Todo;
  className?: string;
  onEdit?: (todo: Todo) => void;
  onSelect?: (todo: Todo) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  disableClick?: boolean;
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
};

const statusColors = {
  BACKLOG: "bg-gray-100 text-gray-800",
  TODO: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
};

export default function TodoCard({
  todo,
  className,
  onEdit,
  onSelect,
  isSelected = false,
  isDragging = false,
  disableClick = false,
}: TodoCardProps) {
  const { updateTodo } = useTodoStore();
  const [imageError, setImageError] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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

    // If onSelect is provided (backlog mode), handle selection
    if (onSelect) {
      onSelect(todo);
    } else if (onEdit) {
      onEdit(todo);
    }
  };

  const handleComplete = async (reason?: string, description?: string) => {
    if (reason) {
      // Complete with reason from modal
      await updateTodo(todo.id, {
        completed: true,
        status: "DONE",
        completionReason: reason,
        ...(description && { description: description }),
      });
    } else {
      // Toggle completion (for direct click)
      await updateTodo(todo.id, {
        completed: !todo.completed,
        status: todo.completed ? todo.status : "DONE",
      });
    }
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
          <h3 className="font-medium text-foreground text-sm line-clamp-2 flex-1">
            {todo.title}
          </h3>
        </div>
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

      {/* Tags and metadata */}
      <div className="space-y-2">
        {/* Status and Priority */}
        <div className="flex flex-wrap gap-2">
          {todo.status && (
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                statusColors[todo.status]
              )}
            >
              {todo.status.replace("_", " ")}
            </span>
          )}

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

          {todo.label && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
              <Tag className="inline w-3 h-3 mr-1" />
              {todo.label}
            </span>
          )}
        </div>

        {/* Due date */}
        {todo.dueDate && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue && "text-red-600",
              isDueSoon && "text-yellow-600",
              !isOverdue && !isDueSoon && "text-muted-foreground"
            )}
          >
            <Clock size={12} />
            <span>
              Due {new Date(todo.dueDate).toLocaleDateString()}
              {isOverdue && " (Overdue)"}
              {isDueSoon && " (Due Soon)"}
            </span>
          </div>
        )}

        {/* Image indicator */}
        {todo.imageUrl && imageError && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon size={12} />
            <span>Image unavailable</span>
          </div>
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
