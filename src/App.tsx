import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Backlog from './pages/Backlog';
import Kanban from './pages/Kanban';
import Dashboard from './pages/Dashboard';
import { ThemeProvider } from './components/theme-provider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="agile-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
             {/* Default route: Dashboard. It handles its own access control UI. */}
             <Route index element={<Dashboard />} />
             <Route path="backlog" element={<Backlog />} />
             <Route path="kanban" element={<Kanban />} />
             <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
