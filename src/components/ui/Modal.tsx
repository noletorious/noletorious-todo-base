import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  statusToggle?: {
    isDone: boolean
    onToggle: () => void
    disabled?: boolean
  }
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
  statusToggle,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus the modal when it opens
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    } else {
      // Return focus to the previously focused element when modal closes
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Handle focus trapping
  useEffect(() => {
    if (!isOpen) return

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return

      const modal = modalRef.current
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          event.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [isOpen])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showStatusDropdown &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showStatusDropdown])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          "relative mx-4 max-h-[90vh] w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex-1">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-foreground"
            >
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {statusToggle && !statusToggle.isDone && (
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={statusToggle.disabled}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                    "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Open
                  <ChevronDown size={12} />
                </button>

                {showStatusDropdown && (
                  <div className="absolute right-0 top-full z-50 mt-1 min-w-[80px] rounded-lg border border-border bg-card py-1 shadow-lg">
                    <button
                      onClick={() => {
                        statusToggle.onToggle()
                        setShowStatusDropdown(false)
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-green-700 hover:bg-muted"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}
            {statusToggle && statusToggle.isDone && (
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={statusToggle.disabled}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                    "bg-green-100 text-green-700 hover:bg-green-200"
                  )}
                >
                  Done
                  <ChevronDown size={12} />
                </button>

                {showStatusDropdown && (
                  <div className="absolute right-0 top-full z-50 mt-1 min-w-[80px] rounded-lg border border-border bg-card py-1 shadow-lg">
                    <button
                      onClick={() => {
                        statusToggle.onToggle()
                        setShowStatusDropdown(false)
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-yellow-700 hover:bg-muted"
                    >
                      Undone
                    </button>
                  </div>
                )}
              </div>
            )}
            {statusToggle && statusToggle.isDone && (
              <button
                onClick={statusToggle.onToggle}
                disabled={statusToggle.disabled}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                  "bg-green-100 text-green-700 hover:bg-green-200"
                )}
                title="Mark as Open"
              >
                Done
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
