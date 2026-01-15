import { useState } from "react";
import { useTodoStore, type Todo } from "../store/todoStore";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Play,
} from "lucide-react";
import { Reorder } from "framer-motion";
import TodoCard from "../components/todos/TodoCard";
import TodoForm from "../components/todos/TodoForm";
import Modal from "../components/ui/Modal";

export default function Backlog() {
  const {
    todos,
    selectedTodos,
    loading,
    selectTodo,
    unselectTodo,
    moveSelectedToKanban,
  } = useTodoStore();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isBacklogCollapsed, setIsBacklogCollapsed] = useState(false);
  const [isSelectedCollapsed, setIsSelectedCollapsed] = useState(false);

  // Filter backlog items
  const backlogTodos = todos.filter((t) => t.status === "BACKLOG");

  // Sophisticated search: check title, label, description
  const filteredTodos = backlogTodos.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.label && t.label.toLowerCase().includes(search.toLowerCase())) ||
      (t.description &&
        t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleTodoSelect = (todo: Todo) => {
    if (selectedTodos.some((t) => t.id === todo.id)) {
      unselectTodo(todo.id);
    } else {
      selectTodo(todo.id);
    }
  };

  const handleMoveToKanban = async () => {
    if (selectedTodos.length > 0) {
      await moveSelectedToKanban();
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCloseEditModal = () => {
    setEditingTodo(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Backlog
        </h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Tasks Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <button
              onClick={() => setIsSelectedCollapsed(!isSelectedCollapsed)}
              className="w-full px-4 py-3 bg-primary/10 border-b border-border flex items-center justify-between hover:bg-primary/15 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckSquare size={20} className="text-primary" />
                <h2 className="font-semibold text-foreground">
                  Selected Tasks
                </h2>
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                  {selectedTodos.length}
                </span>
              </div>
              {isSelectedCollapsed ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </button>

            {!isSelectedCollapsed && (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {selectedTodos.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No tasks selected. Select tasks from the backlog to start
                    planning your sprint.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {selectedTodos.map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                        >
                          <button
                            onClick={() => unselectTodo(todo.id)}
                            className="text-primary hover:text-primary/70"
                          >
                            <CheckSquare size={16} />
                          </button>
                          <span className="flex-1 text-sm font-medium">
                            {todo.title}
                          </span>
                          {todo.label && (
                            <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                              {todo.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleMoveToKanban}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Play size={16} />
                      Start Sprint ({selectedTodos.length} tasks)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Backlog Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <button
              onClick={() => setIsBacklogCollapsed(!isBacklogCollapsed)}
              className="w-full px-4 py-3 bg-card border-b border-border flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Square size={20} className="text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Backlog Tasks</h2>
                <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                  {filteredTodos.length}
                </span>
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
                          isSelected={selectedTodos.some(
                            (t) => t.id === todo.id
                          )}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
