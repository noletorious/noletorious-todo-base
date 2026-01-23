import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useTheme } from "../theme-provider"
import {
  CreditCard,
  LogIn,
  LogOut,
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { UserSettingsButton } from "../ui/UserSettingsModal"

export function Sidebar() {
  const { user, signOut } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => setIsOpen(!isOpen)

  // Auth methods
  const login = () => {
    window.location.href = "/login"
  }

  const logout = async () => {
    await signOut()
  }

  const upgrade = () => {
    navigate("/upgrade")
  }

  const downgrade = () => {
    alert("Downgrade feature for debugging")
  }

  const NavItem = ({
    to,
    icon: Icon,
    label,
    locked = false,
  }: {
    to: string
    icon: any
    label: string
    locked?: boolean
  }) => {
    const isActive = location.pathname === to
    const handleClick = () => {
      if (locked) {
        // If dashboard is locked, navigate to upgrade page
        navigate("/upgrade")
      } else {
        setIsOpen(false)
      }
    }

    return (
      <Link
        to={locked ? "#" : to}
        onClick={handleClick}
        className={cn(
          "mb-1 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
          isActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          locked && "cursor-pointer opacity-50"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
        {locked && (
          <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            PRO
          </span>
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col border-r border-border bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            A
          </div>
          AgileStart
        </div>
        <button className="md:hidden" onClick={toggleOpen}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/backlog" icon={ListTodo} label="Backlog" />
          <NavItem to="/kanban" icon={KanbanSquare} label="Board" />
        </div>

        <div className="mt-8">
          {!user ? (
            <div className="space-y-3 rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Log in to sync your tasks.
              </p>
              <button
                onClick={login}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <LogIn size={18} /> Log In
              </button>
              <button
                onClick={upgrade}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary py-2 font-bold text-primary transition hover:bg-primary/5"
              >
                <CreditCard size={18} /> UPGRADE
              </button>
            </div>
          ) : !user.isPaid ? (
            <div className="space-y-4">
              <button
                onClick={upgrade}
                className="key-upgrade-btn flex w-full transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                UPGRADE TO PRO
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-2 font-medium text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
                <p className="text-sm font-medium text-green-600">
                  You are a PRO member
                </p>
                <button
                  onClick={downgrade}
                  className="mt-1 text-xs text-muted-foreground underline"
                >
                  Downgrade (Debug)
                </button>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-2 font-medium text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="border-t border-border">
          {/* Support link saved: https://buymeacoffee.com/noletorious */}
          
          {/* User Settings and Theme toggle */}
          <div className="flex items-center justify-between p-4">
            <UserSettingsButton />
            <div className="flex rounded-full bg-muted p-1">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "rounded-full p-1.5 transition-all",
                  theme === "light"
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground"
                )}
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "rounded-full p-1.5 transition-all",
                  theme === "system"
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground"
                )}
              >
                <span className="text-[10px] font-bold">A</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "rounded-full p-1.5 transition-all",
                  theme === "dark"
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground"
                )}
              >
                <Moon size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Toggle - Only show when not authenticated or on small screens */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <button
          onClick={toggleOpen}
          className="rounded-lg border border-border bg-card p-2 shadow-sm transition-colors hover:bg-muted"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar - Always visible on desktop when authenticated */}
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-64 md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Slide in) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleOpen}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-gray-50 shadow-2xl dark:bg-gray-900 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
