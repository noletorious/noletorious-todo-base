import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../theme-provider";
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
} from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { InspirationButton } from "../ui/InspirationButton";

export function Sidebar() {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Auth methods
  const login = () => {
    window.location.href = "/login";
  };

  const logout = async () => {
    await signOut();
  };

  const upgrade = () => {
    navigate("/upgrade");
  };

  const downgrade = () => {
    alert("Downgrade feature for debugging");
  };

  const NavItem = ({
    to,
    icon: Icon,
    label,
    locked = false,
  }: {
    to: string;
    icon: any;
    label: string;
    locked?: boolean;
  }) => {
    const isActive = location.pathname === to;
    const handleClick = () => {
      if (locked) {
        // If dashboard is locked, navigate to upgrade page
        navigate("/upgrade");
      } else {
        setIsOpen(false);
      }
    };

    return (
      <Link
        to={locked ? "#" : to}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          locked && "opacity-50 cursor-not-allowed"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
        {locked && (
          <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
            PRO
          </span>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            A
          </div>
          AgileStart
        </div>
        <button className="md:hidden" onClick={toggleOpen}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          <NavItem to="/backlog" icon={ListTodo} label="Backlog" />
          <NavItem to="/kanban" icon={KanbanSquare} label="Board" />
          <NavItem
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            locked={!user?.isPaid}
          />
        </div>

        <div className="mt-8">
          {!user ? (
            <div className="p-4 bg-muted/50 rounded-xl space-y-3">
              <p className="text-sm text-muted-foreground">
                Log in to sync your tasks.
              </p>
              <button
                onClick={login}
                className="w-full flex items-center gap-2 justify-center bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                <LogIn size={18} /> Log In
              </button>
              <button
                onClick={upgrade}
                className="w-full flex items-center gap-2 justify-center border-2 border-primary text-primary py-2 rounded-lg font-bold hover:bg-primary/5 transition"
              >
                <CreditCard size={18} /> UPGRADE
              </button>
            </div>
          ) : !user.isPaid ? (
            <div className="space-y-4">
              <button
                onClick={upgrade}
                className="w-full flex items-center gap-2 justify-center bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all transform key-upgrade-btn"
              >
                UPGRADE TO PRO
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 justify-center bg-muted text-muted-foreground py-2 rounded-lg font-medium hover:bg-destructive hover:text-destructive-foreground transition"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <p className="text-sm font-medium text-green-600">
                  You are a PRO member
                </p>
                <button
                  onClick={downgrade}
                  className="text-xs underline text-muted-foreground mt-1"
                >
                  Downgrade (Debug)
                </button>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 justify-center bg-muted text-muted-foreground py-2 rounded-lg font-medium hover:bg-destructive hover:text-destructive-foreground transition"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="border-t border-border">
          {/* Advertisement section for non-premium users */}
          {!user.isPaid && (
            <div className="p-4 border-b border-border">
              <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-xl text-center">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  Advertisement
                </p>
                <p className="text-sm text-muted-foreground">
                  Get the best coffee while you work! ☕️
                </p>
              </div>
            </div>
          )}

          {/* Inspiration and Theme toggle */}
          <div className="p-4 flex items-center justify-between">
            <InspirationButton />
            <div className="flex bg-muted rounded-full p-1">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  theme === "light"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  theme === "system"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <span className="text-[10px] font-bold">A</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  theme === "dark"
                    ? "bg-background shadow text-foreground"
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
  );

  return (
    <>
      {/* Mobile Toggle - Only show when not authenticated or on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleOpen}
          className="p-2 bg-card border border-border rounded-lg shadow-sm hover:bg-muted transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar - Always visible on desktop when authenticated */}
      <div className="hidden md:block w-64 h-screen fixed left-0 top-0 z-40">
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-background z-50 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
