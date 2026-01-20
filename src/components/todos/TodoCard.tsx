import { useState } from "react"
import {
  Tag,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  GripVertical,
} from "lucide-react"
import { useTodoStore, type Todo, type Status } from "../../store/todoStore"
import { cn } from "../../lib/utils"
import { CompletionModal } from "../ui/CompletionModal"

interface TodoCardProps {
  todo: Todo
  className?: string
  onEdit?: (todo: Todo) => void
  onViewOnly?: (todo: Todo) => void
  onSelect?: (todo: Todo) => void
  onStatusChange?: (todo: Todo, status: Status) => void
  isSelected?: boolean
  isDragging?: boolean
  disableClick?: boolean
  showStatusDropdown?: boolean
  dragAttributes?: React.HTMLAttributes<HTMLElement>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragListeners?: any
  showDragHandle?: boolean
}

const statusColors = {
  BACKLOG: "bg-gray-100 text-gray-800",
  SELECTED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
}

export default function TodoCard({
  todo,
  className,
  onEdit,
  onViewOnly,
  onSelect,
  onStatusChange,
  isSelected = false,
  isDragging = false,
  disableClick = false,
  showStatusDropdown = false,
  dragAttributes,
  dragListeners,
  showDragHandle = false,
}: TodoCardProps) {
  const { updateTodo } = useTodoStore()
  const [imageError, setImageError] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  const statusOptions = [
    { value: "BACKLOG", label: "Backlog", color: "bg-gray-100 text-gray-800" },
    {
      value: "SELECTED",
      label: "Selected",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "IN_PROGRESS",
      label: "In progress",
      color: "bg-yellow-100 text-yellow-800",
    },
  ]

  const handleStatusChange = async (newStatus: Status) => {
    // If marking as done, show completion modal instead of direct update
    if (newStatus === "DONE") {
      setShowCompletionModal(true)
      setShowStatusMenu(false)
      return
    }

    if (onStatusChange) {
      onStatusChange(todo, newStatus)
    } else {
      await updateTodo(todo.id, { status: newStatus })
    }
    setShowStatusMenu(false)
  }

  const now = new Date()
  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < now && todo.status !== "DONE"
  const isDueSoon =
    todo.dueDate &&
    new Date(todo.dueDate) > now &&
    new Date(todo.dueDate) <= new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't handle click if disabled, dragging, or if clicking on a button/interactive element
    if (disableClick || isDragging) return

    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.tagName === "BUTTON" || target.closest("button")) return

    // Check for modifier keys to handle selection vs editing
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      // Multi-select mode - call onSelect if available
      if (onSelect) {
        onSelect(todo)
      }
    } else {
      // Normal click - open appropriate modal based on task status
      if (todo.status === "DONE" && onViewOnly) {
        onViewOnly(todo)
      } else if (onEdit) {
        onEdit(todo)
      }
    }
  }

  const handleComplete = async (reason: string, description?: string) => {
    // Complete with reason from modal (reason logged for debugging)
    console.log("Task completed with reason:", reason)
    await updateTodo(todo.id, {
      completed: true,
      status: "DONE",
      completedAt: new Date().toISOString(),
      completionReason: reason,
      ...(description && { description: description }),
    })
    setShowCompletionModal(false)
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        !disableClick && "cursor-pointer",
        isDragging && "rotate-2 transform opacity-50",
        isSelected && "ring-2 ring-primary ring-opacity-50",
        className
      )}
    >
      {/* Header with title and inline tags */}
      <div className="mb-1 flex items-start justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Drag Handle */}
          {showDragHandle && (
            <div
              {...dragAttributes}
              {...dragListeners}
              className="flex-shrink-0 cursor-grab touch-none rounded-md p-1 opacity-60 transition-opacity hover:bg-muted/50 active:cursor-grabbing group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} className="text-muted-foreground" />
            </div>
          )}
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-foreground">
            {todo.title}
          </h3>

          {/* Label */}
          {todo.label && (
            <span className="flex-shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <Tag className="mr-1 inline h-3 w-3" />
              {todo.label}
            </span>
          )}

          {/* Priority */}
          {todo.priority && (
            <span
              className={cn(
                "flex-shrink-0 rounded-full border px-2 py-1 text-xs font-medium",
                priorityColors[todo.priority]
              )}
            >
              <AlertCircle className="mr-1 inline h-3 w-3" />
              {todo.priority
                .replace("HIGH", "High")
                .replace("MEDIUM", "Medium")
                .replace("LOW", "Low")}
            </span>
          )}
        </div>

        {/* Status dropdown on the right */}
        {showStatusDropdown && (
          <div className="relative ml-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowStatusMenu(!showStatusMenu)
              }}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80",
                statusColors[todo.status]
              )}
            >
              {todo.status
                .replace("IN_PROGRESS", "In progress")
                .replace("BACKLOG", "Backlog")
                .replace("SELECTED", "Selected")
                .replace("DONE", "Done")
                .replace("_", " ")}
              <ChevronDown size={12} />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] rounded-lg border border-border bg-card py-1 shadow-lg">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange(option.value as Status)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", option.color)}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {todo.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
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
            className="h-32 w-full rounded-lg object-cover"
          />
        </div>
      )}

      {/* Tags and metadata - right-aligned horizontal layout */}
      <div className="flex flex-wrap items-center justify-end gap-2">
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
      </div>

      {/* Quick external link if imageUrl looks like a URL */}
      {todo.imageUrl && !imageError && todo.imageUrl.startsWith("http") && (
        <div className="mt-2 border-t border-border pt-2">
          <a
            href={todo.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
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
  )
}
