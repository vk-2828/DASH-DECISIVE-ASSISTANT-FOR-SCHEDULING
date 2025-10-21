import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './index.css';

import { AuthProvider, default as AuthContext } from './context/AuthProvider';
import { TaskProvider } from './context/TaskProvider';
import RootLayout from './components/RootLayout';
import DashboardLayout from './components/DashboardLayout';

import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import VerifyOtpPage from './components/VerifyOtpPage';
import AllTasksPage from './components/AllTasksPage';
import StarredTasksPage from './components/StarredTasksPage';
import CompletedTasksPage from './components/CompletedTasksPage';
import TrashPage from './components/TrashPage';
import ProfilePage from './components/ProfilePage';
import CalendarPage from './components/CalendarPage';
import NotificationsPage from './components/NotificationsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? <Navigate to="/tasks" replace /> : children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          <Route element={<PublicRoute><RootLayout /></PublicRoute>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          <Route path="/*" element={
            <ProtectedRoute>
              <TaskProvider>
                <DashboardLayout />
              </TaskProvider>
            </ProtectedRoute>
          }>
            <Route path="tasks" element={<AllTasksPage />} />
            <Route path="tasks/starred" element={<StarredTasksPage />} />
            <Route path="tasks/completed" element={<CompletedTasksPage />} />
            <Route path="tasks/trash" element={<TrashPage />} />
            <Route path="tasks/calendar" element={<CalendarPage />} />
            <Route path="tasks/notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);