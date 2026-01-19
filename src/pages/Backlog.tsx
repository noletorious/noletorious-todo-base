import { useState } from "react";
import { useTodoStore, type Todo } from "../store/todoStore";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Trash2,
} from "lucide-react";
import { Reorder } from "framer-motion";
import TodoCard from "../components/todos/TodoCard";
import TodoForm from "../components/todos/TodoForm";
import TodoView from "../components/todos/TodoView";
import Modal from "../components/ui/Modal";
import { CompletionModal } from "../components/ui/CompletionModal";

export default function Backlog() {
  const {
    todos,
    selectedTodos,
    loading,
    selectTodo,
    unselectTodo,
    updateTodo,
    deleteTodo,
  } = useTodoStore();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [viewingTodo, setViewingTodo] = useState<Todo | null>(null);
  const [isBacklogCollapsed, setIsBacklogCollapsed] = useState(false);
  const [isDoneCollapsed, setIsDoneCollapsed] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Todo | null>(null);

  // Show only non-done tasks in backlog view
  const backlogTodos = todos.filter((todo) => todo.status !== "DONE");

  // Sophisticated search: check title, label, description
  const filteredTodos = backlogTodos.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.label && t.label.toLowerCase().includes(search.toLowerCase())) ||
      (t.description &&
        t.description.toLowerCase().includes(search.toLowerCase())),
  );

  const handleTodoSelect = (todo: Todo) => {
    if (selectedTodos.some((t) => t.id === todo.id)) {
      unselectTodo(todo.id);
    } else {
      selectTodo(todo.id);
    }
  };

  const handleUndoneTask = async (todo: Todo) => {
    if (
      !window.confirm(
        `Are you sure you want to mark "${todo.title}" as not done? This will move it back to your backlog.`,
      )
    ) {
      return;
    }

    // Move task back to backlog status
    await updateTodo(todo.id, {
      status: "BACKLOG",
      completed: false,
    });
  };

  const handleDeleteTask = async (todo: Todo) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${todo.title}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    await deleteTodo(todo.id);
  };

  const handleStatusChange = async (todo: Todo, newStatus: any) => {
    // If marking as done, trigger completion modal
    if (newStatus === "DONE") {
      setTaskToComplete(todo);
      setShowCompletionModal(true);
      return;
    }

    const updates: Partial<Todo> = {
      status: newStatus,
    };

    await updateTodo(todo.id, updates);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleViewTodo = (todo: Todo) => {
    setViewingTodo(todo);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCloseEditModal = () => {
    setEditingTodo(null);
  };

  const handleCloseViewModal = () => {
    setViewingTodo(null);
  };

  const handleCompleteTask = async (reason: string, description?: string) => {
    if (taskToComplete) {
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            My Project - Backlog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize and plan your tasks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">
            {filteredTodos.length} tasks • {selectedTodos.length} selected
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>
      </div>

      {/* Search bar */}
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
                    handleUndoneTask(editingTodo);
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
                  // Allow undoing from backlog view
                  handleUndoneTask(viewingTodo);
                  handleCloseViewModal();
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
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <button
            onClick={() => setIsBacklogCollapsed(!isBacklogCollapsed)}
            className="w-full px-4 py-3 bg-card border-b border-border flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Square size={20} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Backlog Tasks</h2>
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                {filteredTodos.length} total
              </span>
              {filteredTodos.filter((t) => t.status === "SELECTED").length >
                0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {filteredTodos.filter((t) => t.status === "SELECTED").length}{" "}
                  Selected
                </span>
              )}
              {filteredTodos.filter((t) => t.status === "IN_PROGRESS").length >
                0 && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {
                    filteredTodos.filter((t) => t.status === "IN_PROGRESS")
                      .length
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
                <div className="text-center py-8 text-muted-foreground">
                  Loading tasks...
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Square size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No tasks in backlog</p>
                  <p className="text-sm">
                    Create your first task to get started
                  </p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={filteredTodos}
                  onReorder={() => {}} // Placeholder for reorder logic
                  className="space-y-3"
                >
                  {filteredTodos.map((todo) => (
                    <Reorder.Item key={todo.id} value={todo}>
                      <TodoCard
                        todo={todo}
                        onSelect={handleTodoSelect}
                        onEdit={handleEditTodo}
                        onViewOnly={handleViewTodo}
                        onStatusChange={handleStatusChange}
                        isSelected={selectedTodos.some((t) => t.id === todo.id)}
                        showStatusDropdown={true}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          )}
        </div>

        {/* Done Tasks */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <button
            onClick={() => setIsDoneCollapsed(!isDoneCollapsed)}
            className="w-full px-4 py-3 bg-green-50 dark:bg-green-950/20 border-b border-border flex items-center justify-between hover:bg-green-100/50 dark:hover:bg-green-950/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-green-600" />
              <h2 className="font-semibold text-foreground">Done Tasks</h2>
              <span className="bg-green-600/20 text-green-600 px-2 py-1 rounded-full text-xs">
                {todos.filter((t) => t.status === "DONE").length}
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
              {todos.filter((t) => t.status === "DONE").length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckSquare size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No completed tasks yet</p>
                  <p className="text-sm">Completed tasks will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todos
                    .filter((t) => t.status === "DONE")
                    .map((todo) => (
                      <div
                        key={todo.id}
                        className="group p-3 bg-green-50/50 dark:bg-green-950/10 rounded-lg border border-green-200/50 dark:border-green-800/50 hover:bg-green-100/50 dark:hover:bg-green-950/20 transition-colors cursor-pointer"
                        onClick={() => handleViewTodo(todo)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-green-700 dark:text-green-400">
                                {todo.title}
                              </span>
                              {todo.label && (
                                <span className="bg-green-600/20 text-green-600 px-2 py-1 rounded text-xs">
                                  {todo.label}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ml-2 transition-all duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndoneTask(todo);
                              }}
                              className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-xs transition-colors"
                              title="Mark as not done"
                            >
                              Undone
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(todo);
                              }}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs transition-colors flex items-center gap-1"
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
          setShowCompletionModal(false);
          setTaskToComplete(null);
        }}
        onComplete={handleCompleteTask}
        taskTitle={taskToComplete?.title || ""}
      />
    </div>
  );
}
