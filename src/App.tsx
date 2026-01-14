import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Backlog from './pages/Backlog';
import Kanban from './pages/Kanban';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './components/theme-provider';
import { useAuthStore } from './store/authStore';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="agile-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
               <Route index element={<Dashboard />} />
               <Route path="backlog" element={<Backlog />} />
               <Route path="kanban" element={<Kanban />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
