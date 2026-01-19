import { useState } from "react";
import { CheckSquare, X } from "lucide-react";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reason: string, description?: string) => void;
  taskTitle: string;
}

const completionReasons = [
  { value: "Done", label: "Done", description: "Task completed successfully" },
  {
    value: "Won't do",
    label: "Won't do",
    description: "Decided not to pursue this task",
  },
  {
    value: "Can't do",
    label: "Can't do",
    description: "Unable to complete due to constraints",
  },
  {
    value: "Duplicate",
    label: "Duplicate",
    description: "This task is a duplicate of another",
  },
  {
    value: "Invalid",
    label: "Invalid",
    description: "Task is no longer relevant or valid",
  },
];

export function CompletionModal({
  isOpen,
  onClose,
  onComplete,
  taskTitle,
}: CompletionModalProps) {
  const [selectedReason, setSelectedReason] = useState("Done");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleComplete = () => {
    onComplete(selectedReason, description.trim() || undefined);
    onClose();
    setDescription(""); // Reset for next time
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold">Complete Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Task:</p>
          <p className="font-medium">{taskTitle}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-3">
            How was this task completed?
          </p>
          <div className="space-y-2">
            {completionReasons.map((reason) => (
              <label
                key={reason.value}
                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="completion-reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{reason.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {reason.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Optional Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any notes about how this task was completed..."
            className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete Task
          </button>
        </div>
      </div>
    </div>
  );
}
