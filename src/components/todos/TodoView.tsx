import { Tag, Calendar, Clock, Flag, User } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Todo } from "../../store/todoStore";

interface TodoViewProps {
  todo: Todo;
}

export default function TodoView({ todo }: TodoViewProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "LOW":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "text-green-700 bg-green-100";
      case "IN_PROGRESS":
        return "text-blue-700 bg-blue-100";
      case "SELECTED":
        return "text-purple-700 bg-purple-100";
      case "BACKLOG":
        return "text-gray-700 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Title */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {todo.title}
        </h3>
        {todo.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {todo.description}
          </p>
        )}
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <User size={14} />
            <span className="font-medium">Status</span>
          </div>
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              getStatusColor(todo.status),
            )}
          >
            {todo.status.replace("_", " ")}
          </span>
        </div>

        {/* Priority */}
        {todo.priority && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Flag size={14} />
              <span className="font-medium">Priority</span>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                getPriorityColor(todo.priority),
              )}
            >
              {todo.priority}
            </span>
          </div>
        )}

        {/* Label/Tag */}
        {todo.label && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Tag size={14} />
              <span className="font-medium">Label</span>
            </div>
            <span className="text-foreground">{todo.label}</span>
          </div>
        )}

        {/* Due Date */}
        {todo.dueDate && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar size={14} />
              <span className="font-medium">Due Date</span>
            </div>
            <span className="text-foreground">{formatDate(todo.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          {todo.createdAt && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Created</span>
              </div>
              <div>{formatDate(todo.createdAt)}</div>
            </div>
          )}
          {todo.updatedAt && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Updated</span>
              </div>
              <div>{formatDate(todo.updatedAt)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Completion Details */}
      {todo.status === "DONE" && todo.completionReason && (
        <div className="pt-2 space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span className="font-medium">Completion Reason</span>
          </div>
          <div className="text-sm text-foreground">{todo.completionReason}</div>
        </div>
      )}
    </div>
  );
}
