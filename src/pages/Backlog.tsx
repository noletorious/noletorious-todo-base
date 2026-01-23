import { useState } from "react"
import { useTodoStore, type Todo } from "../store/todoStore"
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Trash2,
} from "lucide-react"
import { Reorder } from "framer-motion"
import TodoCard from "../components/todos/TodoCard"
import TodoForm from "../components/todos/TodoForm"
import TodoView from "../components/todos/TodoView"
import Modal from "../components/ui/Modal"
import { CompletionModal } from "../components/ui/CompletionModal"

export default function Backlog() {
  const {
    todos,
    selectedTodos,
    loading,
    selectTodo,
    unselectTodo,
    updateTodo,
    deleteTodo,
  } = useTodoStore()

  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [viewingTodo, setViewingTodo] = useState<Todo | null>(null)
  const [isBacklogCollapsed, setIsBacklogCollapsed] = useState(false)
  const [isDoneCollapsed, setIsDoneCollapsed] = useState(true)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [taskToComplete, setTaskToComplete] = useState<Todo | null>(null)

  // Sophisticated search: check title, label, description across all tasks including done ones
  const filteredTodos = todos.filter(
    (t) =>
      search === "" || // Show all if no search
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.label && t.label.toLowerCase().includes(search.toLowerCase())) ||
      (t.description &&
        t.description.toLowerCase().includes(search.toLowerCase()))
  )

  // Separate filtered todos by status for display
  const filteredBacklogTodos = filteredTodos.filter(
    (todo) => todo.status !== "DONE"
  )
  const filteredDoneTodos = filteredTodos.filter(
    (todo) => todo.status === "DONE"
  )

  // Show only non-done tasks in backlog view when no search
  const backlogTodos =
    search === ""
      ? todos.filter((todo) => todo.status !== "DONE")
      : filteredBacklogTodos

  const handleTodoSelect = (todo: Todo) => {
    if (selectedTodos.some((t) => t.id === todo.id)) {
      unselectTodo(todo.id)
    } else {
      selectTodo(todo.id)
    }
  }

  const handleUndoneTask = async (todo: Todo) => {
    if (
      !window.confirm(
        `Are you sure you want to mark "${todo.title}" as not done? This will move it back to your backlog.`
      )
    ) {
      return
    }

    // Move task back to backlog status
    await updateTodo(todo.id, {
      status: "BACKLOG",
      completed: false,
    })
  }

  const handleDeleteTask = async (todo: Todo) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${todo.title}"? This action cannot be undone.`
      )
    ) {
      return
    }

    await deleteTodo(todo.id)
  }

  const handleStatusChange = async (todo: Todo, newStatus: any) => {
    // If marking as done, trigger completion modal
    if (newStatus === "DONE") {
      setTaskToComplete(todo)
      setShowCompletionModal(true)
      return
    }

    const updates: Partial<Todo> = {
      status: newStatus,
    }

    await updateTodo(todo.id, updates)
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
  }

  const handleViewTodo = (todo: Todo) => {
    setViewingTodo(todo)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setEditingTodo(null)
  }

  const handleCloseViewModal = () => {
    setViewingTodo(null)
  }

  const handleCompleteTask = async (reason: string, description?: string) => {
    if (taskToComplete) {
      console.log("Task completed with reason:", reason)
      await updateTodo(taskToComplete.id, {
        status: "DONE",
        completed: true,
        ...(description && { description: description }),
      })
      setTaskToComplete(null)
      // Close edit modal if open
      setEditingTodo(null)
    }
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-6xl space-y-6 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text font-heading text-3xl font-bold text-transparent">
            My Project - Backlog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize and plan your tasks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {todos.filter((t) => t.status === "DONE").length} Done •{" "}
            {todos.length} Total
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="ml-2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search tasks, labels, descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-none bg-transparent outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Create New Task"
        size="lg"
      >
        <TodoForm
          onSubmit={handleCloseCreateModal}
          onCancel={handleCloseCreateModal}
          showHeader={false}
        />
      </Modal>

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
                    handleUndoneTask(editingTodo)
                  } else {
                    setTaskToComplete(editingTodo)
                    setShowCompletionModal(true)
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
                  // Allow undoing from backlog view
                  handleUndoneTask(viewingTodo)
                  handleCloseViewModal()
                },
                disabled: false,
              }
            : undefined
        }
      >
        {viewingTodo && <TodoView todo={viewingTodo} />}
      </Modal>

      <div className="space-y-6">
        {/* Backlog Tasks */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <button
            onClick={() => setIsBacklogCollapsed(!isBacklogCollapsed)}
            className={`flex w-full items-center justify-between border-b border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50 ${
              isBacklogCollapsed ? "rounded-xl" : "rounded-tl-xl rounded-tr-xl"
            }`}
          >
            <div className="flex items-center gap-2">
              <Square size={20} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground">
                {search ? "Search Results - Backlog" : "Backlog Tasks"}
              </h2>
              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                {search ? filteredBacklogTodos.length : backlogTodos.length}
              </span>
              {(search ? filteredBacklogTodos : backlogTodos).filter(
                (t) => t.status === "SELECTED"
              ).length > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {
                    (search ? filteredBacklogTodos : backlogTodos).filter(
                      (t) => t.status === "SELECTED"
                    ).length
                  }{" "}
                  Selected
                </span>
              )}
              {(search ? filteredBacklogTodos : backlogTodos).filter(
                (t) => t.status === "IN_PROGRESS"
              ).length > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                  {
                    (search ? filteredBacklogTodos : backlogTodos).filter(
                      (t) => t.status === "IN_PROGRESS"
                    ).length
                  }{" "}
                  In Progress
                </span>
              )}
            </div>
            {isBacklogCollapsed ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronUp size={20} />
            )}
          </button>

          {!isBacklogCollapsed && (
            <div className="p-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading tasks...
                </div>
              ) : (search ? filteredBacklogTodos : backlogTodos).length ===
                0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Square size={48} className="mx-auto mb-2 opacity-50" />
                  <p>
                    {search
                      ? "No tasks match your search"
                      : "No tasks in backlog"}
                  </p>
                  <p className="text-sm">
                    {search
                      ? "Try a different search term"
                      : "Create your first task to get started"}
                  </p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={search ? filteredBacklogTodos : backlogTodos}
                  onReorder={() => {}} // Placeholder for reorder logic
                  className="space-y-3"
                >
                  {(search ? filteredBacklogTodos : backlogTodos).map(
                    (todo) => (
                      <Reorder.Item key={todo.id} value={todo}>
                        <TodoCard
                          todo={todo}
                          onSelect={handleTodoSelect}
                          onEdit={handleEditTodo}
                          onViewOnly={handleViewTodo}
                          onStatusChange={handleStatusChange}
                          isSelected={selectedTodos.some(
                            (t) => t.id === todo.id
                          )}
                          showStatusDropdown={true}
                        />
                      </Reorder.Item>
                    )
                  )}
                </Reorder.Group>
              )}
            </div>
          )}
        </div>

        {/* Done Tasks */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <button
            onClick={() => setIsDoneCollapsed(!isDoneCollapsed)}
            className="flex w-full items-center justify-between border-b border-border bg-green-50 px-4 py-3 transition-colors hover:bg-green-100/50 dark:bg-green-950/20 dark:hover:bg-green-950/30"
          >
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-green-600" />
              <h2 className="font-semibold text-foreground">
                {search ? "Search Results - Done" : "Done Tasks"}
              </h2>
              <span className="rounded-full bg-green-600/20 px-2 py-1 text-xs text-green-600 dark:text-green-400">
                {search
                  ? filteredDoneTodos.length
                  : todos.filter((t) => t.status === "DONE").length}
              </span>
            </div>
            {isDoneCollapsed ? (
              <ChevronDown size={20} className="text-green-600" />
            ) : (
              <ChevronUp size={20} className="text-green-600" />
            )}
          </button>
          {!isDoneCollapsed && (
            <div className="p-4">
              {(search
                ? filteredDoneTodos
                : todos.filter((t) => t.status === "DONE")
              ).length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <CheckSquare size={48} className="mx-auto mb-2 opacity-50" />
                  <p>
                    {search
                      ? "No completed tasks match your search"
                      : "No completed tasks yet"}
                  </p>
                  <p className="text-sm">
                    {search
                      ? "Try a different search term"
                      : "Completed tasks will appear here"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(search
                    ? filteredDoneTodos
                    : todos.filter((t) => t.status === "DONE")
                  ).map((todo) => (
                    <div
                      key={todo.id}
                      className="group cursor-pointer rounded-lg border border-green-200/50 bg-green-50/50 p-3 transition-colors hover:bg-green-100/50 dark:border-green-800/50 dark:bg-green-950/10 dark:hover:bg-green-950/20"
                      onClick={() => handleViewTodo(todo)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-700 dark:text-green-400">
                              {todo.title}
                            </span>
                            {todo.label && (
                              <span className="rounded bg-green-600/20 px-2 py-1 text-xs text-green-600">
                                {todo.label}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-2 flex gap-1 opacity-0 transition-all duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUndoneTask(todo)
                            }}
                            className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 transition-colors hover:bg-yellow-200"
                            title="Mark as not done"
                          >
                            Undone
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(todo)
                            }}
                            className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-800 transition-colors hover:bg-red-200"
                            title="Delete forever"
                          >
                            <Trash2 size={10} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false)
          setTaskToComplete(null)
        }}
        onComplete={handleCompleteTask}
        taskTitle={taskToComplete?.title || ""}
      />
    </div>
  )
}
