import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ThemeDraw from './pages/ThemeDraw';
import ThemeManagement from './pages/ThemeManagement';
import Submissions from './pages/Submissions';
import SubmitEntry from './pages/SubmitEntry';
import Judging from './pages/Judging';
import Leaderboard from './pages/Leaderboard';
import Resources from './pages/Resources';
import AdminPanel from './pages/AdminPanel';
import UserManagement from './pages/UserManagement';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router basename={BASE_PATH}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="theme" element={
            <PrivateRoute allowedRoles={['Admin']}>
              <ThemeDraw />
            </PrivateRoute>
          } />
          <Route path="theme-management" element={
            <PrivateRoute allowedRoles={['Admin']}>
              <ThemeManagement />
            </PrivateRoute>
          } />
          <Route path="submissions" element={<Submissions />} />
          <Route path="submit" element={
            <PrivateRoute allowedRoles={['Baker']}>
              <SubmitEntry />
            </PrivateRoute>
          } />
          <Route path="judging" element={
            <PrivateRoute allowedRoles={['Judge']}>
              <Judging />
            </PrivateRoute>
          } />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="admin" element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPanel />
            </PrivateRoute>
          } />
          <Route path="users" element={
            <PrivateRoute allowedRoles={['Admin']}>
              <UserManagement />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
