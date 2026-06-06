import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Monitors from './pages/Monitors';
import MonitorDetail from './pages/MonitorDetail';
import Incidents from './pages/Incidents';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public routes — no sidebar */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — inside sidebar layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/"              element={<Dashboard />} />
                  <Route path="/monitors"      element={<Monitors />} />
                  <Route path="/monitors/:id"  element={<MonitorDetail />} />
                  <Route path="/incidents"     element={<Incidents />} />
                  <Route path="*"              element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
