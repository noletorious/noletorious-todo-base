import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useTodoInitialization } from "../../hooks/useTodoInitialization";

export default function Layout() {
  // Initialize todos when user enters protected routes
  useTodoInitialization();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-4 md:p-8 transition-all duration-200 ease-in-out pt-16 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
