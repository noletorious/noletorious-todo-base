import React, { useState } from "react"
import {
  Calendar,
  Tag,
  Image,
  FileText,
  AlertCircle,
  X,
  Save,
  Loader2,
} from "lucide-react"
import {
  useTodoStore,
  type Todo,
  type Status,
  type Priority,
} from "../../store/todoStore"
import { cn } from "../../lib/utils"

interface TodoFormProps {
  todo?: Partial<Todo>
  onSubmit?: () => void
  onCancel?: () => void
  isEditing?: boolean
  showHeader?: boolean
  className?: string
  onStatusToggle?: (isDone: boolean) => void
}

const statusOptions: { value: Status; label: string; color: string }[] = [
  { value: "BACKLOG", label: "Backlog", color: "bg-gray-500" },
  { value: "SELECTED", label: "Selected", color: "bg-blue-500" },
  { value: "IN_PROGRESS", label: "In progress", color: "bg-yellow-500" },
]

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "High", color: "bg-red-100 text-red-800" },
]

const labelOptions = [
  "Bug",
  "Feature",
  "Enhancement",
  "Documentation",
  "Testing",
  "Design",
  "Research",
]

export default function TodoForm({
  todo = {},
  onSubmit,
  onCancel,
  isEditing = false,
  showHeader = true,
  className,
}: TodoFormProps) {
  const { addTodo, updateTodo } = useTodoStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: todo.title || "",
    description: todo.description || "",
    status: todo.status || ("BACKLOG" as Status),
    label: todo.label || "",
    priority: todo.priority || ("MEDIUM" as Priority),
    dueDate: todo.dueDate ? todo.dueDate.split("T")[0] : "", // Convert to YYYY-MM-DD format
    imageUrl: todo.imageUrl || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      const todoData = {
        ...formData,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : undefined,
        order: todo.order || Date.now(),
      }

      if (isEditing && todo.id) {
        await updateTodo(todo.id, todoData)
      } else {
        await addTodo(todoData)
      }

      onSubmit?.()
    } catch (error) {
      console.error("Error saving todo:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      title: todo.title || "",
      description: todo.description || "",
      status: todo.status || "BACKLOG",
      label: todo.label || "",
      priority: todo.priority || "MEDIUM",
      dueDate: todo.dueDate ? todo.dueDate.split("T")[0] : "",
      imageUrl: todo.imageUrl || "",
    })
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4 p-6", className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h3>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      {/* Timestamps - only show when editing existing todo */}
      {isEditing && todo && (
        <div className="border-b border-border pb-4">
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            {todo.createdAt && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Created</span>
                </div>
                <div>
                  {new Date(todo.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
            {todo.updatedAt && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Updated</span>
                </div>
                <div>
                  {new Date(todo.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Task Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          <FileText className="mr-1 inline h-4 w-4" />
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe the task..."
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as Status })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            <AlertCircle className="mr-1 inline h-4 w-4" />
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as Priority })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Label & Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="label"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            <Tag className="mr-1 inline h-4 w-4" />
            Label
          </label>
          <input
            id="label"
            type="text"
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            placeholder="e.g., Bug, Feature"
            list="labelSuggestions"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <datalist id="labelSuggestions">
            {labelOptions.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            <Calendar className="mr-1 inline h-4 w-4" />
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label
          htmlFor="imageUrl"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          <Image className="mr-1 inline h-4 w-4" />
          Image URL (Optional)
        </label>
        <input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-border pt-4">
        <button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditing ? "Update Task" : "Create Task"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-border px-6 py-2 text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
